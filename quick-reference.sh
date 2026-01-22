#!/bin/bash
# Quick Reference Card for RPI Waybill Printer

cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║         RPI WAYBILL PRINTER - QUICK REFERENCE                ║
╚══════════════════════════════════════════════════════════════╝

🐳 DOCKER COMMANDS (All OS)
────────────────────────────────────────────────────────────────
  Start Everything:        ./docker-start.sh
                           docker-compose up
                           make docker-up

  Stop Everything:         docker-compose down
                           make docker-down

  View Logs:               docker-compose logs -f
                           make docker-logs

  Restart:                 docker-compose restart
                           make docker-restart

  Rebuild:                 docker-compose up --build
                           make docker-build

  Clean Slate:             docker-compose down -v
                           make docker-clean

🔧 NATIVE COMMANDS (Linux Only)
────────────────────────────────────────────────────────────────
  Install:                 sudo ./install.sh
                           make install

  Dev Mode:                ./dev.sh
                           make dev

  Backend Only:            ./run.sh
                           make run

  Setup Systemd:           sudo ./installers/setup-systemd.sh
                           make systemd-setup

📊 ACCESS URLS
────────────────────────────────────────────────────────────────
  Frontend:                http://localhost:5173
  Backend API:             http://localhost:5000
  Health Check:            http://localhost:5000/api/health

🗂️ DATABASE MIGRATIONS
────────────────────────────────────────────────────────────────
  Create Migration:        flask db migrate "message"
                           make migrate

  Apply Migration:         flask db upgrade
                           make migrate-up

  Rollback:                flask db downgrade
                           make migrate-down

🔍 DEBUGGING
────────────────────────────────────────────────────────────────
  Container Shell:         docker-compose exec backend bash
                           docker-compose exec frontend sh

  Check Status:            docker-compose ps
                           make status

  Check Health:            curl http://localhost:5000/api/health
                           make test

  Resource Usage:          docker stats

  System Info:             docker info

📁 IMPORTANT FILES
────────────────────────────────────────────────────────────────
  Docker Docs:             DOCKER_README.md
  Getting Started:         GETTING_STARTED.md
  Verification:            DOCKER_VERIFICATION.md
  Implementation:          DOCKER_IMPLEMENTATION.md
  API Docs:                API_ROUTES.md

🆘 TROUBLESHOOTING
────────────────────────────────────────────────────────────────
  Port Conflict:           lsof -i :5000
                           lsof -i :5173
                           kill -9 <PID>

  Permission Issues:       sudo chown -R $USER:$USER app/

  Clean Rebuild:           docker-compose down -v
                           docker-compose up --build

  View All Logs:           docker-compose logs -f

  Container Won't Start:   docker-compose down
                           docker system prune -a
                           docker-compose up --build

🚀 QUICK START
────────────────────────────────────────────────────────────────
  New Developer:
    1. git clone <repo>
    2. cd rpi-waybill-printer
    3. ./docker-start.sh
    4. Open http://localhost:5173

  Production Deploy:
    1. git pull
    2. sudo ./install.sh
    3. sudo ./installers/setup-systemd.sh

💡 TIPS
────────────────────────────────────────────────────────────────
  • Use Docker for development (any OS)
  • Use native install for production (Linux/Pi)
  • Hot reload works in both backend and frontend
  • Database persists even after docker-compose down
  • Check DOCKER_README.md for detailed docs
  • Use make help for all available commands

📞 NEED HELP?
────────────────────────────────────────────────────────────────
  1. Check DOCKER_README.md troubleshooting
  2. Run: docker-compose logs -f
  3. Run: make status
  4. Verify: docker info

═══════════════════════════════════════════════════════════════

For detailed documentation, see:
  • GETTING_STARTED.md - Choose Docker or Native
  • DOCKER_README.md - Complete Docker guide
  • DOCKER_VERIFICATION.md - Test your setup
  • DOCKER_IMPLEMENTATION.md - Implementation details

═══════════════════════════════════════════════════════════════
EOF
