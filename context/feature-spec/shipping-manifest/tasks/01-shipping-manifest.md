# Shipping Manifest Item Selection Task

## Goal

Add UI support for selecting shipping bin items on the Shipping Manifest detail page so the user can later export selected rows as CSV.

## Scope

- UI only.
- No backend changes in this task.
- No CSV generation logic yet.
- No export button wiring yet.

## MUST DO

- Add row-level selection for shipping bin items in the manifest table.
- Store the selected item state in the Shipping Manifest detail UI.
- Add a checkbox to every shipping bin item row.
- Add a header checkbox in the selection column for select all and deselect all.
- Show an indeterminate header checkbox state when only some visible rows are selected.
- Support Shift-range selection across the currently visible item order.
- Keep the work focused on UI behavior only.

## MUST NOT DO

- Do not add backend/API changes.
- Do not implement CSV generation or download behavior yet.
- Do not add export button wiring yet.
- Do not change unrelated manifest workflows or queue-job behavior.

## Requirements

1. Allow the user to select shipping bin items from the manifest item table.
2. Persist the selected items in component state.
3. Show a checkbox in every shipping bin item row.
4. Show a header checkbox in the selection column that selects or deselects all currently visible rows.
5. Show the header checkbox as indeterminate when some, but not all, visible rows are selected.
6. Support shift-range selection:
   - selecting one row sets the anchor
   - holding Shift and selecting another row selects the full range between the anchor and the new row
   - example: select row 1, then Shift-select row 5, and rows 1 through 5 become selected

## UI Behavior

- Selection should be visible immediately in the table.
- Checkbox state should reflect the current selection state.
- Header checkbox state should reflect the visible rows: unchecked when none are selected, checked when all are selected, and indeterminate when partially selected.
- Range selection should work with the current visible order of items.
- Existing item filters and pagination should continue to work.

## Acceptance Criteria

- A user can select and deselect individual shipping bin items.
- A checkbox is shown for each row.
- A checkbox is shown in the table header selection column.
- Clicking the header checkbox selects all visible rows when not all visible rows are selected.
- Clicking the header checkbox deselects all visible rows when all visible rows are selected.
- The header checkbox is indeterminate when only some visible rows are selected.
- Shift-clicking another row selects the contiguous range between the first selection and the new row.
- Selected rows remain tracked in UI state while the user stays on the page.
- No backend or CSV export implementation is added yet.

## Notes

- This task should stay focused on the manifest detail UI.
- CSV export can be added as a follow-up task once selection state exists.
