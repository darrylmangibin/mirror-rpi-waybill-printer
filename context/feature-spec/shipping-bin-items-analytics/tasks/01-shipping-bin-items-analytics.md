# Task: Shipping Bin Items Analytics Service and Hook

## Source

- **Project Overview**: `context/project-overview.md`
- **Feature Overview**: `context/feature-spec/shipping-bin-items-analytics/feature-overview.md`
- **Architecture**: `context/architecture.md`
- **Code Standards**: `context/code-standards.md`
- **AI Workflow Rules**: `context/ai-workflow-rules.md`
- **Progress Tracker**: `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md`

## Objective

Create the frontend service and TanStack Query hook needed to load shipping-bin-item analytics from the remote FusionTech Nest API. The service must call the analytics endpoint with the supported filters, and the hook must expose that service through a reusable module-scoped query for future analytics UI work.

## Background

Shipping Bin Items Analytics is a frontend-only integration with FusionTech's remote Nest API. The local Flask/CUPS backend remains out of scope. This task establishes the data-access layer for the analytics dashboard before UI components are implemented. Follow the existing `ShippingBinItem` service and hook patterns so tenant-aware Nest API behavior and query caching stay consistent with the current frontend modules.

## Scope

### In Scope

- Add a module service function for `GET /shipping-bin-items/analytics`.
- Add request parameter typing for the analytics filters.
- Add response typing for the analytics payload, using explicit interfaces that can be refined if the API contract provides more detail during implementation.
- Add a TanStack Query hook that calls the analytics service.
- Add or reuse a stable query-key constant for analytics caching.
- Update `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` during implementation.

### Out of Scope

- Analytics dashboard page, route registration, navigation, cards, filters, and charts.
- Local Flask backend routes, SQLite models, migrations, CUPS, waybill printing, or runtime storage changes.
- Raw shipping-bin-item list behavior under `/shipping-bin-items`.
- New dependencies or new API clients.
- Inventing analytics dimensions that are not returned by the API.

## What to Implement

### 1. Analytics Service

- Create a service for the remote Nest API endpoint:
  - Endpoint: `/shipping-bin-items/analytics`
  - HTTP method: `GET`
  - Client: existing `nestApi` from `frontend/src/lib/nest.api.ts`
- Place the service in the shipping-bin-item analytics feature area that best matches existing module conventions.
- Use the existing `ShippingBinItem` service as the main pattern reference:
  - `frontend/src/modules/ShippingBinItem/services/shipping-bin-item.service.ts`
- Support these query params:
  - `created_at_from?: string`
    - Date-only `YYYY-MM-DD`.
    - Start of the analytics range.
  - `created_at_to?: string`
    - Date-only `YYYY-MM-DD`.
    - End of the analytics range.
  - `tenant_id?: string`
    - Filter by stored tenant ID in `shipping_bin_items`.
  - `marketplace?: string`
    - Filter by marketplace/integration name.
  - `validation_status?: ShippingBinItemValidationStatus`
    - Filter by validation state.
    - Use the existing validation-status type where possible.
  - `workflow_step?: ShippingBinItemWorkflowStep`
    - Filter by workflow step.
    - Use the existing workflow-step type where possible.
  - `skip_sweeping?: boolean`
    - Filter normal versus skip-sweeping items.
    - Preserve boolean typing in the DTO/query params.
- Avoid JSON-stringifying filters unless the analytics API requires it. This endpoint's contract lists direct query params, unlike the paginated list service's `query` wrapper.
- Do not hardcode base URLs or tenant headers. The service must rely on the shared Nest API client behavior.

### 2. Analytics Types

- Define a request params type for the analytics query.
- Define an analytics response type near the service or in a module `types/` file.
- The response type should cover the dashboard needs from the feature overview:
  - Parcel totals.
  - Order totals.
  - Shipping bin item totals.
  - Tenant breakdowns.
  - Courier breakdowns.
  - Validation-status breakdowns.
  - Workflow-step breakdowns.
  - Normal versus skip-sweeping breakdowns.
- If the exact API payload shape is not available during implementation, model only the fields that are confirmed from the backend/API response and record any missing contract details in the progress tracker.

### 3. Analytics Hook

- Create a hook that wraps the analytics service with TanStack Query.
- Use the existing hook as the main pattern reference:
  - `frontend/src/modules/ShippingBinItem/hooks/useShippingBinItems.ts`
- The hook should:
  - Accept analytics query params.
  - Include params in the query key.
  - Use a stable analytics-specific query key.
  - Allow callers to pass TanStack Query options without overriding `queryKey` or `queryFn`.
  - Return the query result directly.
- Keep the hook focused on server state only. Do not add UI filter state, date defaulting, toast behavior, routing, or component-specific logic in this task.

### 4. Documentation and Progress

- At task start, update the progress tracker `Current Phase`, `Current Goal`, `In Progress`, and `Session Notes`.
- After each meaningful implementation change, update the progress tracker with completed work and next steps.
- At task completion, update the progress tracker with final status, verification run, skipped verification if any, and open questions.
- Keep this task file aligned if the discovered API response contract differs from the initial assumptions.

## Files or Areas to Inspect

1. `frontend/src/modules/ShippingBinItem/services/shipping-bin-item.service.ts`
2. `frontend/src/modules/ShippingBinItem/hooks/useShippingBinItems.ts`
3. `frontend/src/modules/ShippingBinItem/types/shipping-bin-item.type.ts`
4. `frontend/src/modules/ShippingBinItem/constants/shipping-bin-item.constant.ts`
5. `frontend/src/lib/nest.api.ts`
6. `frontend/src/common/types/common.types.ts`

## Data and Contracts

- **Inputs**: Date-only range strings, tenant ID, marketplace, validation status, workflow step, and `skip_sweeping` boolean query params.
- **Outputs**: Analytics aggregate payload from the remote Nest API, typed for totals and breakdowns required by the dashboard.
- **Validation Rules**:
  - Date strings should be passed as date-only `YYYY-MM-DD` values.
  - `validation_status` must use the known shipping-bin-item validation-status values.
  - `workflow_step` must use the known shipping-bin-item workflow-step values.
  - `skip_sweeping` must remain boolean in frontend types.
- **Compatibility Requirements**:
  - Preserve existing `x-tenant-id` behavior by using `nestApi`.
  - Do not change the existing paginated shipping-bin-items list service or hook unless needed for shared type exports.
  - Do not introduce local Flask API calls for this feature.

## UX Requirements

- No UI is required in this task.
- The service and hook should be ready for a future dashboard to implement loading, empty, error, and filtered analytics states.

## Technical Constraints

- Follow existing module-level service and hook patterns.
- Keep changes limited to the frontend remote Nest API data-access boundary.
- Do not introduce new dependencies.
- Use explicit TypeScript interfaces/types and avoid `any`, `@ts-ignore`, or `@ts-expect-error`.
- Use `import type` for type-only imports.
- Use the `@/` alias for frontend imports.

## Methods or Entry Points to Inspect

1. `getShippingBinItems`
2. `useShippingBinItems`
3. `nestApi.get`
4. `ShippingBinItemValidationStatus`
5. `ShippingBinItemWorkflowStep`

## Acceptance Criteria

1. A shipping-bin-item analytics service calls `GET /shipping-bin-items/analytics` through `nestApi`.
2. The service accepts the supported direct query params: `created_at_from`, `created_at_to`, `tenant_id`, `marketplace`, `validation_status`, `workflow_step`, and `skip_sweeping`.
3. Analytics request and response types are explicit and reuse existing shipping-bin-item enum/string-union types where appropriate.
4. A TanStack Query hook exposes the analytics service with a stable query key that includes params.
5. Existing shipping-bin-item list service and hook behavior remains unchanged.
6. `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` is updated with completed work, open questions, and verification notes.

## Verification Plan

- Re-read the final service and hook files for consistency with existing module patterns.
- Run frontend TypeScript diagnostics or the narrowest available frontend check for changed files.
- If practical, run `npm run build` from `frontend/`.
- If the remote API is reachable and safe to call, manually verify that the service sends direct query params to `/shipping-bin-items/analytics`.
- Record skipped verification in the progress tracker and final response.

## Open Questions

- What is the exact analytics response payload shape returned by `/shipping-bin-items/analytics`?
- Should the analytics hook be enabled by default when no date range is provided, or should the future UI supply default dates before enabling the query?
