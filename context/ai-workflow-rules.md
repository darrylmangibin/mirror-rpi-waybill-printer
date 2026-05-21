# AI Workflow Rules

## Approach

Build this project incrementally using the context files, existing implementation, and explicit user instructions as the source of truth. This repository is a Raspberry Pi/Linux waybill print station with a local Flask/CUPS backend, SQLite/file storage, a React/Vite operator frontend, deployment scripts, and frontend-only integrations with FusionTech's remote Nest API. Treat each change as a small, verifiable unit that preserves local printer safety, tenant/invoice isolation, persisted waybill records, and Raspberry Pi deployment constraints.

Before implementing, identify the affected boundary:

- Local backend API, models, actions, services, workers, or CUPS integration under `app/`.
- Frontend waybill dashboard, shipping manifest UI, tenant configuration, or API clients under `frontend/src/`.
- Device setup, Docker, systemd, CUPS, USB, or environment behavior in root scripts, `installers/`, Docker files, and service files.
- Documentation/context only.

Do not infer product behavior beyond `context/`, the current source, API docs, or the user's explicit request. If a required context file does not exist yet, use the existing source and `context/project-overview.md`, then document the missing requirement instead of inventing it.

## Scoping Rules

- Work on one feature unit and one system boundary at a time.
- Prefer small, end-to-end verifiable changes over broad rewrites.
- Keep local print-station behavior separate from remote FusionTech Nest API behavior unless the user explicitly asks for a flow that crosses both.
- Preserve tenant/invoice isolation on invoice-based routes and frontend API clients.
- Preserve local persistence semantics for `app/instance`, `app/storage`, and `app/logs` unless the user explicitly requests a storage change.
- Preserve CUPS job lifecycle semantics: submit, track `cups_job_id`, monitor, complete, cancel, or error.
- Avoid changing Raspberry Pi resource assumptions such as small SQLite usage, background worker counts, print-monitor intervals, and cleanup behavior unless the task is specifically about those constraints.
- Do not broaden marketplace behavior beyond the supported/currently implemented marketplace handling without a spec.
- Do not mix UI polish, API behavior, database schema, worker behavior, and deployment changes in one implementation unit unless they are required for one observable feature.

## When to Split Work

Split an implementation step if it combines:

- Frontend UI changes and backend API/service changes.
- Waybill download/rendering behavior and CUPS print submission/monitoring behavior.
- SQLite model or migration changes and unrelated UI changes.
- Local Flask API behavior and remote FusionTech Nest API integration behavior.
- Shipping manifest workflows and local waybill print workflows.
- Deployment/install script changes and application runtime logic.
- Docker behavior and systemd/manual installation behavior.
- CUPS/printer configuration and non-printer feature work.
- Multiple unrelated API routes or multiple unrelated React modules.
- Behavior that cannot be verified quickly through the matching surface.

If a change cannot be driven end to end through its actual surface in one focused pass, the scope is too broad and must be split.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files, API docs, existing code, or user request.
- If behavior is ambiguous, resolve it in the relevant context file before implementing when possible.
- If no feature-specific progress tracker exists, record important open questions in the nearest relevant context document or ask the user one precise question before changing behavior.
- If a missing requirement affects hardware, persisted data, tenant isolation, external API contracts, or deployment safety, stop and clarify before implementing.
- If the code and docs conflict, trust the running source for implementation details and update docs only when the user asks or the task requires it.
- Do not create fallback behavior, compatibility shims, or hidden alternate flows unless the existing deployed behavior or explicit spec requires them.

## Protected Files

Do not modify the following unless explicitly instructed or the task specifically requires it:

- Secrets and local environment files: `.env`, `.env.docker`, `frontend/.env`, `.env.printer`, and any untracked credential/config file.
- Runtime data and generated/local output: `app/instance/`, `app/storage/`, `app/logs/`, `frontend/dist/`, `frontend/node_modules/`, `venv/`, `__pycache__/`, `.playwright-mcp/`, and `.sisyphus/`.
- Database files and local persisted state: `*.db`, `*.sqlite`, `*.sqlite3`.
- Migration history under `app/migrations/versions/` unless the task explicitly changes the database schema.
- Generated or library-style UI primitives in `frontend/src/components/ui/` unless the task is specifically about shared UI primitives.
- Docker, systemd, installer, CUPS, and USB/printer setup files unless the task is deployment, installation, or printer-configuration work.
- Lockfiles and dependency manifests unless the task requires dependency changes.
- Third-party library internals and installed package directories.

## Keeping Docs in Sync

Update the relevant context or documentation file whenever implementation changes:

- Product scope, user flow, features, or success criteria: `context/project-overview.md`.
- AI/development workflow, protected files, or verification expectations: `context/ai-workflow-rules.md`.
- Public/local API behavior: `API_ROUTES.md`.
- Docker deployment behavior: `DOCKER_GUIDE.md`, Docker files, or compose files as appropriate.
- Installation/systemd/CUPS behavior: `README.md`, `install.sh`, `installers/*`, or service files as appropriate.
- Feature-specific decisions: the relevant `context/feature-spec/<feature>/` files if they exist.

When a context file referenced by `AGENTS.md` is missing, do not fabricate its contents as part of unrelated work. Create or fill it only when asked, or when the implementation change cannot be safely documented elsewhere.

## Before Moving to the Next Unit

1. The current unit works end to end within its defined surface:
   - Backend/API: exercise the Flask route or service path with a request or minimal driver.
   - Frontend/UI: run the relevant React surface in a browser when UI behavior changed.
   - Printer behavior: verify safely with CUPS/mockable status where possible and do not submit real printer jobs unless the task requires it and the environment is configured.
   - Deployment scripts: verify syntax and the safest non-destructive command path available.
2. No invariant was violated for tenant/invoice isolation, local SQLite/file persistence, CUPS job lifecycle, cleanup safety, or remote Nest API tenant headers.
3. Relevant docs/context were updated, or skipped documentation is explicitly noted with the reason.
4. Changed Python files pass the narrowest useful check, such as import/syntax validation or targeted backend execution.
5. Changed frontend files pass TypeScript/LSP diagnostics and, when practical, `npm run build` from `frontend/`.
6. Cross-boundary changes are verified with the narrowest useful backend/frontend/deployment checks before broader builds.
7. Any skipped verification is recorded in the final response with the reason.
