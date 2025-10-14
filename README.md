# 🖨️ Waybill Printer - Local Print Server

A Raspberry Pi-based print server that allows multiple mobile devices to print PDF waybills/invoices with minimal latency through a local network connection.

## 🎯 Features

- 📱 **Mobile Integration** - Send print jobs via local IP address
- 🖨️ **Queue Management** - Jobs are queued and processed sequentially  
- 📊 **Real-time Dashboard** - Monitor print jobs (Pending, In Progress, Completed, Failed)
- 🔄 **Auto-start** - Raspberry Pi boots directly to dashboard
- 🌐 **Multi-device** - Support multiple phones/devices simultaneously
- ⚡ **Fast Response** - ~15ms job creation, no Bluetooth latency

---

## 📦 Installation

### For Windows WSL (Development)

```bash
# 1. Clone repository
git clone https://github.com/komento-sideprojects/rpi-waybill-printer.git
cd waybill-printer

# 2. Run setup script
chmod +x setup/setup_wsl.sh
./setup/setup_wsl.sh
```

### For Raspberry Pi (Production)

```bash
# 1. Clone repository  
git clone https://github.com/komento-sideprojects/rpi-waybill-printer.git
cd waybill-printer

# 2. Run setup script
chmod +x setup/setup_pi.sh
sudo ./setup/setup_pi.sh

# 3. Reboot (services start automatically)
sudo reboot
```

---

## 🚀 How to Run the Project

### Start the Server (ONCE per session)

```bash
cd backend
./run.sh
```

**Expected output:**
```
🚀 Starting Flask app...
🌐 Open: http://localhost:5000
 * Running on http://127.0.0.1:5000
 * Debug mode: on
 * Debugger is active!
```

### Test the Server

**In Browser:** http://localhost:5000

**With curl:**
```bash
curl http://localhost:5000
```

**Expected response:** `Hello! Waybill Printer API is running!`

---

## 🔄 Development Workflow

1. **Start server:** `./run.sh` (run ONCE)
2. **Keep terminal open** - server runs continuously
3. **Edit code** - Flask auto-reloads on changes
4. **Test immediately** - refresh browser or use curl
5. **Stop server:** Press `Ctrl+C`

---

## 🛠️ Troubleshooting

### "Port 5000 already in use"
```bash
# Kill processes on port 5000
lsof -ti:5000 | xargs kill -9

# Then start again
./run.sh
```

### "python: command not found"
```bash
# Use python3 instead
python3 app.py

# Or create alias
echo "alias python=python3" >> ~/.bashrc
source ~/.bashrc
```

---

## 📱 API Usage

### Create Print Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"invoice_number": "INV-001", "pdf_url": "https://example.com/invoice.pdf"}'
```

### Check Jobs
```bash
curl http://localhost:5000/api/jobs
```

### Get Statistics
```bash
curl http://localhost:5000/api/stats
```

---

## 📚 Project Structure

```
waybill-printer/
├── README.md                    # This file
├── backend/
│   ├── app.py                  # Flask API
│   ├── requirements.txt        # Python dependencies
│   └── run.sh                 # Start script
├── setup/
│   ├── setup_wsl.sh           # WSL installer
│   └── setup_pi.sh            # Pi installer
└── .gitignore                 # Git ignore rules
```

---

## 📄 License

MIT License - See LICENSE file for details.