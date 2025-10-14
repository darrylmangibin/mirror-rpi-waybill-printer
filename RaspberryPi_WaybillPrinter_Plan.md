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
- **Web Framework:** Flask
- **Database:** SQLite3
- **PDF Handling:** requests + PyMuPDF (optional validation)
- **Printing:** CUPS + pycups
- **Process Manager:** systemd (auto-start on boot)

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
│   └── config.py           # Configuration
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
│   └── test_printer.sh     # Test printer connection
│
└── README.md               # Setup & deployment instructions
```

---

## 📊 Database Schema (SQLite)

```sql
Table: print_jobs
- id (INTEGER PRIMARY KEY)
- invoice_number (TEXT)
- pdf_url (TEXT)
- status (TEXT) -- 'pending', 'in_progress', 'completed', 'failed'
- error_message (TEXT)
- created_at (TIMESTAMP)
- started_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- retry_count (INTEGER)
```

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
  - Create print_jobs table
  - Write database helper functions
  - Test CRUD operations

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
