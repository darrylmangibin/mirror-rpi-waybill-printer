# Architecture Context

## Stack

| Layer | Technology | Role |
| ----- | ---------- | ---- |
| Backend framework | Flask 3 + Flask Blueprints | Local HTTP API for health checks, waybill print requests, file preview/download, printer status, and network information. |
| Backend realtime | Server-Sent Events + Flask-SocketIO dependency | Pushes or supports live client updates for waybill status changes; the React UI also uses polling as a fallback. |
| Backend validation | Flask-Sieve request validators | Validates incoming waybill, status-change, and cleanup payloads before controller/action execution. |
| Backend persistence | Flask-SQLAlchemy + SQLite | Stores local waybill print metadata, download state, print state, retry metadata, and CUPS job references in `fusion_printer.db`. |
| Migrations | Flask-Migrate/Alembic | Manages schema evolution for the local SQLite database. |
| Background work | Python threads + in-process queues + APScheduler | Runs download/retry/print workers, print-job monitoring, and automatic cleanup inside the Flask process. |
| File storage | Local filesystem under `app/storage/waybills` | Stores downloaded/rendered waybill PDFs/images for previewing and printing. |
| Printing | CUPS through `pycups` | Submits files to the configured local/default thermal printer, tracks CUPS job IDs, checks printer status, and cancels jobs. |
| Document rendering | Requests, Playwright/Chromium, pypdf, Pillow | Downloads waybill files, renders HTML waybills, crops PDFs, and converts PNG labels to PDF when required by the printer. |
| Frontend framework | React 19 + Vite + TypeScript | Operator web UI for waybill print management and shipping manifest workflows. |
| Frontend UI | Tailwind CSS, Radix/shadcn-style UI primitives, TanStack Query/Table | Tables, dialogs, forms, polling/cache invalidation, and responsive operator interactions. |
| Local API client | Axios + `VITE_API_URL` | Calls the local Flask backend at the Raspberry Pi/Linux host address. |
| Remote API client | Axios + FusionTech Nest API + `x-tenant-id` header | Frontend-only integration for shipping manifests, shipping bins/items, queue jobs, and tenant configuration. |
| Deployment | Docker Compose, Dockerfiles, shell installers, systemd services | Runs backend/frontend on Raspberry Pi/Linux, configures CUPS/USB printer access, installs dependencies, and starts services. |

## System Boundaries

- `run.py` — Backend entrypoint. Loads environment variables, creates the Flask app/socket server, and starts the process on the configured host/port.
- `app/__init__.py` — Flask app factory. Owns app configuration, SQLite binding, migrations, CORS, request validation, blueprint registration, CLI commands, worker startup, scheduler startup, SocketIO setup, and `/api/network/local-ip`.
- `app/database.py` — Shared SQLAlchemy database instance for backend models and services.
- `app/config/` — Runtime configuration helpers for environment, printing, and service-level settings such as printer name, label dimensions, cleanup interval, and download/render options.
- `app/services/health/` — Health and printer-status API boundary. Exposes connectivity checks, printer status, stuck-job handling, and cleanup test/status utilities.
- `app/services/waybills/routes/` — Local waybill HTTP API boundary. Owns REST/SSE routes for listing, creating, updating, deleting, downloading, previewing, printing, cancelling, status updates, cleanup, and invoice-based operations.
- `app/services/waybills/controllers/` — Request orchestration for waybill listing, filtering, pagination, creation, updates, and deletion.
- `app/services/waybills/actions/` — Thin use-case layer for single operations such as download, print, cancel, status lookup/change, and cleanup.
- `app/services/waybills/services/` — Domain/service layer for file downloads, marketplace fallback URL resolution, PDF/image processing, CUPS printing, printer checks, and CUPS job monitoring.
- `app/services/waybills/jobs/` — In-process background execution boundary for download queues, retry workers, print queues, scheduled print monitoring, and automatic cleanup.
- `app/services/waybills/models/` — Local database model boundary. Currently owns the `WaybillPrint` schema and serialization.
- `app/migrations/` — Alembic migration boundary for the local SQLite schema.
- `app/storage/` — Runtime file-storage boundary for downloaded/rendered waybill files. Application logic may write here; source changes should not treat it as code.
- `app/logs/` — Runtime log-output boundary.
- `frontend/src/App.tsx` and `frontend/src/pages/` — Frontend routing boundary for the home waybill dashboard and shipping manifest pages.
- `frontend/src/modules/Home/` — Local waybill operator UI boundary. Owns waybill tables, dialogs, hooks, local Flask API endpoints, SSE/polling, and actions for create/edit/download/preview/print/cancel/delete/cleanup.
- `frontend/src/modules/ShippingManifest/`, `ShippingBin/`, `ShippingBinItem/`, and `TenantConfiguration/` — Remote Nest API workflow boundary for manifest lists/details, scanned shipping bins/items, queue jobs, retry/sync actions, and tenant configuration.
- `frontend/src/lib/api.ts` — Axios client for local Flask API calls. Uses full URLs built from `VITE_API_URL`.
- `frontend/src/lib/nest.api.ts` — Axios client for FusionTech Nest API calls. Adds `x-tenant-id` and targets the remote production API by default.
- `frontend/src/components/ui/` — Shared generated/library-style UI primitives used by the frontend modules.
- `docker-compose*.yml`, `Dockerfile.*`, `docker.sh`, `install.sh`, `installers/`, `*.service`, and operational scripts — Device deployment and operations boundary. Own Docker mode selection, dependency installation, environment setup, CUPS configuration, USB printer access, systemd setup, diagnostics, startup, and update flows.

## Storage Model

- **SQLite database (`app/instance/fusion_printer.db`)**: Local operational database for waybill print records. The `waybill_prints` table stores tenant ID, invoice number, marketplace, source/fallback waybill URL, download status, local file path, download errors, retry counters/timestamps, print status, CUPS job ID, printer name, print errors, completion timestamps, and `auto_print` state.
- **Local waybill file storage (`app/storage/waybills`)**: Downloaded or rendered waybill files used for previewing and CUPS printing. Files are referenced by `WaybillPrint.local_file_path` and may be cleaned up with their database records.
- **Local logs (`app/logs`)**: Backend runtime logs for API, worker, scheduler, download, print, and cleanup behavior.
- **Frontend build output (`frontend/dist`)**: Generated static frontend assets. This is build output, not source state.
- **Runtime configuration (`.env`, `.env.docker`, `frontend/.env`)**: Host, port, debug mode, cleanup thresholds, local API URL, printer configuration, and frontend environment values. These are local deployment inputs, not application-owned persisted data.
- **Remote FusionTech Nest API**: Owns shipping manifest, shipping bin, shipping bin item, queue job, and tenant configuration data used by frontend modules. This repository does not persist those remote resources locally.
- **CUPS spool/printer state**: Owns actual print queue state and job lifecycle outside the app. The app stores only the CUPS job ID and derived print status/error metadata.

## Auth and Access Model

- The local Flask backend has no built-in user login, role model, or token enforcement in the current implementation.
- Local API access is network-based: clients that can reach the Raspberry Pi/Linux host and backend port can call the health and waybill endpoints.
- Waybill isolation is enforced at the data-query level for invoice-based operations by requiring both `invoice_number` and `tenant_id` and selecting the latest matching record for that tenant/invoice pair.
- Standard ID-based waybill routes operate by local `WaybillPrint` ID and should not be exposed beyond trusted local-network/operator contexts without adding authentication and authorization.
- The React local API client does not attach auth credentials to Flask requests.
- FusionTech Nest API calls are made from the frontend with an `x-tenant-id` header resolved from a provided tenant ID, `VITE_NEST_TENANT_ID`, or a default staging tenant.
- The remote Nest API owns authentication/authorization semantics for shipping manifest and tenant configuration resources; this repository only supplies the tenant header currently encoded in the frontend client.
- CUPS access depends on host/container privileges, configured printer permissions, and system installation scripts, not app-level user authorization.

## Invariants

1. Local waybill print records must preserve tenant/invoice isolation for invoice-based print, status, and cancel operations.
2. A waybill file must exist locally before it is submitted to CUPS for printing.
3. CUPS job lifecycle state must remain synchronized with `WaybillPrint` fields: `cups_job_id`, `printer_name`, `print_status`, `print_error`, and `print_completed_at`.
4. Download state and print state are separate concerns: download status tracks file acquisition/rendering, while print status tracks CUPS submission and completion/cancellation/error.
5. Background workers and scheduled jobs must run with a valid Flask app context before reading or writing SQLAlchemy models.
6. The Flask/Werkzeug reloader must stay disabled for normal backend startup because workers and schedulers are initialized in-process and duplicate initialization can create duplicate queues/jobs.
7. Automatic cleanup must only delete records/files older than the configured threshold and must not delete current/recent operational records.
8. Runtime data directories (`app/instance`, `app/storage`, `app/logs`) are persistent local state and must not be treated as source code or regenerated casually.
9. The local Flask API remains the owner of waybill printing and CUPS behavior; the remote FusionTech Nest API remains the owner of shipping manifest, shipping bin/item, and tenant configuration data.
10. Frontend calls to the local Flask API must use the configured local backend URL so other devices can reach the Raspberry Pi/Linux print station over the network.
11. Frontend calls to the remote Nest API must preserve the `x-tenant-id` header behavior.
12. Docker and systemd deployment paths must preserve backend port `5000`, frontend port `5173`, persistent mounts for database/logs/storage, and USB/CUPS printer access unless the task explicitly changes deployment architecture.
13. Printer setup and real print submission are hardware-affecting operations; changes must be verified safely and must not assume CUPS or a printer exists in every development environment.
