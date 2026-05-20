# Code Standards

## General

- Keep changes small, single-purpose, and tied to one architecture boundary: local Flask printing API, React operator UI, remote Nest API UI flow, storage/model, background job, or deployment script.
- Fix root causes rather than adding parallel fallback paths or duplicate flows.
- Preserve the local print-station contract: tenant/invoice isolation, local file existence before printing, CUPS job tracking, cleanup safety, and Raspberry Pi resource constraints.
- Do not mix unrelated concerns in one route, component, hook, worker, or deployment change.
- Prefer existing project patterns over new abstractions. This codebase uses Laravel-inspired Flask layers on the backend and module-scoped hooks/services/components on the frontend.
- Log operational backend work through `get_logger(__name__)`; avoid ad-hoc `print` calls outside entrypoint/startup scripts.
- Do not treat runtime data, generated assets, environment files, local databases, logs, or installed dependencies as source code.
- Keep real printer/CUPS behavior explicit. Do not submit real print jobs, alter printer configuration, or change USB/CUPS setup as a side effect of unrelated work.

## Python and Flask Backend

- Keep Flask route functions thin. Routes should parse/request-validate, delegate to controllers or actions, and return JSON/file/SSE responses.
- Use Flask Blueprints for route groups. Waybill routes belong under `app/services/waybills/routes/`; health/printer-status routes belong under `app/services/health/routes/`.
- Validate request payloads with `flask_sieve` FormRequest classes in `requests/` before business logic runs.
- Keep controllers focused on request orchestration such as pagination, filtering, CRUD coordination, and response shaping.
- Keep action classes thin and invokable. Actions should coordinate one use case and delegate business logic to services.
- Put business logic in service classes under `services/`, especially download/rendering, file handling, CUPS printing, printer checks, monitoring, and cleanup.
- Use model classes only for persistence schema, serialization, and intentional ORM lifecycle hooks. Be careful with `WaybillPrint.after_insert`, which queues downloads.
- Use enums for lifecycle/status values instead of scattering string literals across backend code.
- Commit database updates intentionally through `db.session`; on errors, update status/error fields where the existing flow expects observable failure state.
- Keep background workers and APScheduler jobs app-context aware before touching SQLAlchemy models.
- Do not enable the Flask/Werkzeug reloader for normal backend startup because workers and schedulers are initialized in-process.
- Keep CUPS imports optional where development environments may not have printer dependencies installed.
- Keep Raspberry Pi constraints in mind: avoid unnecessary workers, noisy SQL logging, expensive polling, or broad synchronous work in request handlers.
- Prefer cross-platform file handling with `os.path`/`pathlib`, and keep waybill files under `app/storage/waybills`.

## TypeScript

- Keep TypeScript strictness intact; do not suppress type errors with `any`, `@ts-ignore`, or `@ts-expect-error`.
- Define interfaces/types for API data near the module that consumes them, as existing Home, ShippingManifest, ShippingBin, ShippingBinItem, and TenantConfiguration modules do.
- Model known status values as string unions or explicit types instead of broad strings.
- Import types with `import type` when the import is type-only.
- Use the `@/` alias for frontend source imports.
- Keep local Flask API types separate from remote FusionTech Nest API types.
- Do not hardcode local backend URLs in module code; use `VITE_API_URL`, `buildApiUrl`, and endpoint constants.
- Preserve `x-tenant-id` behavior for remote Nest API calls. Tenant selection must flow through `createNestApi`/`nestApi` patterns, not one-off Axios clients.

## React and Frontend Modules

- Keep pages thin. Route pages under `frontend/src/pages/` should delegate to module components.
- Keep feature UI grouped by module under `frontend/src/modules/<Feature>/` with `components/`, `hooks/`, `services/`, `types/`, `constants/`, and `utils/` as needed.
- Use TanStack Query hooks for server state, cache invalidation, retries, and refetch behavior.
- Keep API calls in module service files; components should call hooks or services rather than constructing URLs inline.
- Keep endpoint construction centralized in endpoint/config files, especially for local Flask routes that depend on the device IP/base URL.
- Use controlled local state for dialogs, selected rows, active downloads, filters, and scanner inputs.
- Keep React components focused: split large table/dialog/scanner/status sections into child components when behavior becomes independently testable.
- Use `sonner` toasts for user-visible success/error feedback when an operator action completes or fails.
- For real-time waybill status, preserve SSE plus cache invalidation/polling fallback behavior rather than adding competing refresh mechanisms.

## Styling

- Use Tailwind CSS utility classes and the tokens defined in `frontend/src/index.css`.
- Use shared UI primitives from `frontend/src/components/ui/` for buttons, dialogs, tables, inputs, selects, badges, tooltips, and related controls.
- Use the `cn` helper from `frontend/src/lib/utils.ts` to compose conditional class names.
- Prefer existing Radix/shadcn-style variants over custom one-off component styles.
- Keep visual styling close to the component it affects unless it is a reusable primitive or global token.
- Do not modify shared UI primitives for one feature's local styling need; wrap or compose them in the feature module instead.

## API Routes

- Local Flask API responses should keep the existing predictable shape: `status`, `message` when useful, `data` when returning payloads, and appropriate HTTP status codes.
- Validate and parse request input before mutation.
- Preserve tenant/invoice filtering for invoice-based routes. Never look up by invoice number alone when tenant scope is required.
- ID-based routes operate on local `WaybillPrint` IDs and should continue using the existing model-loading/decorator pattern where applicable.
- Keep download and print operations separate. Creating/downloading a waybill must not silently change print behavior unless the request explicitly specifies and existing flow supports it.
- File preview/download routes must verify `local_file_path` exists before sending a file.
- SSE routes should send JSON events and avoid blocking unrelated request handling.
- Health/printer endpoints should report printer state without mutating jobs unless the route is explicitly a manual handling route.

## Data and Storage

- Store waybill metadata and lifecycle state in SQLite through SQLAlchemy models.
- Store downloaded/rendered waybill files on disk under `app/storage/waybills`; do not store large file content in SQLite.
- Keep `local_file_path` as the database reference between metadata and file storage.
- Keep runtime logs under `app/logs` through the configured logger.
- Do not delete or regenerate `app/instance`, `app/storage`, or `app/logs` as part of source changes.
- Schema changes must use Flask-Migrate/Alembic and must preserve existing operational data unless a migration intentionally changes it.
- Cleanup logic must remain threshold-based and must not delete recent/current waybill records or files.
- Remote shipping manifest, shipping bin/item, queue job, and tenant configuration data belongs to FusionTech's Nest API, not local SQLite.

## Background Jobs and Printing

- Queue long-running download/print work instead of doing it synchronously in request handlers.
- Keep worker functions resilient: fetch fresh model state inside app context, log invoice/job IDs, mark queue tasks done, and continue after individual job failures.
- Keep print submission, monitoring, cancellation, and offline-printer handling aligned with CUPS job state.
- Preserve `cups_job_id`, `printer_name`, `print_status`, `print_error`, and `print_completed_at` updates when changing print behavior.
- Keep download retry behavior separate from first-attempt download behavior.
- Do not assume CUPS is installed in every development environment; code paths should fail clearly or use the existing optional-import behavior.

## Deployment and Scripts

- Shell scripts should remain non-interactive only where already designed that way; preserve prompts for installer choices and printer setup flows.
- Keep Docker mode selection explicit (`dev` or `prod`) and preserve persistent mounts for database, logs, and storage.
- Preserve backend port `5000`, frontend port `5173`, USB passthrough, privileged backend container behavior, and CUPS setup unless the task explicitly changes deployment architecture.
- Keep systemd setup separate from Docker setup.
- Do not write secrets into scripts or committed environment examples.
- Prefer additive, idempotent installer changes that check whether tools/services are already installed before changing system state.

## File Organization

- `app/` — Flask backend application, configuration, database binding, services, models, jobs, migrations, storage, and logs.
- `app/services/<domain>/routes/` — Flask Blueprint route definitions for a domain.
- `app/services/<domain>/requests/` — Flask-Sieve request validation classes.
- `app/services/<domain>/controllers/` — Request orchestration and response shaping.
- `app/services/<domain>/actions/` — Single-use-case orchestration classes.
- `app/services/<domain>/services/` — Business logic, external integrations, file handling, printing, and monitoring.
- `app/services/<domain>/jobs/` — Queues, worker threads, retry workers, and scheduler jobs.
- `app/services/<domain>/models/` — SQLAlchemy models and serialization.
- `app/services/<domain>/enums/` — Domain status/constant enums.
- `frontend/src/pages/` — Route-level page wrappers.
- `frontend/src/modules/<Feature>/` — Feature-owned UI, hooks, services, types, constants, and utilities.
- `frontend/src/components/global/` — Shared app-level components.
- `frontend/src/components/ui/` — Shared UI primitives; treat as generated/library-style components.
- `frontend/src/lib/` — Shared frontend clients and utilities.
- `context/` — Product, architecture, standards, and AI workflow source-of-truth documents.
- `installers/`, `docker*.sh`, `docker-compose*.yml`, `Dockerfile.*`, `*.service` — Deployment, installation, and operations assets.

## Verification

- For documentation-only changes, re-read the final document and inspect the diff.
- For changed Python files, run the narrowest import/syntax or targeted route/service check available before broader backend checks.
- For changed frontend files, run TypeScript/LSP diagnostics where available; use `npm run build` from `frontend/` when shared types, routing, or module boundaries change.
- For changed API behavior, exercise the route with a minimal HTTP request or driver and verify the response shape and status code.
- For changed UI behavior, load the frontend in a browser and use the actual operator flow.
- For printer behavior, verify safely through printer status/CUPS checks or a controlled configured printer path; do not submit real jobs unless required and safe.
- For deployment scripts, prefer syntax checks, dry-run-style review, or the least destructive command path before running privileged operations.
- Record any skipped verification and the reason in the final response.
