# Shipping Manifest Progress Tracker

Update this file after every meaningful implementation change.

This tracker was reconstructed after the feature was already completed. The entries below are assumed from the current implementation and feature overview rather than from live incremental session history.

## Current Phase

- Complete

## Current Goal

- Maintain the completed Shipping Manifest workflow and use this tracker as the baseline for any future fixes or enhancements.

## Completed

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

## In Progress

- None. The feature is considered complete.

## Next Up

- No required implementation work is currently planned.
- Future work, if requested, should start from the completed feature baseline and target a specific improvement, bug, or API contract change.

## Open Questions

- None blocking completion.
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

- Reconstructed tracker from completed source code and `feature-overview.md`; not a chronological record of the original implementation sessions.
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
