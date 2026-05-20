# Shipping Manifest Export Request Service and Hook Task

## Goal

Add a frontend service and React Query hook for requesting a shipping manifest export from the remote Nest API.

## Scope

- Frontend only.
- No backend/API changes.
- No export polling, download handling, or CSV generation logic yet.
- No UI wiring yet beyond exposing the hook for future use.

## MUST DO

- Create a manifest export service using `nestApi` from `frontend/src/lib/nest.api.ts`.
- Use `frontend/src/modules/ShippingManifest/services/add-item.service.ts` as the implementation pattern.
- Target the endpoint `POST /shipping-manifest-exports/:shippingManifestId`.
- Type the response as `{ exportId: string; status: string }`.
- Create a hook for the service using `useMutation`.
- Use `frontend/src/modules/ShippingManifest/hooks/useAddItem.ts` as the hook pattern.
- Keep the service and hook module-scoped under ShippingManifest.

## MUST NOT DO

- Do not add backend routes or controller work.
- Do not implement export file generation.
- Do not implement download behavior.
- Do not add UI components or modal wiring in this task.
- Do not broaden the scope to other manifest actions.

## Requirements

1. Add a new service function for requesting a manifest export.
2. The service should accept a `shippingManifestId` and POST to the export endpoint.
3. The service should return the parsed response data.
4. Add a hook that wraps the service with TanStack Query mutation support.
5. The hook should expose the mutation in the same style as other ShippingManifest hooks.
6. Keep naming consistent with the existing module conventions.

## Acceptance Criteria

- A ShippingManifest export request service exists and uses `nestApi`.
- The service posts to `shipping-manifest-exports/:shippingManifestId`.
- The service returns `{ exportId: string; status: string }`.
- A ShippingManifest hook exists and calls the service through `useMutation`.
- The new files follow the same structure as `add-item.service.ts` and `useAddItem.ts`.

## Notes

- This task is only for creating the service and hook scaffolding for export requests.
- Any future export UI or download behavior should be handled in a separate task.
