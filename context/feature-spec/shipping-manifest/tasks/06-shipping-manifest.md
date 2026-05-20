# Shipping Manifest Export Request, Status Polling, and Download Modal Task

## Goal

Wire the Shipping Manifest CSV export button to the export request flow, show export progress in a modal, poll export status until it reaches a terminal state, and enable downloading the generated file once the remote export is ready.

## Scope

- Frontend only.
- No backend/API changes.
- No changes to CSV generation logic itself.
- No unrelated manifest workflow changes.

## MUST DO

- Integrate `useRequestExport` into `frontend/src/modules/ShippingManifest/components/ShippingManifestDetails/index.tsx` inside `handleExport`.
- When export request creation fails, show a toast with the returned error message.
- On successful export request creation, capture the returned export id and open a modal that shows export progress.
- Use `useShippingManifestExportStatus` to poll the export status every 2 seconds while the export is pending.
- Stop polling by returning `false` from the polling interval logic once the status is no longer pending.
- When the export status becomes completed, call `useExportDownloadUrl` to fetch the download URL.
- Add a download button in the modal.
- Keep the download button disabled until the export status is completed and the download URL has been loaded successfully.
- Make the download button redirect the browser to the download URL when clicked.
- Display the export status in the modal as the request progresses.
- Keep polling lightweight and scoped to the active modal/export request so it does not keep running after the modal closes or after the export reaches a terminal state.
- Show a warning in the modal that closing it will discard the current download URL and the user will need to request the export again, or use the export-request listing page / Discord guidance if that workflow is available in the product.

## MUST NOT DO

- Do not add backend routes or controller work.
- Do not change the export service contract.
- Do not add automatic download on request creation.
- Do not keep polling after the export reaches a terminal state.
- Do not make the download button available before the download URL exists.
- Do not broaden the change to unrelated manifest actions.

## Requirements

1. The CSV export button should start the export request flow through `handleExport`.
2. Request creation errors should surface a toast error.
3. A modal should open only after the export request succeeds.
4. The modal should reflect the current export status at all times.
5. Export status polling should run every 2 seconds while the status is pending.
6. Polling should stop automatically when the status is no longer pending.
7. Once the status is completed, the download URL hook should fetch the file URL.
8. The download button should stay disabled until the status is completed and the URL is available.
9. Clicking the download button should navigate to the download URL.
10. The modal should warn the user that closing it will lose the current download URL and require a new request.

## UI Behavior

- Show a visible status progression in the modal, including pending and terminal states.
- Keep the modal content responsive to status updates without forcing unnecessary refetches when the export is already done or failed.
- Treat failed exports as terminal and stop polling immediately.
- Preserve the user’s ability to close the modal at any time.

## Acceptance Criteria

- `handleExport` in `ShippingManifestDetails` calls `useRequestExport`.
- A failed export request shows an error toast.
- A success export request opens a progress modal.
- The modal polls status every 2 seconds only while pending.
- The modal stops polling when the status becomes failed or completed.
- Completed exports trigger a download URL fetch.
- The download button is disabled until the status is completed and the download URL is present.
- Clicking download opens the generated export URL.
- The modal warns users about losing the current download URL if they close it.
