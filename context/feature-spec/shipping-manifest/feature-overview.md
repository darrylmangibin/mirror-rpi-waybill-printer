# Shipping Manifest

## Overview

Shipping Manifest is a React/Vite operator workflow for warehouse teams that manage carrier handoff and manifest scanning from the Raspberry Pi waybill-printer frontend. It is implemented as a frontend-only integration with FusionTech's remote Nest API, using `x-tenant-id` headers for tenant-scoped requests, while the local Flask/CUPS backend remains responsible only for waybill printing operations. The feature lets operators list manifests, scan shipping bin codes to open or create manifests, resolve open-manifest conflicts, scan tracking numbers into open manifests, manually register unresolved scanned items, close manifests, inspect linked shipping bin items, sync failed items, and review or retry manifest invoice-status queue jobs.

## Goals

1. Give warehouse operators a scanner-first UI for creating and opening shipping manifests from collection/shipping bin codes.
2. Let operators add package items to an open manifest by scanning tracking numbers, with clear success, warning, and error feedback.
3. Preserve tenant-aware remote API behavior by sending requests through the FusionTech Nest API client and using tenant-specific clients when manual item creation requires an explicit tenant.
4. Provide enough manifest detail, item status, queue-job status, and retry controls for operators to complete the manifest workflow without leaving the print-station frontend.

## Core User Flow

1. The operator opens the frontend and navigates to **Shipping Manifest** from the top navigation, which routes to `/shipping-manifests`.
2. The manifest list loads paginated records from the remote Nest API and defaults to the `open` status view, with the selected status persisted in the `selected-status` URL query parameter.
3. The operator scans a shipping bin code while the scanner input is online, and the frontend requests manifest creation through `POST /shipping-manifests/shipping-bin/:code`.
4. If the remote API reports that an open manifest already exists for that collection, the UI shows a conflict modal where the operator can open the existing manifest or close it and create a new one through `POST /shipping-manifests/shipping-bin/:code/close-and-create-new`.
5. After a manifest is selected or created, the operator is routed to `/shipping-manifests/:id`, where the detail page loads the manifest record from `GET /shipping-manifests/:id`.
6. While the manifest status is `open`, scanner input remains enabled and scanned tracking numbers are submitted to `POST /shipping-manifests/:id/add-item`.
7. If a scanned tracking number cannot be resolved automatically, the manual add dialog lets the operator choose a tenant and shipping bin, then creates the item through `POST /shipping-manifests/:id/create-shipping-bin-item` using a tenant-specific Nest API client.
8. The operator reviews linked shipping bin items, filters items by tenant or sync status, manually syncs failed items when needed, and closes the manifest through `POST /shipping-manifests/:id/close` once no more items should be added.
9. The operator can switch to the Queue Jobs tab to inspect invoice-status background jobs, view success and failure invoice groups by tenant, copy invoice numbers, and retry failed or partially failed jobs through `POST /shipping-manifests/:id/invoice-status/bulk-update/retry/:jobId`.

## Features

### Manifest List and Navigation

- Top navigation entry for **Shipping Manifest** and route registration for `/shipping-manifests` and `/shipping-manifests/:id`.
- Paginated manifest table showing manifest code, carrier, loaded order count, status, generation type, generated user, loading start time, and loaded time.
- Status filtering for `open`, `closed`, `for_loading`, `loaded`, and `completed` manifests.
- URL-backed selected status state through the `selected-status` query parameter.
- Manual refresh and per-page controls for operator-driven list updates.
- Row navigation from a manifest list entry into the manifest detail page.

### Scanner Support

- Shared scanner layout with a hidden focused input for barcode scanner keyboard events.
- Scanner status indicator showing online, offline, or processing states.
- Automatic scanner focus recovery when the page regains focus or the operator clicks outside form controls.
- List-page scanning for shipping bin codes.
- Detail-page scanning for tracking numbers, disabled when the manifest is not `open`.

### Manifest Creation and Conflict Handling

- Shipping-bin-code manifest creation through the remote Nest API.
- Loading overlay while creation or close-and-create operations are pending.
- Open-manifest conflict modal when the API returns an existing open manifest.
- Operator choice to use the existing manifest or close it and create a new manifest.
- React Query cache invalidation for manifest lists after successful creation or close-and-create operations.

### Manifest Details and Item Management

- Manifest detail header with manifest code, carrier, status, generation type, receiver, vehicle plate, loaded order count, and generated-by information.
- Linked shipping bin item table scoped by `shipping_manifest_id`.
- Item filters for tenant and sync status, including all, included-in-manifest, valid, cancelled, and sync-failed views.
- Shipping bin item columns for invoice, tracking number, courier, marketplace, tenant, sync status, workflow step, validation status, and updated timestamps.
- Manual sync action for shipping bin items through `POST /shipping-bin-items/:id/sync`.
- Close-manifest confirmation modal that warns the operator that closed manifests cannot accept more items.

### Manual Item Registration

- Automatic unresolved-item handling when add-item returns a validation error for a scanned tracking number.
- Manual add dialog that preserves the scanned tracking number and requires tenant and shipping bin selection.
- Tenant options loaded from tenant configuration records.
- Shipping bin options filtered to collection-hub bins for the manifest carrier code.
- Tenant-specific API client creation for manual item registration so the selected tenant is sent as `x-tenant-id`.

### Queue Job Monitoring

- Queue Jobs tab beside the Shipping Bin Items tab on the manifest detail page.
- Queue job status display for `active`, `waiting`, `completed`, `failed`, `delayed`, and `paused` jobs.
- Tenant-level success and failure result summaries for manifest invoice-status jobs.
- Invoice number preview, searchable invoice modal, and copy-to-clipboard support.
- Retry action for failed jobs or jobs with failed tenant results.

## Scope

### In Scope

- React/Vite frontend pages, components, hooks, services, types, constants, and utilities for shipping manifest workflows.
- FusionTech Nest API calls for manifests, shipping bin items, shipping bins, tenant configurations, item sync, and invoice-status queue jobs.
- Scanner-driven manifest creation and item addition through browser keyboard-style barcode input.
- Tenant-aware request handling through the shared Nest API client and explicit tenant-specific clients for manual item creation.
- Operator-facing loading, empty, error, warning, success, and conflict states that are present in the current UI.

### Out of Scope

- Local persistence of shipping manifests, shipping bin items, tenant configurations, or queue jobs in the Flask/SQLite backend.
- Replacing or reimplementing the remote FusionTech Nest API that owns manifest and shipping-bin data.
- Local CUPS printing, waybill file download/rendering, and print-job monitoring behavior.
- Authentication, authorization, or role management beyond the current tenant header behavior.
- Creating new manifest statuses, queue states, carrier workflows, or marketplace behavior that is not represented by the current API types and UI flows.

## Success Criteria

1. The frontend exposes `/shipping-manifests` and `/shipping-manifests/:id` and the top navigation can reach the list view.
2. The manifest list can load paginated remote API data, filter by supported manifest statuses, refresh records, and open a manifest detail page.
3. Scanning a shipping bin code can create a manifest, navigate to its detail page, and handle an existing-open-manifest conflict by using the existing manifest or closing it and creating a new one.
4. The manifest detail page can load manifest data, show operator-relevant metadata, and enable tracking-number scanning only while the manifest is open.
5. Scanned tracking numbers can be added to the manifest, with warnings for sync-failed or cancelled results and a manual registration path for unresolved tracking numbers.
6. Linked shipping bin items can be listed, filtered, paginated, and manually synced from the manifest detail page.
7. Open manifests can be closed through an explicit confirmation flow, after which the UI no longer enables scanner-based item addition for that manifest.
8. Queue jobs for manifest invoice-status updates can be viewed by status and tenant result, invoice numbers can be searched or copied, and failed or partially failed jobs can be retried.
9. All shipping manifest remote requests use the configured Nest API client and preserve tenant scoping through `x-tenant-id` behavior.
