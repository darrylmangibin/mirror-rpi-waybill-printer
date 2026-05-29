# Task: Shipping Bin Items Analytics Filtered Item Table

## Source

- **Project Overview**: `context/project-overview.md`
- **Feature Overview**: `context/feature-spec/shipping-bin-items-analytics/feature-overview.md`
- **Architecture**: `context/architecture.md`
- **Code Standards**: `context/code-standards.md`
- **AI Workflow Rules**: `context/ai-workflow-rules.md`
- **Progress Tracker**: `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md`
- **Previous Task**: `context/feature-spec/shipping-bin-items-analytics/tasks/03-shipping-bin-items-analytics.md`

## Objective

Add a read-only shipping-bin-items table to the Shipping Bin Items Analytics dashboard so operators can inspect the raw shipping bin items represented by the currently selected analytics filters.

## Background

The analytics dashboard currently loads aggregate data through `useShippingBinItemAnalytics(params)` and builds `ShippingBinItemAnalyticsParams` directly from local filter state. The raw shipping-bin-items list is already available through `useShippingBinItems(params)`, which calls `GET /shipping-bin-items` with `ApiQueryParams`. That service serializes `params.query` as JSON, so table filters must be expressed as Prisma-style query options under `query.where`, not as the direct analytics endpoint params.

The existing `ShippingBinItemsList` component shows the established item table, pagination, loading, empty, error, tenant filter, sync-status filter, and row display patterns. This task should reuse those patterns where practical, while keeping the analytics page focused on filtered read-only inspection instead of manifest-detail actions.

## Scope

### In Scope

- Add a shipping-bin-items table/list section to `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx`.
- Call `useShippingBinItems` from `frontend/src/modules/ShippingBinItem/hooks/useShippingBinItems.ts` on the analytics page.
- Convert the analytics filter state into `ApiQueryParams` for the list endpoint using `query.where` and `query.orderBy`.
- Keep the table filtered by the same selected date range, tenant, marketplace, validation status, workflow step, and skip-sweeping filter as the analytics summary.
- Add pagination controls for the table request.
- Render loading, fetching, empty, and error states for the item table independently from the analytics aggregate query.
- Update the progress tracker during implementation.

### Out of Scope

- Backend Flask routes, SQLite models, migrations, local CUPS/printer behavior, or local waybill print APIs.
- Remote Nest API changes or new shipping-bin-item endpoints.
- Editing, syncing, exporting, selecting, or mutating shipping bin items from the analytics table.
- Changing existing Shipping Manifest detail table behavior.
- Changing aggregate analytics request behavior except where needed to share filter state safely.

## What to Implement

### 1. Analytics Filter to List Query Mapping

- In `ShippingBinItemAnalytics`, build a second memoized params object for `useShippingBinItems`.
- Use `ApiQueryParams` from `frontend/src/common/types/common.types.ts`.
- Include pagination values:
  - `page`
  - `perPage`
- Put filter conditions under `query.where` because `getShippingBinItems` serializes `query` for the Prisma-style list API.
- Preserve the current analytics filter semantics:
  - all-tenant omits `tenant_id`, otherwise set `where.tenant_id`.
  - all-marketplace omits `marketplace`, otherwise set `where.marketplace`.
  - all-validation-status omits `validation_status`, otherwise set `where.validation_status`.
  - all-workflow-step omits `workflow_step`, otherwise set `where.workflow_step`.
  - skip-sweeping off omits the filter, skip-sweeping on sets the Prisma field used by shipping-bin-items for skip-sweeping to boolean `true`.
- Convert `created_at_from` and `created_at_to` into a Prisma-compatible `created_at` range in `query.where`; confirm the exact expected shape from the existing API contract before implementation.
- Add a deterministic default ordering, such as newest created or updated items first, through `query.orderBy`.
- Reset the table page to `1` whenever any analytics filter changes.

### 2. Use `useShippingBinItems` on the Analytics Page

- Import and call `useShippingBinItems(listParams)` alongside `useShippingBinItemAnalytics(params)`.
- Keep the aggregate analytics query and raw item query separate so one error state does not hide the other unless the page-level design intentionally does so.
- Use `data.data` for table rows and `data.meta` for pagination values.
- Keep the query key stable by memoizing list params from primitive filter and pagination state.
- Do not pass direct `ShippingBinItemAnalyticsParams` into `useShippingBinItems`; the list hook expects `ApiQueryParams`.

### 3. Read-Only Item Table UI

- Add a new section below the aggregate analytics cards/breakdowns for the matching shipping bin items.
- Use shared table primitives from `frontend/src/components/ui/table` and existing visual patterns from `ShippingBinItemsList`.
- Display operator-useful columns from `ShippingBinItem`, such as:
  - invoice number and tracking number,
  - tenant ID,
  - courier and courier code,
  - marketplace and platform slug,
  - workflow step,
  - validation status,
  - sync status,
  - created, updated, or shipped-out date.
- Reuse existing badge/date presentation patterns from `ShippingBinItemsList` when possible without pulling in manifest-only selection, export, close-manifest, or sync behavior.
- Keep the table read-only: no row selection, no export modal, no sync action button, and no manifest close action.
- Show the total number of matching items from pagination metadata.

### 4. Table Pagination and Refresh

- Add table-local `page` and `perPage` state.
- Provide previous/next page controls and a per-page selector consistent with the existing shipping-bin-items table.
- Disable pagination controls while the item query is fetching.
- Add a refresh action for the raw item list or ensure the existing analytics refresh also refetches both aggregate data and table data.
- Preserve existing analytics reset behavior and make sure it also resets the item table to page `1`.

### 5. Loading, Error, Empty, and Fetching States

- Show a table skeleton or loading rows while `useShippingBinItems` is loading.
- Show a table-level error state with retry when the list endpoint fails.
- Show an empty state when the list query succeeds with no matching rows for the selected filters.
- When filters change and the table is refetching, keep the table readable and indicate fetching without removing the already displayed layout.
- Do not let an empty analytics aggregate response prevent the operator from seeing the item table if the item query has rows for the same filters.

### 6. Documentation and Progress

- At task start, update `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` with active phase, goal, in-progress work, and session notes.
- After meaningful implementation changes, update completed work and next steps.
- At completion, update final status, verification run, skipped verification if any, open questions, and architecture decisions.
- Document the final Prisma-style `query.where` shape used for the table filters, especially the `created_at` range and skip-sweeping field.

## Files or Areas to Inspect

1. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx`
2. `frontend/src/modules/ShippingBinItem/hooks/useShippingBinItems.ts`
3. `frontend/src/modules/ShippingBinItem/services/shipping-bin-item.service.ts`
4. `frontend/src/modules/ShippingBinItem/types/shipping-bin-item.type.ts`
5. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemsList/index.tsx`
6. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemsList/components/DateCell.tsx`
7. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemsList/components/StatusBadges.tsx`
8. `frontend/src/common/types/common.types.ts`
9. `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md`

## Data and Contracts

- **Inputs**: Current analytics filter state, table pagination state, and tenant configuration display data already used by the analytics page.
- **Outputs**: A read-only paginated shipping-bin-items table showing rows returned by `useShippingBinItems` for the selected filters.
- **Validation Rules**:
  - List params must use `ApiQueryParams` with Prisma-style `query.where` and `query.orderBy`.
  - All-option filters must be omitted from `where` rather than sent as the literal `all` value.
  - Date filters must remain date-only in UI state and be converted only when building the Prisma-compatible list query.
  - `skip_sweeping` must remain boolean in frontend state and must not be stringified.
  - Table pagination must reset to page `1` when filter values change.
- **Compatibility Requirements**:
  - Analytics aggregate requests must continue through `useShippingBinItemAnalytics` and direct analytics query params.
  - Raw item requests must go through `useShippingBinItems` and the shared `nestApi` service path.
  - Preserve existing `x-tenant-id` behavior from `nestApi`.
  - Do not change local Flask API behavior.
  - Do not break the existing `ShippingBinItemsList` manifest detail table.

## UX Requirements

- Operators can see the aggregate analytics and the matching raw shipping-bin-item rows on the same dashboard.
- The item table clearly communicates which selected filters it is using through its placement, heading, count, or supporting copy.
- The table remains usable on mobile and desktop widths without overlapping controls.
- Loading, empty, error, fetching, and populated states are visible and understandable.
- The table should not navigate away from the analytics dashboard or mutate shipping-bin-item records.

## Technical Constraints

- Keep the implementation frontend-only under the ShippingBinItem module unless a small shared presentation extraction is clearly justified.
- Prefer existing UI primitives, row rendering, badge components, and pagination patterns over new abstractions.
- Use `@/` imports and `import type` for type-only imports.
- Do not use `any`, `@ts-ignore`, or `@ts-expect-error`.
- Do not add dependencies.
- Do not modify generated build output, runtime files, environment files, or unrelated modules.

## Methods or Entry Points to Inspect

1. `ShippingBinItemAnalytics`
2. `useShippingBinItems`
3. `useShippingBinItemAnalytics`
4. `getShippingBinItems`
5. `ShippingBinItemsList`
6. `ShippingBinItem`
7. `ApiQueryParams`

## Acceptance Criteria

1. The analytics dashboard renders a shipping-bin-items table below the aggregate analytics content.
2. The table calls `useShippingBinItems` from `frontend/src/modules/ShippingBinItem/hooks/useShippingBinItems.ts`.
3. The table query params are derived from the same analytics filters shown in `ShippingBinItemAnalytics`.
4. The item list params use `ApiQueryParams.query.where` with Prisma-style filters rather than direct analytics endpoint params.
5. Date range, tenant, marketplace, validation status, workflow step, and skip-sweeping filters affect both aggregate analytics and the raw item table.
6. Changing filters resets the item table to page `1`.
7. The table supports pagination and per-page control using response `meta` values.
8. The table has independent loading, fetching, empty, error, retry, and populated states.
9. The table is read-only and does not add item mutation, export, selection, sync, or manifest-close behavior.
10. Existing analytics cards, charts, filters, refresh, and reset behavior continue to work.
11. `npm run build` from `frontend/` passes.
12. The analytics dashboard is manually verified in the browser by changing filters and confirming the item table request/result changes with the selected filters.
13. `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` is updated with completed work, open questions, next steps, and verification notes.

## Verification Plan

- Re-read the final analytics component and any extracted table presentation code for type safety, query-contract correctness, and scope discipline.
- Run:
  - `npm run build` from `frontend/`
- Manually load `/shipping-manifests/shipping-bin-items/analytics` in the browser and confirm:
  - the item table appears on the analytics dashboard,
  - changing each filter changes the raw item list query/result,
  - all-option filters are omitted from the list `where` clause,
  - pagination and per-page controls request the correct page size,
  - loading, empty, and error states remain understandable.
- If the remote API is unavailable for manual verification, record the limitation in the progress tracker and final response.

## Open Questions

- What exact Prisma `created_at` range shape does the remote `/shipping-bin-items` endpoint expect for date-only filters?
- What is the exact shipping-bin-item field that represents skip-sweeping in the list endpoint response/query contract?
- Should the analytics refresh button refetch both aggregate analytics and raw item rows, or should the table have a separate refresh button only?
