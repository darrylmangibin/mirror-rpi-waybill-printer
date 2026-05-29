# Task: Refactor Shipping Bin Items Analytics Table

## Source

- **Project Overview**: `context/project-overview.md`
- **Feature Overview**: `context/feature-spec/shipping-bin-items-analytics/feature-overview.md`
- **Architecture**: `context/architecture.md`
- **Code Standards**: `context/code-standards.md`
- **Progress Tracker**: `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md`

## Objective

Refactor the Shipping Bin Items Analytics table so it shows the most useful order and shipment identifiers without changing the surrounding analytics behavior.

## Background

The current analytics table in `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx` includes columns that are no longer needed for this view. The table should be simplified so operators can focus on order timing, invoice identity, and tracking identity when reviewing shipping bin items.

## Scope

### In Scope

- Remove the `created at`, `validation`, and `sync status` columns from the Shipping Bin Items Analytics table.
- Add an `order date` column sourced from `shipping_bin_item.meta_data.invoice_order.created_at`.
- Split the current combined invoice/tracking display into separate `invoice number` and `tracking number` columns.
- Keep the change limited to the analytics table presentation in `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx` and any nearby table helpers it already depends on.

### Out of Scope

- Changing the analytics filters, summaries, or charts.
- Modifying the remote Nest API payload or backend data model.
- Adding new table actions, bulk operations, or editing flows.
- Refactoring unrelated Shipping Bin Item modules.

## What to Implement

### 1. Table Column Layout

- Remove the `created at`, `validation`, and `sync status` columns from the analytics table.
- Add an `order date` column that reads from `shipping_bin_item.meta_data.invoice_order.created_at`.
- Preserve the existing table loading, empty, error, pagination, and refresh behavior.

### 2. Invoice and Tracking Display

- Replace the combined invoice/tracking presentation with separate `invoice number` and `tracking number` columns.
- Keep the values readable and aligned with the existing table styling conventions.

### 3. Documentation and Progress

- Update `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` after implementation.
- Record any open questions or follow-up findings in the tracker if the live payload shape needs confirmation.

## Files or Areas to Inspect

1. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/index.tsx`
2. `frontend/src/modules/ShippingBinItem/components/ShippingBinItemAnalytics/components/MatchingItemsTable.tsx`
3. `frontend/src/modules/ShippingBinItem/types/shipping-bin-item.type.ts`

## Data and Contracts

- **Inputs**: Shipping bin item rows returned by the remote Nest API.
- **Outputs**: Updated analytics table columns and row labels.
- **Validation Rules**: Preserve existing row rendering and pagination behavior.
- **Compatibility Requirements**: Do not alter the broader analytics dashboard contract or unrelated remote API usage.

## UX Requirements

- Keep the table readable at the current dashboard width.
- Make the order date, invoice number, and tracking number easy to scan.
- Preserve the existing table states and actions outside the column layout change.

## Technical Constraints

- Follow the local module patterns already used in Shipping Bin Item Analytics.
- Keep the change as small as possible.
- Do not add dependencies.
- Do not change unrelated analytics data fetching or filtering logic.

## Methods or Entry Points to Inspect

1. `ShippingBinItemAnalytics`
2. `MatchingItemsTable`
3. Row formatting helpers used by the analytics table

## Acceptance Criteria

1. The analytics table no longer shows `created at`, `validation`, or `sync status` columns.
2. The table shows an `order date` column sourced from `shipping_bin_item.meta_data.invoice_order.created_at`.
3. Invoice number and tracking number are shown in separate columns.
4. The table continues to support the existing loading, empty, error, pagination, and refresh states.
5. `context/feature-spec/shipping-bin-items-analytics/shipping-bin-items-analytics-progress-tracker.md` is updated after the implementation work.

## Verification Plan

- Inspect the rendered table structure after the refactor.
- Run the frontend build or targeted diagnostics after the implementation.
- Manually verify the analytics table in the browser once the code change is made.

## Open Questions

- Confirm whether `shipping_bin_item.meta_data.invoice_order.created_at` is always present or whether the UI should tolerate a missing value.
