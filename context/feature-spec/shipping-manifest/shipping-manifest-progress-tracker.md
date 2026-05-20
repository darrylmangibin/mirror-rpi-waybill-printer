# Shipping Manifest Progress Tracker

Update this file at task start, after every meaningful implementation change, and at task completion.

This tracker was reconstructed after the feature was already completed. The entries below are assumed from the current implementation and feature overview rather than from live incremental session history.

## Current Phase

- Completed — export selection reset refinement

## Current Goal

- `tasks/06-shipping-manifest.md` is implemented and refined: the CSV export flow resets export filter type and selected export tenants after cancel or ready-download click while preserving selected shipping bin item selections.

## Completed

- Refined Shipping Manifest export selection reset behavior for `tasks/06-shipping-manifest.md`:
  - cancelling the export selection modal resets the export filter type to `all`
  - cancelling clears selected export tenants
  - clicking a ready `Download CSV` triggers the same export-selection reset through `ShippingManifestDetails`
  - selected shipping bin item row selections are preserved
- Added frontend-only Shipping Manifest export request/status/download UI wiring for `tasks/06-shipping-manifest.md`:
  - `handleExport` in `ShippingManifestDetails` calls `useRequestExport` with the selected export payload
  - request creation errors surface toast errors from the remote API response
  - successful request creation captures the export id and opens a progress/download modal
  - `useShippingManifestExportStatus` polls every 2 seconds while the export remains `pending`
  - polling stops when the export status is no longer pending
  - completed exports trigger `useExportDownloadUrl`
  - the modal download button remains disabled until the export is completed and the download URL is loaded
  - clicking download redirects the browser to the generated CSV URL
  - the modal displays pending/completed/failed status treatments and warns that closing it discards the current URL
- Added frontend-only Shipping Manifest export request payload support for `tasks/05-shipping-manifest.md`:
  - `RequestExportPayload` service type with `filter_type`, `shipping_bin_item_ids`, and `tenant_ids`
  - `requestExport(shippingManifestId, payload)` POST body forwarding
  - `filter_type` defaults to `all` when omitted
  - `useRequestExport` mutation variables now include the payload object
  - no backend/API/export generation/download/UI wiring changes
- Added frontend-only Shipping Manifest export status and download URL scaffolding for `tasks/04-shipping-manifest.md`:
  - `getShippingManifestExportStatus` service using `nestApi`
  - `GET /shipping-manifest-exports/:shippingManifestExportId`
  - typed status response `{ status: string }`
  - `useShippingManifestExportStatus` React Query query hook
  - `getShippingManifestExportDownloadUrl` service using `nestApi`
  - `GET /shipping-manifest-exports/:exportId/download`
  - typed download response `{ url: string }`
  - `useExportDownloadUrl` React Query mutation hook
  - no backend, export generation, polling, retries, auto-download behavior, or UI wiring changes
- Added frontend-only Shipping Manifest export request scaffolding for `tasks/03-shipping-manifest.md`:
  - `requestExport` service using `nestApi`
  - `POST /shipping-manifest-exports/:shippingManifestId`
  - typed response `{ exportId: string; status: string }`
  - `useRequestExport` React Query mutation hook
  - no backend, CSV generation, download behavior, polling, or UI wiring changes
- Added UI-only CSV export modal wiring for `tasks/02-shipping-manifest.md`:
  - `Export CSV` button on the shipping bin items detail surface
  - modal choices for `all`, `selected item`, and `tenants`
  - confirmation payloads for all-items, selected shipping bin item IDs, and selected tenant IDs
  - tenant multi-selection using existing tenant configuration data
  - no backend/API/CSV generation/download changes
- Drafted the UI-only CSV export modal task spec in `tasks/02-shipping-manifest.md`.
- Added Shipping Manifest navigation and routes:
  - `/shipping-manifests`
  - `/shipping-manifests/:id`
- Implemented the manifest list page with:
  - paginated manifest loading from the FusionTech Nest API
  - default `open` status filtering
  - URL-backed `selected-status` query parameter
  - status filters for `open`, `closed`, `for_loading`, `loaded`, and `completed`
  - per-page controls, refresh action, loading state, empty state, and row navigation
- Implemented scanner-first layout support with:
  - hidden focused input for barcode scanner keyboard events
  - online/offline/processing scanner status indicator
  - automatic focus recovery after page focus or non-form clicks
- Implemented shipping-bin-code manifest creation through `POST /shipping-manifests/shipping-bin/:code`.
- Implemented open-manifest conflict handling with an operator modal that can:
  - open the existing manifest
  - close the existing manifest and create a new one through `POST /shipping-manifests/shipping-bin/:code/close-and-create-new`
- Implemented manifest detail loading through `GET /shipping-manifests/:id`.
- Implemented the manifest detail header showing:
  - manifest code
  - carrier and carrier code context
  - status
  - generation type
  - receiver name
  - vehicle plate number
  - loaded order count
  - generated-by information
- Implemented tracking-number scanning for open manifests through `POST /shipping-manifests/:id/add-item`.
- Disabled scanner-based item addition when the manifest status is not `open`.
- Implemented add-item feedback for:
  - successful item addition
  - sync-failed results
  - cancelled sync results
  - validation/unresolved tracking-number errors
- Implemented manual unresolved-item registration with:
  - tenant selection from tenant configuration records
  - shipping bin selection filtered by manifest carrier and collection-hub category
  - tenant-specific Nest API client creation
  - `POST /shipping-manifests/:id/create-shipping-bin-item`
- Implemented linked shipping bin item listing scoped by `shipping_manifest_id` with:
  - pagination
  - tenant filter
  - sync-status filter
  - invoice, tracking, courier, marketplace, tenant, sync, workflow, validation, and updated timestamp columns
- Implemented manual shipping bin item sync through `POST /shipping-bin-items/:id/sync`.
- Implemented close-manifest confirmation and close action through `POST /shipping-manifests/:id/close`.
- Implemented Queue Jobs tab on the manifest detail page with:
  - job status display for `active`, `waiting`, `completed`, `failed`, `delayed`, and `paused`
  - tenant-level success and failure summaries
  - invoice number preview
  - searchable invoice-number modal
  - copy-to-clipboard support
  - retry action for failed or partially failed jobs through `POST /shipping-manifests/:id/invoice-status/bulk-update/retry/:jobId`
- Added Shipping Manifest domain types for:
  - manifest statuses
  - list-filter statuses
  - generation type
  - queue job states
  - queue job tenant results
- Added module constants, hooks, services, utilities, and UI components needed by the completed workflow.
- Documented the feature behavior in `context/feature-spec/shipping-manifest/feature-overview.md`.
- Implemented UI-only shipping bin item row selection for the CSV export preparation task:
  - row-level checkboxes in the shipping bin item table
  - header checkbox for selecting or deselecting all currently visible rows
  - indeterminate header checkbox state when only some visible rows are selected
  - selected item IDs stored in component state
  - selected row highlighting and selected-count feedback
  - Shift-click range selection across the current visible item order
  - no backend, CSV generation, or export button wiring changes
- Refactored the Shipping Bin Items list helper block into local files so `ShippingBinItemsList/index.tsx` stays focused on orchestration:
  - constants and badge configs in `constants.ts`
  - helper types in `types.ts`
  - formatting and comparison helpers in `utils.ts`
  - badge/date/loading row subcomponents under `components/`

## In Progress

- No active implementation work for `tasks/06-shipping-manifest.md`.

## Next Up

- Monitor operator feedback for whether a separate export-request listing page is needed for retrieving older export downloads after a modal is closed.

## Open Questions

- Confirm whether “select all” for export means all currently visible rows, all filtered rows across pages, or all manifest items.
- Confirm with the remote Nest API owner before adding new manifest statuses, queue states, carrier workflows, or marketplace-specific behavior.
- Confirm expected production tenant configuration if the default `staging-v2` tenant is not appropriate for a deployment.

## Architecture Decisions

- Shipping Manifest is implemented as a frontend-only integration with FusionTech's remote Nest API instead of the local Flask backend because manifests, shipping bins, tenant configuration, shipping bin items, and queue jobs are owned remotely.
- Local Flask/CUPS waybill printing behavior remains separate from manifest workflows to preserve the print-station boundary and avoid mixing remote warehouse state with local SQLite/CUPS state.
- Remote API requests use the shared Nest API client with `x-tenant-id` headers so tenant scoping is applied consistently.
- Manual unresolved-item registration uses a tenant-specific Nest API client because the operator explicitly selects the tenant before creating the shipping bin item.
- Scanner support is implemented in the browser as keyboard input through a hidden focused field, matching common barcode scanner behavior without requiring device-specific browser APIs.
- Scanner item addition is disabled once a manifest is no longer `open` so closed or downstream manifests cannot receive new scanned items through the UI.
- React Query is used for manifest, shipping bin item, queue job, tenant configuration, and shipping bin data so mutations can invalidate affected query keys after changes.
- Queue-job monitoring is exposed as an operator detail tab instead of a separate page because queue jobs are scoped to a specific manifest.

## Session Notes

- 2026-05-20: Implemented export selection reset refinement. `ShippingBinItemsList` now resets only export filter type and selected export tenants on export-modal cancel or reset key changes; `ShippingManifestDetails` increments that reset key when the ready download button is clicked. Selected shipping bin item IDs are intentionally not cleared. Verification pending.
- 2026-05-20: Completed verification for export selection reset refinement. Targeted ESLint for `ShippingBinItemsList` and `ShippingManifestDetails` passes; `npm run build` passes. Browser QA confirmed export-modal cancel reopens with `All` behavior and no tenant picker while preserving `1 selected` shipping bin item, and confirmed a completed export download click resets the next export modal back to `All` while preserving the selected shipping bin item. Browser console had no errors. LSP diagnostics were skipped because `typescript-language-server` is not installed.
- 2026-05-20: Started export selection reset refinement for `tasks/06-shipping-manifest.md`. Scope is frontend-only state handling in `ShippingBinItemsList` and `ShippingManifestDetails`; selected shipping bin items must remain selected while export filter type and selected export tenants reset.
- 2026-05-20: Completed verification for `tasks/06-shipping-manifest.md`. `npm run build` passes. Targeted ESLint for `ShippingManifestDetails` passes. Full `npm run lint` still reports pre-existing unrelated lint errors in shared UI/Home files. Browser QA on the Shipping Manifest details surface used the existing staging Nest API: opened `Export CSV`, confirmed export request creation, observed status polling requests until `completed`, verified the modal showed `Ready to download`, confirmed the download button was enabled only after the URL loaded, clicked `Download CSV` and downloaded `shipping-manifest-J&T-20260518-D1D4B4P-8cc891ec-aba0-4cba-95bc-ebbf48f7b062.csv`, then closed the modal and confirmed the modal/download button were removed. LSP diagnostics were skipped because `typescript-language-server` is not installed; Markdown LSP is not configured.
- 2026-05-20: Implemented the `tasks/06-shipping-manifest.md` UI wiring in `ShippingManifestDetails`: `handleExport` now requests an export with the selected payload, opens a progress/download modal after request success, polls export status every 2 seconds while pending, stops polling on terminal statuses, fetches the download URL after completion, disables download until ready, and warns that closing the modal discards the current URL. Next step is diagnostics/build and UI-surface QA.
- 2026-05-20: Started `tasks/06-shipping-manifest.md` implementation. Scope is frontend-only UI wiring in `ShippingManifestDetails`; no backend/API/export generation changes. Current focus is integrating request creation, modal-scoped polling, completed-export download URL fetching, and professional static modal states.
- 2026-05-20: Implemented export status and download URL services/hooks following the existing ShippingManifest query and mutation patterns. `npm run build` passes; service-surface QA confirmed `getShippingManifestExportStatus('export-qa-1')` calls `GET /shipping-manifest-exports/export-qa-1` and returns `{ status: 'completed' }`, while `getShippingManifestExportDownloadUrl('export-qa-1')` calls `GET /shipping-manifest-exports/export-qa-1/download` and returns `{ url: 'https://example.test/export.csv' }`. LSP diagnostics were skipped because `typescript-language-server` is not installed in the environment.
- 2026-05-20: Started `tasks/04-shipping-manifest.md` implementation. Scope is frontend-only service/hook scaffolding under `frontend/src/modules/ShippingManifest`; no backend routes, export generation, polling, auto-download behavior, retries, or UI wiring.
- 2026-05-20: Implemented `requestExport` service and `useRequestExport` hook following the existing `add-item.service.ts` and `useAddItem.ts` module patterns. Next step is targeted diagnostics, build verification, and a minimal hook/service driver QA.
- 2026-05-20: Completed verification for `tasks/03-shipping-manifest.md`. `npm run build` passes; service-surface QA confirmed `requestExport('manifest-qa-1')` posts to `/shipping-manifest-exports/manifest-qa-1` and returns the parsed `{ exportId, status }` response. LSP diagnostics were skipped because `typescript-language-server` is not installed in the environment.
- 2026-05-20: Started `tasks/03-shipping-manifest.md` implementation. Scope is frontend-only service/hook scaffolding under `frontend/src/modules/ShippingManifest`; no backend routes, CSV generation, download behavior, polling, or UI wiring.
- 2026-05-20: Started `tasks/02-shipping-manifest.md` implementation for the UI-only CSV export modal. Scope is limited to `ShippingBinItemsList`, `ShippingManifestDetails`, related UI-only types/components if needed, and this tracker; no backend/API/CSV generation changes.
- 2026-05-20: Implemented the modal UI and callback payload wiring. Next step is targeted diagnostics, build verification, and browser QA through the shipping manifest details surface.
- 2026-05-20: Completed verification for `tasks/02-shipping-manifest.md`. `npm run build` passes; browser QA covered opening `Export CSV`, confirming `all`, selecting a shipping bin item and confirming `selected_shipping_bin_items`, selecting multiple tenants and confirming `tenant`. LSP diagnostics were skipped because `typescript-language-server` is not installed in the environment.
- Reconstructed tracker from completed source code and `feature-overview.md`; not a chronological record of the original implementation sessions.
- Active implementation task: `context/feature-spec/shipping-manifest/tasks/01-shipping-manifest.md`.
- Current task status should stay updated while work is running, not only after code changes are finished.
- Main frontend entry points:
  - `frontend/src/pages/shipping-manifest/page.tsx`
  - `frontend/src/pages/shipping-manifest-details/page.tsx`
  - `frontend/src/modules/ShippingManifest/`
- Related modules used by the workflow:
  - `frontend/src/modules/ShippingBinItem/`
  - `frontend/src/modules/ShippingBin/`
  - `frontend/src/modules/TenantConfiguration/`
  - `frontend/src/lib/nest.api.ts`
- Current feature documentation source of truth:
  - `context/feature-spec/shipping-manifest/feature-overview.md`
- Keep future changes scoped to the remote Nest API UI flow unless a task explicitly requires local Flask/CUPS print-station behavior.
