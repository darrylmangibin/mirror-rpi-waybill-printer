# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete

## Current Goal

- Task 06 follow-up completed: correct analytics manifest-status filtering to direct boolean params while keeping Prisma-style filters on the shipping-bin-items table.

## Completed

- Corrected analytics manifest-status filtering to send direct boolean params: `with_manifest`, `without_manifest`, `courier_scan_completed`, and `courier_dispatch`.
- Kept Prisma-style manifest-status `where` filters scoped to the matching shipping-bin-items table query.
- Removed the analytics endpoint's temporary JSON `query` serialization and restored direct params in `getShippingBinItemAnalytics`.
- Updated task 06 to document the split contract: direct analytics booleans and Prisma-style table filters.
- Removed the stale task 06 open question about whether `courier_dispatch` is the expected analytics param after the user confirmed the contract.
- Verified `npm run build` from `frontend/` after correcting the analytics/list query split. Vite emitted its existing large-chunk warning.
- Verified the analytics route still responds with HTTP 200 after correcting the analytics/list query split.
- Added manifest-status filter typing and options for `with_manifest`, `without_manifest`, `courier_scan_completed`, and `courier_dispatch`.
- Added Prisma-style manifest where mapping for `shipping_manifest_id` null/not-null and `shipping_manifest.is` loaded/delivery timestamps.
- Updated `getShippingBinItemAnalytics` to serialize an optional Prisma-style `query` parameter while preserving existing direct analytics params.
- Added the Manifest status select to the Shipping Bin Items Analytics filters.
- Applied the selected manifest-status filter to both the aggregate analytics request and matching shipping-bin-items table query.
- Verified `npm run build` from `frontend/` after adding the manifest-status filter. Vite emitted its existing large-chunk warning.
- Verified the analytics route still responds with HTTP 200 after adding the manifest-status filter.
- Removed the Shipping Bin Items Analytics shipping bin category filter control.
- Removed the Shipping Bin Items Analytics shipping bin code multi-select filter control.
- Removed shipping bin category/code analytics params and matching-items list query mapping.
- Removed the now-unused module-local `MultiSelectFilter` component and related filter helper types.
- Verified `npm run build` from `frontend/` after removing shipping bin category/code filters. Vite emitted its existing large-chunk warning.
- Verified the analytics route still responds with HTTP 200 after removing shipping bin category/code filters.
- Moved Manifest Status into the regular breakdown panel grid with Validation State, Workflow State, and Skip Sweeping.
- Separated the Current Bin Codes section from the regular breakdown panels so shipping station and collection hub code cards remain grouped together.
- Verified `npm run build` from `frontend/` after regrouping Manifest Status. Vite emitted its existing large-chunk warning.
- Verified the analytics route still responds with HTTP 200 after regrouping Manifest Status.
- Moved Marketplace Distribution into the top distribution card group with Tenant Distribution and Courier Distribution.
- Verified `npm run build` from `frontend/` after moving Marketplace Distribution. Vite emitted its existing large-chunk warning.
- Verified the analytics route still responds with HTTP 200 after moving Marketplace Distribution.
- Split the Current Bin Codes area into separate Shipping Station Codes and Collection Hub Codes cards.
- Replaced the current-bin code bar chart with a code-friendly list/bar hybrid that wraps long dynamic bin codes and keeps counts visible.
- Improved analytics panel header spacing so longer titles and descriptions fit without crowding the totals.
- Verified `npm run build` from `frontend/` after splitting current-bin codes. Vite emitted its existing large-chunk warning.
- Verified the analytics route still responds with HTTP 200 after splitting current-bin codes.
- Moved Tenant Distribution and Courier Distribution into the top analytics card area below the summary cards.
- Updated the summary cards grid to align four high-level cards evenly at desktop width.
- Updated the Current Bin Codes breakdown to span the full analytics chart grid width.
- Verified `npm run build` from `frontend/` after the task 06 layout follow-up. Vite emitted its existing large-chunk warning.
- Verified the analytics route still responds with HTTP 200 after the layout follow-up.
- Added task 06 frontend typings for the expanded analytics `manifest` payload and `current_bin` category/code breakdowns.
- Added module-local analytics mappers for manifest totals, current-bin category totals, dynamic current-bin code options, and selected-code chart data.
- Added a Shipping Bin Items Analytics multi-select filter for dynamic shipping bin codes.
- Updated the analytics dashboard filter state to include shipping bin category and shipping bin code selections.
- Updated the analytics dashboard to render manifest totals and current-bin category/code breakdown charts.
- Verified `npm run build` from `frontend/` after task 06 changes. Vite emitted its existing large-chunk warning.
- Verified the Vite route responds with HTTP 200 at `/shipping-manifests/shipping-bin-items/analytics` on the running dev servers.
- Refactored the matching shipping-bin-items analytics table to replace the combined invoice/tracking column with separate order date, invoice number, and tracking number columns.
- Removed the matching-items table's created-at, validation, and sync-status columns while preserving workflow, shipped-out, loading, empty, error, refresh, and pagination behavior.
- Typed the shipping bin item metadata invoice-order path and read the order date from `meta_data?.invoice_order?.created_at` with optional chaining.
- Extracted Shipping Bin Items Analytics presentation pieces from `index.tsx` into local component files for the date picker, summary cards, breakdown panels, value lists, analytics skeleton, raw item loading rows, and matching item table.
- Extracted analytics dashboard helper functions, filter constants, chart mappers, and local component prop types into `utils.ts` and `types.ts`.
- Verified `npm run build` from `frontend/` after the component/utility refactor.
- Verified the Vite route still responds with HTTP 200 at `/shipping-manifests/shipping-bin-items/analytics` after the refactor.
- Verified `npm run build` from `frontend/` after adding the raw item analytics table.
- Verified the Vite route responds with HTTP 200 at `/shipping-manifests/shipping-bin-items/analytics` while the dev server is running.
- Added `useShippingBinItems` to the analytics dashboard with a separate memoized `ApiQueryParams` object for the raw item list.
- Added a read-only matching shipping-bin-items table below the analytics aggregate content with independent loading, fetching, error, empty, populated, refresh, pagination, and per-page controls.
- Updated analytics bar charts from the primary theme token to a purple bar color.
- Changed analytics bar charts to use the primary theme token instead of the secondary chart color.
- Added persistent `total_items` labels beside each analytics bar so values are visible without hover.
- Added analytics request parameter typing for date range, tenant, marketplace, validation status, workflow step, and skip-sweeping filters.
- Added explicit analytics response typing for parcel, order, shipping-bin-item, tenant, courier, validation-status, workflow-step, and skip-sweeping aggregate sections.
- Added `getShippingBinItemAnalytics` to call `GET /shipping-bin-items/analytics` through `nestApi` with direct query params.
- Added a stable analytics-specific TanStack Query key and `useShippingBinItemAnalytics` hook.
- Added frontend dependencies needed for shadcn-compatible chart and switch UI support: `recharts` and `@radix-ui/react-switch`.
- Added shadcn-compatible `chart`, `calendar`, and `switch` UI primitives for the analytics dashboard.
- Added route registration and a thin page wrapper for `/shipping-manifests/shipping-bin-items/analytics`.
- Added an Analytics button to the Shipping Manifest list header that navigates to the dashboard route without changing scanner or list behavior.
- Added the Shipping Bin Items Analytics dashboard component with current-date defaults, tenant/marketplace/status/workflow/skip-sweeping filters, summary totals, chart-backed breakdowns, loading, empty, error, refresh, and reset states.
- Updated analytics response typing to match the supplied live API payload: top-level `total_items`, `tenants`, `courier`, `marketplace`, `validation`, `workflow`, and `process`.
- Updated dashboard mappers to render the live response shape, including validation counts, workflow counts, process counts, and represented tenant/courier/marketplace entries.
- Replaced Tenant Distribution, Courier Distribution, and Marketplace Distribution bar charts with compact value-list panels because those payload sections only return represented values and counts.

## In Progress

- None.

## Next Up

- Manually verify the analytics dashboard in a real browser once Chrome/Playwright is available in the environment.

## Open Questions

- Manual browser verification for task 06 could not be completed because Playwright reports no Chrome binary at `/opt/google/chrome/chrome`, and `npx playwright install chrome` failed because sudo requires an interactive password.
- Confirm the backend's preferred query parameter shape for multiple analytics `shipping_bin_codes`; the frontend currently sends `shipping_bin_codes` as an array through Axios params.
- Confirm the remote list endpoint supports the nested raw-item filter shape `where.current_bin.category` and `where.current_bin.shipping_bin_code.in` for the matching-items table.
- Manual browser verification for task 05 could not be completed because Playwright still reports no Chrome binary at `/opt/google/chrome/chrome`.
- Manual browser verification could not be completed in this environment because Playwright reported no Chrome binary at `/opt/google/chrome/chrome`, and `npx playwright install chrome` failed because sudo requires an interactive password.
- The list query uses Prisma-style `where.created_at = { gte: "YYYY-MM-DDT00:00:00.000Z", lte: "YYYY-MM-DDT23:59:59.999Z" }` based on the existing list endpoint's JSON-serialized Prisma query contract; no more specific local API contract was available.
- The list query uses `where.skip_sweeping = true` when the skip-sweeping switch is enabled, matching the existing analytics parameter name and task requirement.
- Tenant, courier, and marketplace payload sections provide counts plus lists, not per-entry item counts; the dashboard renders those as represented-entry charts rather than per-entry item distributions.
- Tenant, courier, and marketplace payload sections are now displayed as value lists, not charts.
- Remote API was not manually called by the agent during this task; the dashboard was updated from the sample payload supplied by the user.
- `skip_sweeping` is omitted when the switch is off so the default dashboard remains an all-items view; it is sent as boolean `true` when the operator enables the skip-sweeping filter.

## Architecture Decisions

- Keep the task 06 multi-select as a module-local component under `ShippingBinItemAnalytics/components/` because shared UI primitives include popover and checkbox building blocks but no reusable multi-select.
- Send shipping bin category/code filters through analytics params as `shipping_bin_category` and `shipping_bin_codes`, while mapping the raw item table filter to `where.current_bin.category` and `where.current_bin.shipping_bin_code.in` for the existing Prisma-style list query shape.
- Keep extracted analytics components under `ShippingBinItemAnalytics/components/` and helpers in sibling `utils.ts`/`types.ts` so the feature remains module-local while `index.tsx` owns page state, queries, and composition.
- Keep the raw item table as a local component inside `ShippingBinItemAnalytics` instead of modifying `ShippingBinItemsList`, because the analytics table is read-only and must not inherit manifest selection, export, close-manifest, or sync actions.
- Keep aggregate analytics params and raw list params separate: analytics continues to use direct endpoint params, while the raw list uses `ApiQueryParams.query.where` and `query.orderBy`.
- Keep analytics frontend-only and route all requests through the shared tenant-aware Nest API client, preserving the local Flask/CUPS backend boundary.
- Keep the dashboard under `frontend/src/modules/ShippingBinItem` and expose it through a thin route page, matching existing page/module boundaries.
- Use shadcn-compatible chart/calendar/switch primitives with `recharts`, `react-day-picker`, and Radix Switch instead of custom one-off controls.
- Normalize analytics metric objects through a local `getTotalItems` helper that supports `total_items`, `total`, and the live API's `count` fields.

## Session Notes

- Follow-up correction started after the user clarified that only `shipping_bin_items` should use Prisma-style query filters, while analytics should use direct boolean params.
- Direct search found the stale analytics `query` serialization in `getShippingBinItemAnalytics`, which was removed.
- Search agents confirmed the source now matches the corrected split contract: analytics uses direct params, and only raw list services serialize `query.where` JSON.
- Librarian research confirmed Axios sends boolean params as query-string values and the backend must coerce them from strings.
- Background exploration highlighted the naming risk: use `courier_dispatch` only for the request param, while `total_courier_dispatched` remains the response metric field.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after correcting the analytics/list query split. Vite emitted its existing large-chunk warning.
- Verification: Confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200 on the running Vite dev server at port `5173`.
- Manual browser verification skipped: Playwright could not launch Chrome because `/opt/google/chrome/chrome` is missing.
- Follow-up manifest-status filter started after the user requested Prisma-style filters for `shipping_bin_items -> shipping_manifest` states.
- Direct search found local `shipping_manifest_id` usage in `ShippingBinItemsList` and `loaded_at` / `delivery_completed_at` fields in the Shipping Manifest type.
- `rg` is not installed in this environment; direct text search used `grep`, AST search, Context7, and background exploration agents.
- Context7 Prisma docs confirmed `field: null`, `field: { not: null }`, and to-one relation filters using `is` / `isNot`.
- Background exploration confirmed there are no local nested relation filter examples and that the matching-items list endpoint is the confirmed JSON-serialized Prisma-style `query.where` consumer.
- Librarian research confirmed the implemented shapes match Prisma docs and public examples for nullable scalar filters and optional to-one relation `is` filters.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after adding the manifest-status filter. Vite emitted its existing large-chunk warning.
- Verification: Confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200 on the running Vite dev server at port `5173`.
- Manual browser verification skipped: Playwright could not launch Chrome because `/opt/google/chrome/chrome` is missing.
- Follow-up filter removal removed shipping bin category/code controls and request wiring while keeping current-bin code display cards visible.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after removing shipping bin category/code filters. Vite emitted its existing large-chunk warning.
- Verification: Confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200 on the running Vite dev server at port `5173`.
- Manual browser verification skipped: Playwright could not launch Chrome because `/opt/google/chrome/chrome` is missing.
- Follow-up layout adjustment grouped Manifest Status with the regular analytics breakdown panels and kept Current Bin Codes as a separate section.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after regrouping Manifest Status. Vite emitted its existing large-chunk warning.
- Verification: Confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200 on the running Vite dev server at port `5173`.
- Manual browser verification skipped: Playwright could not launch Chrome because `/opt/google/chrome/chrome` is missing.
- Follow-up layout adjustment moved Marketplace Distribution into the top card group with Tenant and Courier Distribution.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after moving Marketplace Distribution. Vite emitted its existing large-chunk warning.
- Verification: Confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200 on the running Vite dev server at port `5173`.
- Manual browser verification skipped: Playwright could not launch Chrome because `/opt/google/chrome/chrome` is missing.
- Follow-up current-bin code refinement split shipping station and collection hub codes into separate cards and changed code rows to wrapped mono labels with inline bars.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after splitting current-bin codes. Vite emitted its existing large-chunk warning.
- Verification: Confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200 on the running Vite dev server at port `5173`.
- Manual browser verification skipped: Playwright could not launch Chrome because `/opt/google/chrome/chrome` is missing.
- Follow-up layout adjustment moved Tenant/Courier Distribution into the top card grouping and made Current Bin Codes full width.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after the layout follow-up. Vite emitted its existing large-chunk warning.
- Verification: Confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200 on the running Vite dev server at port `5173`.
- Manual browser verification skipped: Playwright could not launch Chrome because `/opt/google/chrome/chrome` is missing.
- Task 06 started from `context/feature-spec/shipping-bin-items-analytics/tasks/06-shipping-bin-items-analytics.md`.
- Required repository and feature context files were read before source inspection for task 06.
- Implementation stayed inside the ShippingBinItem frontend module and did not change backend APIs or shared UI primitives.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after task 06 changes. Vite emitted its existing large-chunk warning.
- Verification: Confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200 on the running Vite dev servers at ports `5173` and `5174`.
- Manual browser verification skipped: Playwright could not launch Chrome, and `npx playwright install chrome` failed because sudo requires an interactive password.
- Task 05 started from `context/feature-spec/shipping-bin-items-analytics/tasks/05-shipping-bin-items-analytics.md`.
- Required repository and feature context files were read before source inspection for task 05.
- Implementation for task 05 stayed inside the ShippingBinItem analytics table component, its loading-row helper, and the shipping-bin-item row type.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after the table column refactor. Vite emitted its existing large-chunk warning.
- Verification: Started the Vite dev server and confirmed `/shipping-manifests/shipping-bin-items/analytics` responds with HTTP 200.
- Manual browser verification skipped: Playwright could not launch Chrome because `/opt/google/chrome/chrome` is missing.
- Refactor started after `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx` grew too long with table, panel, skeleton, date picker, and utility logic.
- Verification: LSP diagnostics still could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after the refactor. Vite emitted its existing large-chunk warning.
- Verification: Started Vite on `http://127.0.0.1:5174/` because port `5173` was already in use, then confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200.
- Task 04 started from `context/feature-spec/shipping-bin-items-analytics/tasks/04-shipping-bin-items-analytics.md`.
- Required repository and feature context files were read before source inspection for task 04.
- Verification: LSP diagnostics could not run because `typescript-language-server` is not installed in the environment.
- Verification: `npm run build` from `frontend/` completed successfully after adding the read-only item table. Vite emitted its existing large-chunk warning.
- Verification: Started Vite on `http://127.0.0.1:5174/` because port `5173` was already in use, then confirmed `/shipping-manifests/shipping-bin-items/analytics` returns HTTP 200.
- Manual browser verification skipped: Playwright could not launch Chrome and installing Chrome was blocked by sudo password requirements.
- Follow-up UI color change started after the user requested purple analytics bars instead of the primary color.
- Verification: `npm run build` from `frontend/` completed successfully after changing analytics bars to purple. The shell emitted the existing oh-my-posh read-only cache warning and Vite emitted its existing large-chunk warning.
- Follow-up UI polish started for `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx` after the user requested persistent bar chart values and primary-colored bars.
- Verification: `npm run build` from `frontend/` completed successfully after adding persistent chart value labels and primary bar color. The shell emitted the existing oh-my-posh read-only cache warning and Vite emitted its existing large-chunk warning.
- Task started from `context/feature-spec/shipping-bin-items-analytics/tasks/01-shipping-bin-items-analytics.md`.
- Required context files were read before source inspection.
- Implementation stayed inside `frontend/src/modules/ShippingBinItem` because the task references existing ShippingBinItem service/hook patterns and no separate analytics module exists yet.
- Verification: `npm run build` from `frontend/` completed successfully. The shell emitted an unrelated oh-my-posh read-only cache warning before the build, and Vite emitted its existing large-chunk warning.
- Task 02 started from `context/feature-spec/shipping-bin-items-analytics/tasks/02-shipping-bin-items-analytics.md`.
- Required repository and feature context files were read before source inspection for task 02.
- Initial sandboxed dependency install failed with DNS `EAI_AGAIN`; reran with escalated network access and `npm install recharts @radix-ui/react-switch` completed successfully.
- Local analytics type used `total`; dashboard normalizes display around `total_items` with a `total` fallback because the exact live API payload was not available locally.
- Verification: `npm run build` from `frontend/` completed successfully after fixing chart tooltip typing. The shell emitted the existing oh-my-posh read-only cache warning and Vite emitted its existing large-chunk warning.
- Verification: `npm run lint` from `frontend/` failed on pre-existing lint issues outside this feature surface (`frontend/src/components/ui/badge.tsx`, `button.tsx`, `form.tsx`, Home hooks/services, and a DataTable warning). No new analytics files were reported in the lint output.
- Manual browser/API verification was not completed because the live remote analytics API payload was not available from local context.
- Dev server: initial sandboxed `npm run dev -- --host 0.0.0.0` failed with local-bind `EPERM`; reran with approval and Vite started on `http://localhost:5174/` because port `5173` was already in use.
- Follow-up: user supplied the live analytics response shape, which uses top-level `total_items`, `tenants`, `courier`, `marketplace`, `validation`, `workflow`, and `process` objects rather than the initially assumed `*_breakdowns` arrays.
- Verification: `npm run build` from `frontend/` completed successfully after updating the live response binding. The shell emitted the existing oh-my-posh read-only cache warning and Vite emitted its existing large-chunk warning.
- Verification: `npm run build` from `frontend/` completed successfully after replacing tenant/courier/marketplace charts with value lists. The shell emitted the existing oh-my-posh read-only cache warning and Vite emitted its existing large-chunk warning.
