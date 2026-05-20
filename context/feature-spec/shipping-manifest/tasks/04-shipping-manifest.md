# Shipping Manifest Export Status and Download URL Task

## Goal

Add frontend services and React Query hooks for checking a shipping manifest export status and fetching its download URL from the remote Nest API.

## Scope

- Frontend only.
- No backend/API changes.
- No UI wiring yet beyond exposing the hooks for future use.
- No export polling loop or auto-download behavior yet.

## MUST DO

- Create a service for getting the shipping manifest export status using `nestApi` from `frontend/src/lib/nest.api.ts`.
- Target `GET /shipping-manifest-exports/:shippingManifestExportId`.
- Type the status response as `{ status: string }`.
- Create a hook for the export status service using the query pattern in `frontend/src/modules/ShippingManifest/hooks/useShippingManifests.ts`.
- Create a service for getting the shipping manifest export download URL using `nestApi`.
- Target `GET /shipping-manifest-exports/:exportId/download`.
- Type the download response as `{ url: string }`.
- Create a hook for the download URL service using the same hook style as `frontend/src/modules/ShippingManifest/hooks/useAddItem.ts`.
- Keep both services and hooks module-scoped under ShippingManifest.

## MUST NOT DO

- Do not add backend routes or controller work.
- Do not implement export generation.
- Do not implement polling, retries, or auto-download behavior.
- Do not add UI components or modal wiring in this task.
- Do not broaden the scope to other manifest actions.

## Requirements

1. Add a new service function for reading export status by export id.
2. The status service should return the parsed `{ status: string }` response.
3. Add a hook that wraps the status service with TanStack Query query support.
4. Add a new service function for reading the export download URL by export id.
5. The download service should return the parsed `{ url: string }` response.
6. Add a hook that wraps the download URL service with TanStack Query support.
7. Keep naming consistent with the existing ShippingManifest service and hook conventions.

## Acceptance Criteria

- A ShippingManifest export status service exists and uses `nestApi`.
- The status service calls `GET /shipping-manifest-exports/:shippingManifestExportId`.
- The status service returns `{ status: string }`.
- A ShippingManifest export status hook exists and follows the existing query hook pattern.
- A ShippingManifest export download URL service exists and uses `nestApi`.
- The download service calls `GET /shipping-manifest-exports/:exportId/download`.
- The download service returns `{ url: string }`.
- A ShippingManifest export download URL hook exists and follows the existing hook style used by `useAddItem.ts`.

## Notes

- The status hook should follow the manifest-by-id query pattern already used in `useShippingManifests.ts`.
- The download URL hook should mirror the mutation wrapper style used in `useAddItem.ts`.
- Any future polling, download triggering, or UI integration should be handled in a separate task.
