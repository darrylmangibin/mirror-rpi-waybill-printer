# Getting Started with RPI Waybill Printer

This guide helps you choose the best setup method for your needs.

## Choose Your Setup Method

### 🐳 Docker (Recommended for Development)

**Best for:** Developers on any OS (Linux, macOS, Windows)

**Pros:**

- ✅ Works identically on all operating systems
- ✅ No manual dependency installation
- ✅ Isolated environment
- ✅ Easy cleanup and reset
- ✅ Start with one command

**Cons:**

- ❌ Requires Docker installation (~2GB)
- ❌ Slightly more resource usage

**Quick Start:**

```bash
./docker-start.sh
```

See [DOCKER_README.md](DOCKER_README.md) for details.

---

### 🔧 Native Installation (Production)

**Best for:** Raspberry Pi/Chromebook production deployment

**Pros:**

- ✅ Direct system access
- ✅ Lower resource usage
- ✅ Systemd integration for auto-start
- ✅ Native performance

**Cons:**

- ❌ Linux only
- ❌ Manual dependency management
- ❌ Platform-specific setup

**Quick Start:**

```bash
chmod +x install.sh
sudo ./install.sh
```

---

## Comparison Table

| Feature                   | Docker                | Native        |
| ------------------------- | --------------------- | ------------- |
| **OS Support**            | Linux, macOS, Windows | Linux only    |
| **Setup Time**            | 5 minutes             | 15-20 minutes |
| **Disk Space**            | ~2GB                  | ~500MB        |
| **Hot Reload**            | ✅ Yes                | ✅ Yes        |
| **Printer Access**        | ✅ Linux only         | ✅ All Linux  |
| **Auto-start on Boot**    | Configure separately  | ✅ Built-in   |
| **Environment Isolation** | ✅ Full               | ❌ None       |
| **Resource Usage**        | Medium                | Low           |

---

## Decision Guide

**Choose Docker if:**

- You're developing on macOS or Windows
- You want a consistent environment across team members
- You value quick setup and easy cleanup
- You're comfortable with containers

**Choose Native Installation if:**

- You're deploying to production (Raspberry Pi/Chromebook)
- You need the absolute best performance
- You want systemd service integration
- Docker isn't available or suitable

---

## Both Methods Support

Both setups provide the same features:

- ✅ Flask backend with SocketIO
- ✅ React frontend with hot reload
- ✅ SQLite database
- ✅ Automatic cleanup jobs
- ✅ Waybill printing
- ✅ QR code generation
- ✅ Health monitoring

---

## Switching Between Methods

You can use both on the same machine without conflicts:

**Start with Docker (Development):**

```bash
docker-compose up
```

**Deploy with Native (Production):**

```bash
sudo ./install.sh
```

They use the same codebase but different execution environments.

---

## Next Steps

### For Docker Setup:

1. Install Docker Desktop
2. Run `./docker-start.sh`
3. Read [DOCKER_README.md](DOCKER_README.md)

### For Native Setup:

1. Run `sudo ./install.sh`
2. Configure systemd with `sudo ./installers/setup-systemd.sh`
3. Read [README.md](README.md)

---

## Need Help?

- **Docker Issues**: See [DOCKER_README.md](DOCKER_README.md) troubleshooting section
- **Native Issues**: Check installer logs in your terminal
- **API Documentation**: See [API_ROUTES.md](API_ROUTES.md)
- **Environment Config**: Check `.env.example` and `frontend/.env.example`

---

## Recommended Workflow

**For Development Teams:**

1. Use Docker during development (all platforms)
2. Test with `docker-compose up`
3. Deploy to production with native installation
4. Use the same `.env` files for consistency

**For Solo Developers:**

- **On Raspberry Pi**: Use native installation directly
- **On Mac/Windows**: Use Docker for development, test on actual Pi before deploying
