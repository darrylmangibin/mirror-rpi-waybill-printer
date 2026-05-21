# Shipping Manifest Export Request Payload Task

## Goal

Extend the Shipping Manifest export request so the frontend can send export filters with a default `filter_type` of `all`.

## Scope

- Frontend only.
- No backend/API changes.
- No UI wiring changes.
- No export polling, download handling, or CSV generation logic.

## MUST DO

- Add an export request payload type in `frontend/src/modules/ShippingManifest/services/request-export.service.ts`.
- Include the payload fields:
  - `filter_type?: 'all' | 'selected_shipping_bin_items' | 'tenant'`
  - `shipping_bin_item_ids?: string[]`
  - `tenant_ids?: string[]`
- Default `filter_type` to `all` when the caller does not provide it.
- Update `requestExport` to send the payload object in the POST body.
- Update `frontend/src/modules/ShippingManifest/hooks/useRequestExport.ts` so the mutation can pass the payload through.

## MUST NOT DO

- Do not add backend routes or controller work.
- Do not change export response typing.
- Do not add UI components or modal wiring.
- Do not implement export polling, download behavior, or CSV generation.

## Requirements

1. The export request service should accept a payload object.
2. The payload should support filtering by all items, selected shipping bin items, or tenant ids.
3. The service should always send `filter_type: 'all'` when the caller does not specify a filter.
4. The hook should forward the payload to the service.
5. Keep the change scoped to the ShippingManifest frontend module.

## Acceptance Criteria

- `requestExport` accepts a payload object.
- `requestExport` posts the payload body to `POST /shipping-manifest-exports/:shippingManifestId`.
- `filter_type` defaults to `all` when omitted.
- `useRequestExport` passes the payload through to the service.
- No unrelated Shipping Manifest flows are changed.
