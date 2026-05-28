# Task: Shipping Bin Items Analytics CSV Export

## Source

- **Project Overview**: `context/project-overview.md`
- **Feature Overview**: `context/feature-spec/shipping-bin-items-analytics/feature-overview.md`
- **Architecture**: `context/architecture.md`
- **Code Standards**: `context/code-standards.md`
- **AI Workflow Rules**: `context/ai-workflow-rules.md`
- **Progress Tracker**: `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md`
- **Previous Task**: `context/feature-spec/shipping-bin-items-analytics/tasks/02-shipping-bin-items-analytics.md`

## Objective

Add a frontend-only CSV export action to the Shipping Bin Items Analytics dashboard so operators can download the current analytics response as a CSV file, with one row per tenant returned by the analytics payload.

## Background

Task 02 added the analytics dashboard UI and then aligned it with the live API response shape:

- `total_items`
- `tenants.count`
- `tenants.tenant_ids`
- `courier.count`
- `courier.codes`
- `marketplace.count`
- `marketplace.integration_name`
- `validation.<status>.count`
- `workflow.<step>.count`
- `process.normal.count`
- `process.skip.count`

The current live response lists tenant IDs but does not return per-tenant item counts. Therefore, the CSV can produce one row per tenant, but tenant-specific counts must not be invented. Each tenant row may include the tenant ID plus the global analytics totals and breakdown counts for the selected filter window.

## Scope

### In Scope

- Add an `Export CSV` button to the Shipping Bin Items Analytics dashboard.
- Generate the CSV entirely in the browser from the currently loaded `useShippingBinItemAnalytics` response.
- Use one CSV row per `analytics.tenants.tenant_ids` entry.
- Include the active filter values and global analytics metrics in each row.
- Disable export while analytics are loading, errored, empty, or unavailable.
- Add user feedback through existing UI/toast patterns when export cannot run or completes.
- Update the progress tracker during implementation.

### Out of Scope

- Backend Flask routes, SQLite models, migrations, local files, or CUPS/printer behavior.
- Remote Nest API changes.
- Fetching raw shipping-bin-item rows for export.
- Inventing per-tenant counts that are not present in the analytics response.
- Server-side CSV generation or persistent file storage.
- Export formats other than CSV.

## What to Implement

### 1. CSV Export Button

- Add an operator-visible `Export CSV` button in the analytics dashboard header or filter action area.
- Use the shared `Button` primitive and a suitable lucide icon such as `Download`.
- Disable the button when:
  - the analytics query is loading or fetching,
  - the analytics query has errored,
  - analytics data is unavailable,
  - `analytics.tenants.tenant_ids` is empty.
- Keep the button placement readable on mobile and desktop.

### 2. CSV Data Mapping

- Generate one row per tenant ID in `analytics.tenants.tenant_ids`.
- Include columns for the current filter window:
  - `created_at_from`
  - `created_at_to`
  - `tenant_filter`
  - `marketplace_filter`
  - `validation_status_filter`
  - `workflow_step_filter`
  - `skip_sweeping_filter`
- Include columns for tenant and global analytics values:
  - `tenant_id`
  - `total_items`
  - `tenant_count`
  - `courier_count`
  - `marketplace_count`
  - `courier_codes`
  - `marketplaces`
  - `validation_pending`
  - `validation_verified_present`
  - `validation_missing_from_bin`
  - `validation_not_accepted_by_courier`
  - `validation_no_tracking_number`
  - `workflow_at_packing_station`
  - `workflow_being_validated`
  - `workflow_in_collection_bin`
  - `workflow_shipped_out`
  - `workflow_for_loading`
  - `workflow_loaded`
  - `workflow_not_accepted_by_courier`
  - `process_normal`
  - `process_skip`
- For list fields such as `courier_codes` and `marketplaces`, join values with `|` inside the CSV field.
- Escape CSV fields safely:
  - quote fields containing commas, quotes, pipes, newlines, or leading/trailing spaces,
  - double embedded quotes.
- Do not use `any`, `@ts-ignore`, or `@ts-expect-error`.

### 3. Browser Download

- Build a CSV string from headers and rows.
- Create a `Blob` with `text/csv;charset=utf-8`.
- Generate an object URL and trigger download through a temporary anchor element.
- Revoke the object URL after triggering the download.
- Use a filename that includes the active date range, for example:
  - `shipping-bin-items-analytics-YYYY-MM-DD-to-YYYY-MM-DD.csv`
- Do not write files to the repository, local backend, or runtime storage.

### 4. User Feedback and Edge Cases

- Show an error toast if export is requested without analytics data or tenant rows.
- Show a success toast after the browser download is triggered.
- If a selected filter is the all-option, write an empty value or `all` consistently in the CSV; document the chosen value in the progress tracker.
- Preserve the current dashboard loading, empty, error, and filter behavior.

### 5. Documentation and Progress

- At task start, update `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` with active phase, goal, in-progress work, and session notes.
- After each meaningful implementation change, update completed work and next steps.
- At task completion, update final status, verification run, skipped verification if any, open questions, and architecture decisions.
- Document explicitly that the CSV rows are tenant rows with global analytics metrics because the current API does not return per-tenant counts.

## Files or Areas to Inspect

1. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx`
2. `frontend/src/modules/ShippingBinItem/types/shipping-bin-item.type.ts`
3. `frontend/src/modules/ShippingBinItem/hooks/useShippingBinItems.ts`
4. `frontend/src/components/ui/button.tsx`
5. `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md`

## Data and Contracts

- **Inputs**: Currently loaded analytics response from `useShippingBinItemAnalytics`, plus current dashboard filter state.
- **Outputs**: A browser-downloaded CSV file with one row per tenant ID.
- **Validation Rules**:
  - Export only when analytics data and tenant IDs are available.
  - Preserve numeric values exactly as returned by the analytics response.
  - Do not infer per-tenant item counts from global totals.
  - CSV fields must be escaped so spreadsheet tools can open the file safely.
- **Compatibility Requirements**:
  - Analytics requests must continue through `useShippingBinItemAnalytics` and the shared Nest API client.
  - Preserve existing `x-tenant-id` behavior.
  - Do not change local Flask API behavior.
  - Do not change the remote analytics response contract.

## UX Requirements

- The export action is discoverable on the analytics dashboard.
- The button state communicates when export is unavailable.
- Download should not navigate away from the dashboard or mutate filters.
- The exported filename should clearly identify the report and selected date range.
- Existing dashboard layout must remain readable on mobile and desktop without overlapping controls.

## Technical Constraints

- Keep the implementation frontend-only.
- Prefer a small local utility function or component-local helper for CSV creation unless reuse clearly justifies a separate file.
- Use existing TypeScript types and `import type` for type-only imports.
- Use existing UI primitives and `sonner` toasts.
- Do not add new dependencies for CSV generation.
- Do not modify generated build output, runtime files, environment files, or unrelated modules.

## Methods or Entry Points to Inspect

1. `ShippingBinItemAnalytics`
2. `useShippingBinItemAnalytics`
3. `ShippingBinItemAnalytics`
4. `ShippingBinItemAnalyticsParams`
5. `toast` from `sonner`

## Acceptance Criteria

1. The analytics dashboard includes an `Export CSV` button.
2. The button is disabled while analytics are loading/fetching, errored, empty, or missing tenant rows.
3. Clicking the button downloads a CSV file in the browser.
4. The CSV contains one row per tenant ID from `analytics.tenants.tenant_ids`.
5. The CSV includes current filter values and global analytics totals/breakdowns.
6. The implementation does not invent per-tenant counts.
7. CSV field escaping handles commas, quotes, newlines, pipes, and whitespace.
8. The implementation adds no CSV dependency and stays frontend-only.
9. `npm run build` from `frontend/` passes.
10. `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` is updated with completed work, open questions, next steps, and verification notes.

## Verification Plan

- Re-read the final dashboard export code for type safety and response-contract correctness.
- Run:
  - `npm run build` from `frontend/`
- Manually load the analytics dashboard and confirm:
  - the button is disabled before data is exportable,
  - the button downloads a `.csv` file after data loads,
  - the CSV has one row per tenant ID,
  - filters and global metrics are present in the exported rows.
- If manual browser verification is skipped, record the reason in the progress tracker and final response.

## Open Questions

- Should all-option filters be exported as `all` or an empty field?
- Should the CSV include a metadata row above the header in the future, or only strict tabular rows?
- If the API later adds per-tenant counts, should the CSV switch from global metrics per tenant row to true per-tenant metrics?
