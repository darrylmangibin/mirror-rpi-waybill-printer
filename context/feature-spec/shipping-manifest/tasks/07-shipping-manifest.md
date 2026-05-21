# Shipping Manifest Add-Item Audio Feedback Task

## Goal

Add scanner-friendly audio feedback to the Shipping Manifest detail page so operators hear a success sound after an item is added to a manifest and an error sound after an add-item failure.

## Scope

- Frontend only.
- Shipping Manifest detail item-add flow only.
- No backend/API changes.
- No changes to add-item request or response contracts.
- No unrelated scanner, manifest, export, queue-job, or manual registration behavior changes.

## MUST DO

- Inspect `frontend/src/modules/ShippingManifest/components/ShippingManifestDetails/index.tsx`.
- Inspect the `useAddItem` usage in `ShippingManifestDetails`.
- Use the existing sound assets:
  - success: `frontend/public/scan-success.wav`
  - error: `frontend/public/scan-error.wav`
- After a successful add-item mutation, play the success sound.
- After an add-item error, play the error sound.
- Keep existing toast, warning, unresolved-item, manual-add, cache invalidation, and scanner behavior intact.
- Keep the audio behavior scoped to the add-item mutation outcome, not to page load, manual dialog open, item table refresh, or unrelated actions.
- Handle browser audio playback safely so a failed playback attempt does not break the manifest workflow.

## MUST NOT DO

- Do not write backend code.
- Do not change remote Nest API endpoints.
- Do not change the add-item request payload or response typing unless the current code requires a narrow type-safe adjustment for the audio hook-up.
- Do not replace existing toast feedback with sound-only feedback.
- Do not play sounds for non-add-item manifest actions such as close manifest, sync item, export, queue job retry, or manifest creation.
- Do not add new dependencies for basic audio playback.
- Do not move or rename the existing `.wav` files.

## Requirements

1. Successful tracking-number add-item flow should play `/scan-success.wav` after the mutation reports success.
2. Failed tracking-number add-item flow should play `/scan-error.wav` after the mutation reports an error.
3. Existing add-item success handling should continue to show the current operator feedback and update related manifest/item data.
4. Existing add-item error handling should continue to show the current operator feedback, including unresolved tracking-number/manual registration behavior where applicable.
5. Audio playback failures, such as browser autoplay restrictions or missing audio support, should be caught or otherwise prevented from throwing into the scanner flow.
6. The task should remain limited to the Shipping Manifest frontend module unless inspection proves a small shared helper already exists for this pattern.

## UI Behavior

- Operators should receive audible confirmation after scanning a tracking number into an open manifest.
- Success audio should play only after the add-item request succeeds.
- Error audio should play only after the add-item request fails.
- Sound feedback should supplement, not replace, visible feedback.
- Scanner focus and processing state should continue to behave as they currently do after success and error outcomes.

## Files or Areas to Inspect

1. `frontend/src/modules/ShippingManifest/components/ShippingManifestDetails/index.tsx`
2. `frontend/src/modules/ShippingManifest/hooks/useAddItem.ts`
3. `frontend/public/scan-success.wav`
4. `frontend/public/scan-error.wav`

## Methods or Entry Points to Inspect

1. `ShippingManifestDetails`
2. `useAddItem`
3. Existing add-item success and error callbacks in the manifest detail page

## Acceptance Criteria

- Adding an item to an open manifest successfully plays `scan-success.wav`.
- Add-item errors play `scan-error.wav`.
- Existing visual feedback, scanner state, cache invalidation, unresolved-item handling, and manual registration behavior still work.
- Audio playback errors do not crash the page or block subsequent scans.
- No backend, API contract, export, queue-job, close-manifest, or unrelated scanner behavior is changed.
- `context/feature-spec/shipping-manifest/shipping-manifest-progress-tracker.md` is updated when implementation begins, after meaningful implementation changes, and at task completion.

## Verification Plan

- Run the narrowest useful frontend check for the changed files.
- Run `npm run build` from `frontend/` if the implementation touches shared types, hooks, or module boundaries.
- Manually verify the Shipping Manifest detail page by scanning or submitting a tracking number that succeeds and one that fails, confirming the expected sound plays for each outcome.
- Confirm browser console has no uncaught audio playback errors after success or error scans.

## Open Questions

- None at task creation. If implementation finds browser audio restrictions in the deployed scanner environment, document the limitation in the progress tracker before broadening scope.
