# Makefile for RPI Waybill Printer

.PHONY: help docker-up docker-down docker-restart docker-logs docker-build docker-clean install dev run clean

# Default target
help:
	@echo "RPI Waybill Printer - Available Commands"
	@echo ""
	@echo "Docker Commands (Cross-Platform):"
	@echo "  make docker-up        - Start Docker containers"
	@echo "  make docker-down      - Stop Docker containers"
	@echo "  make docker-restart   - Restart Docker containers"
	@echo "  make docker-logs      - View Docker logs (follow mode)"
	@echo "  make docker-build     - Rebuild Docker images"
	@echo "  make docker-clean     - Remove containers, images, and volumes"
	@echo ""
	@echo "Native Commands (Linux only):"
	@echo "  make install          - Install dependencies (requires sudo)"
	@echo "  make dev              - Start development servers (backend + frontend)"
	@echo "  make run              - Start backend only"
	@echo "  make clean            - Clean Python cache and logs"
	@echo ""
	@echo "Database Commands:"
	@echo "  make migrate          - Create a new migration"
	@echo "  make migrate-up       - Apply pending migrations"
	@echo "  make migrate-down     - Rollback last migration"
	@echo ""

# Docker commands
docker-up:
	@echo "🐳 Starting Docker containers..."
	docker-compose up -d
	@echo "✅ Containers started"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:5000"

docker-down:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

docker-restart:
	@echo "🔄 Restarting Docker containers..."
	docker-compose restart

docker-logs:
	@echo "📋 Viewing Docker logs (Ctrl+C to exit)..."
	docker-compose logs -f

docker-build:
	@echo "🔨 Rebuilding Docker images..."
	docker-compose up --build -d

docker-clean:
	@echo "🧹 Cleaning Docker resources..."
	docker-compose down -v
	docker-compose rm -f
	@echo "✅ Docker cleanup complete"

# Native installation commands
install:
	@echo "📦 Installing dependencies..."
	chmod +x install.sh
	sudo ./install.sh

dev:
	@echo "🚀 Starting development servers..."
	./dev.sh

run:
	@echo "🚀 Starting backend server..."
	./run.sh

clean:
	@echo "🧹 Cleaning cache and logs..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf app/logs/*.log
	@echo "✅ Cleanup complete"

# Database commands
migrate:
	@read -p "Enter migration message: " msg; \
	flask db migrate "$$msg"

migrate-up:
	@echo "⬆️  Applying migrations..."
	flask db upgrade

migrate-down:
	@echo "⬇️  Rolling back migration..."
	flask db downgrade

# Production deployment
systemd-setup:
	@echo "⚙️  Setting up systemd services..."
	chmod +x installers/setup-systemd.sh
	sudo ./installers/setup-systemd.sh

# Check status
status:
	@echo "📊 Service Status:"
	@if command -v docker-compose &> /dev/null; then \
		echo "Docker:"; \
		docker-compose ps; \
	fi
	@if command -v systemctl &> /dev/null; then \
		echo "\nSystemd:"; \
		systemctl status rpi-waybill-printer-backend.service --no-pager 2>/dev/null || echo "Not running"; \
		systemctl status rpi-waybill-printer-frontend.service --no-pager 2>/dev/null || echo "Not running"; \
	fi

# Quick test
test:
	@echo "🧪 Testing API health..."
	@curl -s http://localhost:5000/api/health | python -m json.tool || echo "Backend not responding"
