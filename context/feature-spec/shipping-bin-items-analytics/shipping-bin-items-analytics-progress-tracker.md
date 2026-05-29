# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete

## Current Goal

- Refactor the Shipping Bin Items Analytics matching-items table columns for order date, invoice number, and tracking number.

## Completed

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

- Manual browser verification for task 05 could not be completed because Playwright still reports no Chrome binary at `/opt/google/chrome/chrome`.
- Manual browser verification could not be completed in this environment because Playwright reported no Chrome binary at `/opt/google/chrome/chrome`, and `npx playwright install chrome` failed because sudo requires an interactive password.
- The list query uses Prisma-style `where.created_at = { gte: "YYYY-MM-DDT00:00:00.000Z", lte: "YYYY-MM-DDT23:59:59.999Z" }` based on the existing list endpoint's JSON-serialized Prisma query contract; no more specific local API contract was available.
- The list query uses `where.skip_sweeping = true` when the skip-sweeping switch is enabled, matching the existing analytics parameter name and task requirement.
- Tenant, courier, and marketplace payload sections provide counts plus lists, not per-entry item counts; the dashboard renders those as represented-entry charts rather than per-entry item distributions.
- Tenant, courier, and marketplace payload sections are now displayed as value lists, not charts.
- Remote API was not manually called by the agent during this task; the dashboard was updated from the sample payload supplied by the user.
- `skip_sweeping` is omitted when the switch is off so the default dashboard remains an all-items view; it is sent as boolean `true` when the operator enables the skip-sweeping filter.

## Architecture Decisions

- Keep extracted analytics components under `ShippingBinItemAnalytics/components/` and helpers in sibling `utils.ts`/`types.ts` so the feature remains module-local while `index.tsx` owns page state, queries, and composition.
- Keep the raw item table as a local component inside `ShippingBinItemAnalytics` instead of modifying `ShippingBinItemsList`, because the analytics table is read-only and must not inherit manifest selection, export, close-manifest, or sync actions.
- Keep aggregate analytics params and raw list params separate: analytics continues to use direct endpoint params, while the raw list uses `ApiQueryParams.query.where` and `query.orderBy`.
- Keep analytics frontend-only and route all requests through the shared tenant-aware Nest API client, preserving the local Flask/CUPS backend boundary.
- Keep the dashboard under `frontend/src/modules/ShippingBinItem` and expose it through a thin route page, matching existing page/module boundaries.
- Use shadcn-compatible chart/calendar/switch primitives with `recharts`, `react-day-picker`, and Radix Switch instead of custom one-off controls.
- Normalize analytics metric objects through a local `getTotalItems` helper that supports `total_items`, `total`, and the live API's `count` fields.

## Session Notes

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
