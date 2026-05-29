# Task: Update Shipping Bin Item Analytics Manifest Area

## Source

- **Project Overview**: `context/project-overview.md`
- **Feature Overview**: `context/feature-spec/shipping-bin-items-analytics/feature-overview.md`
- **Architecture**: `context/architecture.md`
- **Code Standards**: `context/code-standards.md`
- **AI Workflow Rules**: `context/ai-workflow-rules.md`
- **Progress Tracker**: `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md`
- **Previous Task**: `context/feature-spec/shipping-bin-items-analytics/tasks/05-shipping-bin-items-analytics.md`

## Objective

Update the Shipping Bin Item Analytics manifest area so it renders the new manifest and current-bin response shape, and add filters for shipping bin category and dynamic shipping bin codes without changing unrelated analytics behavior.

## Background

The `getShippingBinItemAnalytics` response now includes a richer `manifest` object and a new `current_bin` object. The manifest section now returns:

```json
{
  "with_manifest_count": 1583,
  "without_manifest_count": 363,
  "total_courier_scan_completed": 166,
  "total_courier_dispatched": 166
}
```

The analytics payload also includes `current_bin`, which contains a top-level total count and grouped breakdowns for `shipping_station` and `collection_hub`. Each group has a `count` and a dynamic `shipping_bin_codes` object whose keys are the available shipping bin codes for that category.

The manifest area in `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx` currently does not reflect this expanded shape. The dashboard also needs new filter support for `shipping_bin_category` and, if feasible, a dependent multi-select for dynamic `shipping_bin_code` values that are derived from the loaded analytics data.

## Scope

### In Scope

- Update the manifest section in `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx` to display the new manifest totals.
- Add a bar chart or equivalent analytics visualization for `current_bin` totals, including `shipping_station` and `collection_hub`.
- Surface dynamic shipping bin code breakdowns for the selected category in the analytics UI.
- Add a `shipping_bin_category` filter with at least `shipping_station` and `collection_hub` options.
- Add a dependent multi-select filter for `shipping_bin_code` values when the analytics data exposes them.
- Keep the change limited to the Shipping Bin Item Analytics feature surface and its nearby types/utils/hooks if needed.

### Out of Scope

- Backend API changes or response-shape changes.
- Modifying unrelated Shipping Bin Item tables or manifest workflows.
- Changing existing date, tenant, marketplace, validation, workflow, or skip-sweeping behavior beyond the new filter interactions.
- Adding speculative fallback behavior for response shapes that are not present in the supplied API contract.

## What to Implement

### 1. Manifest Area Update

- Render the updated manifest metrics from `manifest.with_manifest_count`, `manifest.without_manifest_count`, `manifest.total_courier_scan_completed`, and `manifest.total_courier_dispatched`.
- Keep the manifest area consistent with the current analytics card/breakdown styling.
- Preserve loading, empty, and error handling around the analytics dashboard.

### 2. Current Bin Breakdown

- Add a bar chart or equivalent breakdown for `current_bin.total_count`.
- Show the `shipping_station.count` and `collection_hub.count` values.
- If the current chart pattern supports it, render the dynamic shipping bin code groups as drill-down or nested breakdown data.
- Treat `shipping_bin_codes` keys as dynamic values coming from the analytics response.

### 3. Shipping Bin Filters

- Add a new filter for shipping bin category using the `current_bin` categories.
- Add a dependent multi-select for shipping bin codes that is populated from the analytics response.
- Make the shipping bin code options dynamic so they are derived after analytics data loads.
- Keep the selection multi-value friendly and ensure the filter can be cleared back to an all-items state.

### 4. Documentation and Progress

- Update `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` when implementation starts and when it completes.
- Record any open questions about how the shipping bin category/code filters should map into the request contract.

## Files or Areas to Inspect

1. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx`
2. `frontend/src/modules/ShippingBinItem/services/shipping-bin-item.service.ts`
3. `frontend/src/modules/ShippingBinItem/types/shipping-bin-item.type.ts`
4. `frontend/src/modules/ShippingBinItem/hooks/useShippingBinItems.ts`
5. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/utils.ts`
6. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/types.ts`

## Data and Contracts

- **Inputs**: The expanded `getShippingBinItemAnalytics` response including `manifest` and `current_bin`.
- **Outputs**: Updated manifest analytics UI and new shipping bin category/code filters.
- **Validation Rules**:
  - Render the new manifest totals exactly from the returned analytics fields.
  - Derive category/code filter options from loaded analytics data.
  - Preserve existing analytics behavior for all unrelated filters and cards.
- **Compatibility Requirements**:
  - Do not break the existing analytics summary cards or breakdown panels.
  - Do not change the remote API contract.
  - Keep the implementation frontend-only.

## UX Requirements

- The manifest area should clearly show the new totals without making the dashboard harder to scan.
- The current-bin breakdown should help operators see whether shipping stations or collection hubs dominate the selected slice.
- Shipping bin category and code filters should be understandable and usable even though the code values are dynamic.
- The filter UI should not require a page refresh just to discover available category/code options once analytics data is loaded.

## Technical Constraints

- Follow the local module patterns already used in Shipping Bin Item Analytics.
- Keep the change as small as possible.
- Do not add dependencies.
- Do not invent response fields beyond the supplied payload shape.
- Do not make the code filter static; it must be derived from analytics data.

## Methods or Entry Points to Inspect

1. `ShippingBinItemAnalytics`
2. `getShippingBinItemAnalytics`
3. `ShippingBinItemAnalyticsParams`
4. Analytics filter builders and chart mappers in `utils.ts`

## Acceptance Criteria

1. The manifest area shows `with_manifest_count`, `without_manifest_count`, `total_courier_scan_completed`, and `total_courier_dispatched`.
2. The analytics dashboard displays a current-bin breakdown for `shipping_station` and `collection_hub`.
3. Dynamic shipping bin codes are rendered from the analytics response instead of hard-coded values.
4. The dashboard exposes a shipping bin category filter with `shipping_station` and `collection_hub` options.
5. The dashboard exposes a multi-select shipping bin code filter populated from the loaded analytics data.
6. Existing analytics filters and dashboard sections continue to behave as before.
7. `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` is updated during implementation.

## Verification Plan

- Inspect the updated analytics component and helper types for correct response-shape handling.
- Run the frontend build or targeted diagnostics after implementation.
- Manually verify the analytics dashboard in the browser once the UI change is made.

## Open Questions

- Should the shipping bin code filter affect the analytics request directly, or should it only narrow the displayed breakdowns on the frontend?
- What request parameter shape should be used for multiple dynamic shipping bin code selections if the backend already supports it?
