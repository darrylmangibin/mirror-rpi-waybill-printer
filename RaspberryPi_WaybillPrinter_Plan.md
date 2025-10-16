# 🧠 Raspberry Pi Waybill Printer - Project Plan

## 🎯 Project Goal
Enable **multiple mobile devices** to print **PDF waybills/invoices** with **minimal latency** through a **local Raspberry Pi print server** with a **real-time dashboard** to monitor print jobs.

### Key Requirements
- Mobile phones connect to Pi via **local IP address** (e.g., `192.168.1.100`)
- Mobile sends: `invoice_number` + `pdf_url`
- Pi downloads PDF and queues print jobs
- **Dashboard UI** showing:
  - List of all print jobs (Pending, In Progress, Completed, Failed)
  - Real-time counts for each status
  - Job history

---

## ⚙️ System Architecture

**High-Level Flow:**
```
[Mobile Phones on WiFi]
     ↓ 
     POST http://192.168.1.100:5000/api/jobs
     {invoice_number, pdf_url}
     ↓
[Raspberry Pi - Local Print Server]
     ├─ Flask API (receives requests)
     ├─ SQLite Database (stores jobs locally)
     ├─ Background Worker (downloads PDFs, prints)
     └─ React Dashboard (monitors jobs)
     ↓
[CUPS Print System]
     ↓
[USB/Network Printer]
     ↓
[Physical Waybill Printed]
```

---

## 🧩 Core Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Raspberry Pi** | Local server | Hosts entire system |
| **Flask API** | Python backend | REST endpoints for mobile |
| **SQLite Database** | Local database | Store job queue & history |
| **Background Worker** | Python thread | Download PDFs & print |
| **CUPS** | Print system | Manage printer & queue |
| **React Dashboard** | Web UI | Monitor jobs & stats |
| **Local WiFi** | Network | Mobile ↔ Pi communication |

---

## 🪶 Job Workflow

### 1. Mobile Creates Job
```
POST /api/jobs
{
  "invoice_number": "INV-2025-00123",
  "pdf_url": "https://server.com/invoices/INV-2025-00123.pdf"
}

Response: 201 Created (fast ~15ms response)
```

### 2. Job Stored Locally
- Saved to SQLite with status: `pending`
- Job ID generated
- Mobile receives immediate confirmation

### 3. Background Worker Processes
- Polls SQLite for `pending` jobs
- Updates status to `in_progress`
- Downloads PDF from URL
- Caches PDF locally (`/tmp/waybills/`)
- Sends to CUPS printer
- Updates status to `completed` or `failed`

### 4. Dashboard Updates
- Shows real-time counts
- Lists all jobs with filters
- Auto-refreshes via SSE or polling

---

## 🎨 Dashboard Features

### Status Counts (Top Cards)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Pending    │ In Progress │  Completed  │   Failed    │
│     12      │      2      │     458     │      3      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Job List (Table)
| Invoice # | PDF URL | Status | Created | Duration |
|-----------|---------|--------|---------|----------|
| INV-00123 | https://... | Completed | 2:30 PM | 3s |
| INV-00124 | https://... | In Progress | 2:31 PM | - |
| INV-00125 | https://... | Pending | 2:32 PM | - |

---

## 🧠 Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| **Database** | SQLite (local) | Minimal latency, works offline, simple |
| **Backend** | Flask | Lightweight, perfect for Pi, easy to learn |
| **Job Queue** | SQLite + Python threading | No Redis overhead, sufficient for single printer |
| **Frontend** | React (static build) | Modern UI, build on WSL, deploy static files |
| **Real-time** | Server-Sent Events (SSE) | Lighter than WebSocket, easy Flask integration |
| **Networking** | Local IP on WiFi | No Bluetooth lag, multi-device support |
| **PDF Storage** | Temporary cache | Download once, print fast, cleanup old files |

---

## 🚀 Technology Stack (Final)

### Backend (Raspberry Pi)
- **Language:** Python 3.9+
- **Web Framework:** Flask + Flask-SQLAlchemy (optional ORM)
- **Database:** SQLite3 with WAL mode for concurrent access
- **Database Libraries:** sqlite3 (built-in) + contextlib for connection management
- **PDF Handling:** requests + PyMuPDF (optional validation)
- **Printing:** CUPS + pycups
- **Background Tasks:** Python threading + queue
- **Process Manager:** systemd (auto-start on boot)
- **Logging:** Python logging with rotating file handler

### Frontend (Dashboard)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Build:** Static files (no Node.js on Pi)
- **Updates:** SSE or polling every 3s

### Development Environment
- **WSL:** Develop and build everything
- **Deploy:** Copy files to Raspberry Pi
- **Test:** Use mock printer or CUPS on WSL

---

## 📁 Project Structure

```
waybill-printer/
├── backend/
│   ├── app.py              # Flask API (POST /api/jobs, GET /api/stats)
│   ├── worker.py           # Background worker thread
│   ├── database.py         # SQLite models & queries
│   ├── printer.py          # CUPS integration
│   ├── requirements.txt    # Python dependencies
│   ├── config.py           # Configuration
│   ├── waybill.db          # SQLite database file (created at runtime)
│   └── migrations/         # Database schema migrations
│       └── init_schema.sql # Initial database schema
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components (JobCard, StatusBadge)
│   │   ├── pages/          # Dashboard.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── setup/
│   ├── install.sh          # Install CUPS, Python, dependencies
│   ├── setup_service.sh    # Create systemd services
│   ├── test_printer.sh     # Test printer connection
│   ├── backup_db.sh        # Database backup script
│   └── cleanup_db.sh       # Database maintenance script
│
└── README.md               # Setup & deployment instructions
```

---

## 📊 Database Schema (SQLite)

### Primary Table: print_jobs
```sql
CREATE TABLE print_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    error_message TEXT,
    file_path TEXT,  -- Local path to cached PDF
    file_size INTEGER,  -- PDF file size in bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 0,  -- For future job prioritization
    
    -- Constraints
    UNIQUE(invoice_number),  -- Prevent duplicate invoices
    CHECK(retry_count >= 0),
    CHECK(file_size >= 0 OR file_size IS NULL)
);

-- Indexes for performance
CREATE INDEX idx_print_jobs_status ON print_jobs(status);
CREATE INDEX idx_print_jobs_created_at ON print_jobs(created_at DESC);
CREATE INDEX idx_print_jobs_invoice ON print_jobs(invoice_number);
CREATE INDEX idx_print_jobs_status_created ON print_jobs(status, created_at);
```

### Optional: Job History/Audit Table
```sql
CREATE TABLE job_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (job_id) REFERENCES print_jobs (id) ON DELETE CASCADE
);

CREATE INDEX idx_job_history_job_id ON job_history(job_id);
```

### Database Configuration
```sql
-- Enable WAL mode for better concurrent access
PRAGMA journal_mode = WAL;

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Set reasonable timeout for busy database
PRAGMA busy_timeout = 5000;

-- Optimize for small database size
PRAGMA auto_vacuum = INCREMENTAL;
```

---

## 🗄️ SQLite Implementation Details

### Why SQLite is Perfect for This Project
- **Zero Configuration:** No server setup, no admin overhead
- **ACID Compliance:** Reliable transactions even with power loss
- **Concurrent Access:** WAL mode allows multiple readers + 1 writer
- **Minimal Resources:** ~1-2MB memory footprint on Raspberry Pi
- **File-Based:** Easy backup (just copy the .db file)
- **Built-in Python:** No additional dependencies required

### Performance Optimizations
- **WAL Mode:** Enables concurrent reads while writing
- **Strategic Indexing:** Fast queries on status, created_at, invoice_number
- **Connection Pooling:** Reuse connections to avoid overhead
- **Prepared Statements:** Faster execution and SQL injection prevention
- **Batch Operations:** Group multiple inserts/updates when possible

### Data Integrity Features
- **Unique Constraints:** Prevent duplicate invoice numbers
- **Check Constraints:** Validate status values and retry counts
- **Foreign Keys:** Maintain referential integrity (if using job_history)
- **Transactions:** Atomic operations for status updates

### Backup & Maintenance Strategy
```bash
# Daily backup (via cron)
sqlite3 /path/to/waybill.db ".backup /backup/waybill_$(date +%Y%m%d).db"

# Cleanup old completed jobs (monthly)
sqlite3 /path/to/waybill.db "DELETE FROM print_jobs WHERE status='completed' AND created_at < datetime('now', '-30 days');"

# Vacuum database (monthly)
sqlite3 /path/to/waybill.db "VACUUM;"
```

### Expected Database Growth
- **Per Job:** ~200-500 bytes per record
- **Daily (100 jobs):** ~50KB
- **Monthly (3000 jobs):** ~1.5MB
- **Yearly (36,000 jobs):** ~18MB
- **5 Years:** ~90MB (very manageable)

---

## 🔐 Optional Enhancements (Future)

- 🔒 **API Authentication** - Token-based auth for mobile devices
- 📱 **Mobile App** - Native iOS/Android app (instead of web)
- 🔄 **Auto-retry** - Retry failed jobs automatically
- 📧 **Notifications** - Alert on failures
- 🌐 **mDNS Discovery** - Auto-discover Pi IP (no manual entry)
- ☁️ **Supabase Sync** - Backup jobs to cloud for remote monitoring
- 📈 **Analytics** - Daily/weekly print statistics
- 🖨️ **Multi-Printer** - Support multiple printers per Pi

## 🗺️ Development Roadmap

### Phase 1: Setup & Environment (Week 1)
- [ ] **Setup WSL development environment**
  - Install Python 3.9+, Node.js, CUPS
  - Setup virtual environment
  - Install dependencies

- [ ] **Create project structure**
  - Initialize backend/ and frontend/ folders
  - Setup Git repository
  - Create basic README

### Phase 2: Backend Core (Week 2)
- [ ] **Build Flask API**
  - POST /api/jobs - Create print job
  - GET /api/jobs - List all jobs
  - GET /api/stats - Get status counts
  - GET /api/events - SSE endpoint for real-time

- [ ] **Setup SQLite database**
  - Create database.py with connection management
  - Initialize database with schema (print_jobs table + indexes)
  - Configure WAL mode and pragmas for performance
  - Write database helper functions (CRUD operations)
  - Implement duplicate invoice prevention
  - Add database migration support for future schema changes
  - Test CRUD operations and concurrent access

- [ ] **Test basic API**
  - Use Postman/curl to test endpoints
  - Verify job creation and retrieval

### Phase 3: Print Worker (Week 2-3)
- [ ] **Background worker implementation**
  - Poll SQLite for pending jobs
  - Download PDFs from URLs
  - Cache PDFs locally

- [ ] **CUPS integration**
  - Install and configure CUPS
  - Test printer connection
  - Send PDFs to printer via pycups
  - Handle print errors

- [ ] **Job status management**
  - Update job status (pending → in_progress → completed)
  - Error handling and retry logic
  - Cleanup old PDF files

### Phase 4: Frontend Dashboard (Week 3-4)
- [ ] **Setup React project**
  - Initialize Vite + React
  - Install Tailwind CSS
  - Create component structure

- [ ] **Build dashboard UI**
  - Status count cards (Pending, In Progress, Completed, Failed)
  - Job list table with filters
  - Status badges and formatting
  - Responsive design

- [ ] **Real-time updates**
  - Connect to SSE endpoint or polling
  - Auto-refresh job list
  - Update counts dynamically

- [ ] **Build for production**
  - `npm run build`
  - Test static build locally

### Phase 5: Integration & Testing (Week 4)
- [ ] **End-to-end testing**
  - Mobile → API → Worker → Printer flow
  - Test multiple concurrent jobs
  - Test error scenarios (bad PDF URL, printer offline)

- [ ] **Performance optimization**
  - Check response times
  - Monitor memory usage
  - Optimize database queries

### Phase 6: Deployment to Raspberry Pi (Week 5)
- [ ] **Prepare Raspberry Pi**
  - Install Raspberry Pi OS
  - Configure WiFi and static IP
  - Install dependencies (CUPS, Python, etc.)

- [ ] **Deploy application**
  - Copy backend files to Pi
  - Copy frontend build to Pi
  - Setup systemd services
  - Configure auto-start on boot

- [ ] **Setup printer**
  - Connect printer via USB/Network
  - Install printer drivers
  - Configure CUPS
  - Test print job

- [ ] **Final testing**
  - Test from multiple mobile devices
  - Monitor logs and performance
  - Document any issues

### Phase 7: Production & Monitoring (Ongoing)
- [ ] **Monitoring setup**
  - Check systemd logs
  - Monitor disk space (PDF cache)
  - Track failed jobs

- [ ] **Documentation**
  - User guide for mobile users
  - Admin guide for Pi management
  - Troubleshooting guide

- [ ] **Optional enhancements**
  - Add authentication
  - Implement auto-retry
  - Add Supabase sync backup

---

## 📦 Deliverables

### Minimum Viable Product (MVP)
✅ Mobile can send print jobs via local IP  
✅ Pi downloads PDFs and prints them  
✅ Dashboard shows job status and counts  
✅ Jobs are queued and processed sequentially  
✅ System runs on boot automatically  

### Success Metrics
- Response time: < 20ms for job creation
- Print time: < 10s from job creation to print start
- Uptime: 99%+ reliability
- Concurrent devices: Support 5+ mobile devices

---

## 🛠️ Quick Start Commands

### Development (WSL)
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm run dev
```

### Deployment (Raspberry Pi)
```bash
# Run setup script
cd setup
sudo bash install.sh

# Start services
sudo systemctl start waybill-api
sudo systemctl start waybill-worker
sudo systemctl enable waybill-api
sudo systemctl enable waybill-worker
```

---

## 📚 Resources & References

- **CUPS Documentation:** https://www.cups.org/doc/
- **Flask Documentation:** https://flask.palletsprojects.com/
- **React + Vite:** https://vitejs.dev/guide/
- **Raspberry Pi Setup:** https://www.raspberrypi.org/documentation/
- **systemd Services:** https://www.freedesktop.org/software/systemd/man/systemd.service.html
