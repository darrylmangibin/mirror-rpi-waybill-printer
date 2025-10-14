# 🧠 Raspberry Pi Waybill Printer Plan

## 🎯 Goal
Enable **multiple mobile devices** to print **PDF waybills/invoices** quickly and reliably through a **local Raspberry Pi print server**, minimizing **Bluetooth latency** and **internet dependency**.

---

## ⚙️ System Overview

**Architecture Flow:**
```
[Mobile Phones]
     ↓ (Send invoice_number + PDF URL)
[Raspberry Pi Print Server]
     ↓ (Downloads + Converts PDF if needed)
[Connected Printer via USB/Ethernet]
     ↓
[Physical Waybill Printout]
```

---

## 🧩 Components

| Component | Description |
|------------|--------------|
| **Raspberry Pi** | Acts as local print server. Handles all print jobs from phones. |
| **Printer** | Preferably USB or network-connected thermal/laser printer. |
| **CUPS** | (Common Unix Printing System) manages print queues and drivers. |
| **Python/Node.js Service** | Listens for print requests and triggers jobs. |
| **Local Network (WiFi)** | Shared WiFi (or hotspot) where phones and Pi are connected. |
| **API Endpoint** | Receives `{ invoice_number, pdf_url }` and queues print. |

---

## 🪶 Workflow

1. **Mobile app/web sends print request**
   ```json
   {
     "invoice_number": "INV-2025-00123",
     "pdf_url": "https://server.com/invoices/INV-2025-00123.pdf"
   }
   ```

2. **Raspberry Pi service**:
   - Downloads PDF.
   - Optionally caches it locally (`/tmp/waybills`).
   - Sends print command to CUPS.

3. **Printer prints waybill instantly** (no Bluetooth lag).

4. **Response sent back** (e.g., `{"status":"printed","job_id":123}`).

---

## 🧠 Key Design Decisions

| Concern | Recommended Approach |
|----------|----------------------|
| **Latency** | Use local WiFi instead of Bluetooth. |
| **Reliability** | Cache PDF locally before print. |
| **Offline printing** | Allow queued prints if internet is lost; process when connection resumes. |
| **Multi-device access** | Use simple REST API endpoint or socket server for concurrent requests. |
| **Scalability** | Can later deploy multiple Pi units (per branch). |
| **Error Handling** | Log failed prints and retries automatically. |

---

## 🔐 Optional Enhancements

- ✅ **Web UI for admins** — View print logs, queue, and reprint jobs.
- ✅ **Authentication token** for mobile devices.
- ✅ **Print status listener** using CUPS `lpstat`.
- ✅ **MQTT / WebSocket** for faster command dispatch.
- ✅ **Auto reconnect on power loss**.

---

## 🧰 Tools & Tech to Research

| Category | Tools / Topics |
|-----------|----------------|
| **Printing** | CUPS, lpadmin, lpstat, lp command |
| **Backend** | Flask / FastAPI (Python) or Express.js (Node.js) |
| **PDF Handling** | `pdfkit`, `PyMuPDF`, or `qpdf` |
| **Networking** | mDNS/Bonjour for local service discovery |
| **Performance** | Caching PDFs, async job queue (Celery, BullMQ) |
| **Monitoring** | Systemd service logs, health checks |

---

## 🧾 Example Setup Script Outline

```bash
# Install printing system
sudo apt update && sudo apt install cups -y
sudo usermod -a -G lpadmin pi

# Enable CUPS web interface
sudo cupsctl --remote-admin --remote-any

# Install Python deps
pip install flask requests PyPDF2

# Connect printer and test
lpstat -p -d
```

---

## 🪜 Next Steps

1. [ ] Prototype local Flask API to receive print requests.  
2. [ ] Test printing a static PDF file.  
3. [ ] Integrate `pdf_url` download and queue logic.  
4. [ ] Add logging and error retries.  
5. [ ] Add mobile integration endpoint.  
6. [ ] Optional: Create lightweight admin dashboard.
