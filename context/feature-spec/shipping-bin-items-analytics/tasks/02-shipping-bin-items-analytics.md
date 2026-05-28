# Task: Shipping Bin Items Analytics Dashboard UI

## Source

- **Project Overview**: `context/project-overview.md`
- **Feature Overview**: `context/feature-spec/shipping-bin-items-analytics/feature-overview.md`
- **Architecture**: `context/architecture.md`
- **Code Standards**: `context/code-standards.md`
- **AI Workflow Rules**: `context/ai-workflow-rules.md`
- **Progress Tracker**: `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md`
- **Previous Task**: `context/feature-spec/shipping-bin-items-analytics/tasks/01-shipping-bin-items-analytics.md`

## Objective

Create the operator-facing Shipping Bin Items Analytics dashboard UI that displays data from `useShippingBinItemAnalytics`, provides filters backed by `ShippingBinItemAnalyticsParams`, and exposes navigation to the dashboard from the Shipping Manifest list page.

## Background

Task 01 added the data-access layer for the remote Nest API analytics endpoint through `useShippingBinItemAnalytics`. This task builds the frontend page that consumes that hook. The feature remains frontend-only and must preserve the existing FusionTech Nest API tenant-header behavior; the local Flask/CUPS backend remains out of scope.

The dashboard should help warehouse supervisors quickly understand workload and exception volume. `total_items` must be the most prominent metric wherever analytics data is displayed, including summary cards and chart/breakdown sections.

## Scope

### In Scope

- Add a button on the Shipping Manifest list page that navigates to `/shipping-manifests/shipping-bin-items/analytics`.
- Register a frontend route and page for the analytics dashboard.
- Build a dashboard component that calls `useShippingBinItemAnalytics` from `frontend/src/modules/ShippingBinItem/hooks/useShippingBinItems.ts`.
- Display analytics totals and breakdowns with `total_items` treated as the primary, most visually prominent value on every relevant data block.
- Add a filter area using fields from `ShippingBinItemAnalyticsParams`.
- Use tenant options loaded through `useTenantConfigurations`.
- Add chart UI using shadcn chart patterns. shadcn charts are not installed yet, so add the required chart primitive/dependency in the normal shadcn-compatible way.
- Add loading, empty, and error states suitable for operator monitoring.
- Update the shipping-bin-items analytics progress tracker during implementation.

### Out of Scope

- Backend Flask routes, SQLite models, migrations, CUPS, printer behavior, or local waybill print APIs.
- Changes to the existing analytics service or hook unless implementation reveals a mismatch with the UI contract.
- Raw shipping-bin-item table/list behavior.
- Export, drilldown, raw-item editing, sync, or manifest-management workflow changes.
- Inventing analytics dimensions that are not returned by the current `useShippingBinItemAnalytics` response.

## What to Implement

### 1. Navigation From Shipping Manifest List

- In `frontend/src/modules/ShippingManifest/components/ShippingManifestList/index.tsx`, add an operator-visible button that navigates to `/shipping-manifests/shipping-bin-items/analytics`.
- Use the existing `useNavigate` instance and shared `Button` UI primitive.
- Place the button where it is discoverable from the Shipping Manifest page without disrupting scanner behavior, status filters, pagination, or manifest creation.
- Prefer a concise label such as `Analytics` or `Shipping Bin Items Analytics`; use a lucide icon if it fits the existing page style.

### 2. Route and Page

- Register a React Router route in `frontend/src/App.tsx`:
  - Path: `/shipping-manifests/shipping-bin-items/analytics`
  - Element: a new route-level page under `frontend/src/pages/`.
- Keep the page thin and delegate the UI to a module component under `frontend/src/modules/ShippingBinItem/`.
- Follow existing page naming conventions such as `frontend/src/pages/shipping-manifest/page.tsx` and `frontend/src/pages/shipping-manifest-details/page.tsx`.

### 3. Analytics Dashboard Component

- Create a dashboard component in the ShippingBinItem module, for example under:
  - `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/`
- The component must call:
  - `useShippingBinItemAnalytics(params)`
- The component should display the current analytics response sections defined in:
  - `frontend/src/modules/ShippingBinItem/types/shipping-bin-item.type.ts`
- Render the top-level totals and breakdowns available from the hook response.
- Make `total_items` the primary value on every data block. If the current response type uses `total` instead of `total_items`, inspect the API payload or existing type before binding and document the mismatch in the progress tracker.
- Include loading skeletons or a loading state while the analytics query is pending.
- Include an error state with a retry action when the analytics query fails.
- Include an empty state when no totals or breakdowns are available for the selected filters.

### 4. Charts and Visual Presentation

- Use shadcn chart patterns for breakdown visualization. shadcn charts are not installed yet.
- Add the needed chart primitive/dependency in the frontend project in the standard shadcn-compatible way, and keep dependency changes limited to what the chart component requires.
- Use chart types that fit aggregate breakdowns:
  - Tenant distribution.
  - Courier distribution.
  - Validation status distribution.
  - Workflow step distribution.
  - Skip-sweeping distribution.
- Keep charts supportive rather than dominant; `total_items` should remain more prominent than secondary labels or percentages.
- Use existing Tailwind tokens and shared UI primitives. Do not modify shared UI primitives for one-off styling unless adding the shadcn chart primitive itself requires it.

### 5. Filter Area

- Build a controlled filter area whose state maps to `ShippingBinItemAnalyticsParams`:
  - `created_at_from?: string`
  - `created_at_to?: string`
  - `tenant_id?: string`
  - `marketplace?: string`
  - `validation_status?: ShippingBinItemValidationStatus`
  - `workflow_step?: ShippingBinItemWorkflowStep`
  - `skip_sweeping?: boolean`
- Date filters:
  - Provide calendar controls for `created_at_from` and `created_at_to`.
  - Default both values to the current date.
  - Format query param values as `YYYY-MM-DD`.
  - Preserve date-only values; do not send full timestamps.
- Tenant filter:
  - Load options through `frontend/src/modules/TenantConfiguration/hooks/useTenantConfigurations.ts`.
  - Use the tenant identifier expected by `ShippingBinItemAnalyticsParams.tenant_id`.
  - Include an all-tenants option that omits `tenant_id` from params.
- Marketplace filter:
  - Provide fixed options for `tiktok`, `shopee`, `zalora`, `lazada`, and `shopify`.
  - Include an all-marketplaces option that omits `marketplace` from params.
- Validation-status filter:
  - Map options from `ShippingBinItemValidationStatus`.
  - Keep submitted values aligned with the type values in `frontend/src/modules/ShippingBinItem/types/shipping-bin-item.type.ts`.
- Workflow-step filter:
  - Map options from `ShippingBinItemWorkflowStep`.
  - Keep submitted values aligned with the type values in `frontend/src/modules/ShippingBinItem/types/shipping-bin-item.type.ts`.
- Skip-sweeping filter:
  - Use a switch control.
  - Send `skip_sweeping` as a boolean when enabled or explicitly selected.
  - Avoid stringifying boolean values in component state.
- Ensure changing filters updates the analytics query params and refetches through TanStack Query.

### 6. Documentation and Progress

- At task start, update `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` with the active phase, goal, in-progress work, and session note.
- After each meaningful implementation change, update the progress tracker with completed work and next steps.
- At task completion, update the progress tracker with final status, verification run, skipped verification if any, open questions, and architecture decisions.
- If the API payload uses `total_items` while the local type still uses `total`, or vice versa, document the discovered contract and update the type or task notes as part of this task.

## Files or Areas to Inspect

1. `frontend/src/modules/ShippingBinItem/hooks/useShippingBinItems.ts`
2. `frontend/src/modules/ShippingBinItem/types/shipping-bin-item.type.ts`
3. `frontend/src/modules/ShippingBinItem/services/shipping-bin-item.service.ts`
4. `frontend/src/modules/ShippingBinItem/constants/shipping-bin-item.constant.ts`
5. `frontend/src/modules/TenantConfiguration/hooks/useTenantConfigurations.ts`
6. `frontend/src/modules/TenantConfiguration/types/tenant-configuration.type.ts`
7. `frontend/src/modules/ShippingManifest/components/ShippingManifestList/index.tsx`
8. `frontend/src/App.tsx`
9. `frontend/src/pages/shipping-manifest/page.tsx`
10. `frontend/src/components/ui/`
11. `frontend/package.json`

## Data and Contracts

- **Inputs**: Analytics filter state mapped to `ShippingBinItemAnalyticsParams`.
- **Outputs**: Analytics dashboard UI displaying totals and breakdowns from `useShippingBinItemAnalytics`.
- **Validation Rules**:
  - `created_at_from` and `created_at_to` must be date-only `YYYY-MM-DD` strings.
  - Default date range is the current date for both fields.
  - `tenant_id`, `marketplace`, `validation_status`, and `workflow_step` should be omitted when the corresponding all-option is selected.
  - `validation_status` values must match `ShippingBinItemValidationStatus`.
  - `workflow_step` values must match `ShippingBinItemWorkflowStep`.
  - `skip_sweeping` must remain boolean in frontend state and query params.
- **Compatibility Requirements**:
  - Analytics requests must continue through `useShippingBinItemAnalytics` and the shared Nest API client.
  - Preserve existing `x-tenant-id` behavior.
  - Do not change local Flask API behavior.
  - Do not break existing Shipping Manifest list scanning, filtering, creation, or navigation behavior.

## UX Requirements

- The Shipping Manifest list page provides a clear navigation button to the analytics dashboard.
- The analytics dashboard opens directly at `/shipping-manifests/shipping-bin-items/analytics`.
- The first dashboard view loads analytics for the current date by default.
- `total_items` is visually dominant in summary and breakdown sections.
- Filters are grouped in a dedicated filter area and can be changed without leaving the page.
- Calendar controls should be usable on desktop and mobile widths.
- Selects/switches should use existing shared UI primitives where available.
- Loading, error, retry, and empty states must be visible and understandable for an operator.
- The layout must remain readable on mobile and desktop without overlapping text or controls.

## Technical Constraints

- Follow existing React/Vite, TypeScript, TanStack Query, and Tailwind patterns.
- Use `@/` imports and `import type` for type-only imports.
- Avoid `any`, `@ts-ignore`, and `@ts-expect-error`.
- Keep the route page thin and module UI under `frontend/src/modules/ShippingBinItem/`.
- Use existing UI primitives before adding new primitives.
- Add only chart-related dependencies/primitives needed for shadcn charts.
- Do not modify generated build output, runtime files, environment files, or unrelated modules.

## Methods or Entry Points to Inspect

1. `useShippingBinItemAnalytics`
2. `ShippingBinItemAnalyticsParams`
3. `ShippingBinItemValidationStatus`
4. `ShippingBinItemWorkflowStep`
5. `useTenantConfigurations`
6. `ShippingManifestList`
7. `App`

## Acceptance Criteria

1. The Shipping Manifest list page includes a button that navigates to `/shipping-manifests/shipping-bin-items/analytics`.
2. The app registers a route for `/shipping-manifests/shipping-bin-items/analytics` and renders a thin page wrapper.
3. The analytics page calls `useShippingBinItemAnalytics` with filter params derived from the UI.
4. `created_at_from` and `created_at_to` default to the current date and are sent as `YYYY-MM-DD`.
5. Tenant options are loaded through `useTenantConfigurations`.
6. Marketplace options include `tiktok`, `shopee`, `zalora`, `lazada`, and `shopify`.
7. Validation-status and workflow-step options use the existing `ShippingBinItemValidationStatus` and `ShippingBinItemWorkflowStep` values.
8. `skip_sweeping` is controlled by a switch and passed as a boolean.
9. The dashboard displays top-level totals and available breakdowns, with `total_items` as the most prominent value on every data block.
10. shadcn chart support is added and used for analytics breakdowns without broad unrelated dependency changes.
11. Loading, empty, error, and retry states are implemented.
12. Existing Shipping Manifest list behavior remains intact.
13. `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` is updated with completed work, open questions, next steps, and verification notes.

## Verification Plan

- Re-read the final dashboard, route, and navigation files for consistency with existing module patterns.
- Run TypeScript diagnostics through the frontend build:
  - `npm run build` from `frontend/`
- If chart primitives/dependencies are added, verify the lockfile and dependency changes are limited to chart requirements.
- Manually load the frontend dashboard route and confirm:
  - The Shipping Manifest list button navigates to the analytics route.
  - The dashboard sends current-date params by default.
  - Each filter updates the query params passed to `useShippingBinItemAnalytics`.
  - Loading, empty, error, and populated states render without layout overlap.
- If the remote API is reachable and safe to call, confirm the payload field names for totals, especially `total_items`.
- Record skipped verification and reasons in the progress tracker and final response.

## Open Questions

- Does the live `/shipping-bin-items/analytics` response use `total`, `total_items`, or both for each aggregate section?
- Which tenant field from `TenantConfiguration` should be shown as the label if multiple display-name fields are available?
- Should `skip_sweeping: false` be sent when the switch is off, or should the filter be omitted until the operator explicitly chooses a skip-sweeping value?
