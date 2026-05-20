# Shipping Manifest CSV Export Modal Task

## Goal

Add a UI-only export CSV flow to the Shipping Manifest detail page.

## Scope

- UI only.
- No backend/API/database changes.
- No CSV generation logic yet.
- No download/export handling yet beyond calling the provided callback.

## MUST DO

- Add an `Export CSV` button to the Shipping Manifest detail UI.
- Open a modal when the button is clicked.
- Let the modal support three export targets:
  - all
  - selected item
  - tenants
- Include a confirmation button in the modal.
- Call the `onExport` prop when the user confirms.
- Pass the export choice through `onExport` as an object.
- Support tenant multi-selection when `tenants` is chosen.

## MUST NOT DO

- Do not add backend/API changes.
- Do not implement CSV generation.
- Do not implement the actual download request.
- Do not change unrelated manifest actions or queue-job behavior.

## Requirements

1. Add a button labeled `Export CSV` in the Shipping Manifest detail page.
2. Clicking the button opens a modal.
3. The modal contains three export options:
   - `all`
   - `selected item`
   - `tenants`
4. The modal contains a confirmation button.
5. Confirming the modal calls `onExport` with one of these shapes:
   - `all` → `{ filter_type: "all" }`
   - `selected item` → `{ filter_type: "selected_shipping_bin_items", shipping_bin_item_ids: setSelectedItemIds }`
   - `tenants` → `{ filter_type: "tenant", tenant_ids: selectedTenants }`
6. When `tenants` is selected, show a multi-select tenant picker.
7. Use `useTenantConfigurations` or the existing `tenantConfigs` data source for the tenant list.

## UI Behavior

- The modal should be the only new interaction surface for export selection.
- The tenant multi-select should only appear when `tenants` is selected.
- The selected option should determine the payload passed to `onExport`.
- The task should reuse the current selected shipping bin item ids state for the `selected item` export path.

## Acceptance Criteria

- A user can click `Export CSV` and see a modal.
- The modal offers `all`, `selected item`, and `tenants` choices.
- The modal includes a confirmation button.
- Confirming `all` calls `onExport({ filter_type: "all" })`.
- Confirming `selected item` calls `onExport({ filter_type: "selected_shipping_bin_items", shipping_bin_item_ids: setSelectedItemIds })`.
- Confirming `tenants` calls `onExport({ filter_type: "tenant", tenant_ids: selectedTenants })`.
- The tenant picker supports selecting multiple tenants.

## Notes

- Keep this task focused on UI state and prop wiring only.
- Defer the actual export implementation to a later task.
