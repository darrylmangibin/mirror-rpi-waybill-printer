# Shipping Bin Items Analytics

## Overview

Shipping Bin Items Analytics is a React/Vite operator dashboard for warehouse and operations teams that need a centralized view of daily shipping workload, validation problems, and workflow bottlenecks. It is implemented as a frontend-only integration with FusionTech's remote Nest API, using `x-tenant-id` headers for tenant-scoped requests, while the local Flask/CUPS backend remains responsible only for waybill printing operations. The feature lets supervisors inspect aggregate counts for parcels, orders, and shipping bin items, then filter the results by date, tenant, marketplace, workflow stage, validation state, and skip-sweeping mode to identify issues faster.

## Goals

1. Give warehouse supervisors a quick operational dashboard for understanding daily workload and exception volume without paging through raw item lists.
2. Show aggregate counts for parcels, orders, and shipping bin items in a way that supports day-to-day monitoring across the shipping workflow.
3. Preserve tenant-aware remote API behavior by sending requests through the FusionTech Nest API client and using tenant-specific filters where needed.
4. Provide enough filtering and breakdown visibility for operators to spot validation failures, workflow bottlenecks, and tenant-specific volume shifts from the print-station frontend.

## Core User Flow

1. The operator opens the frontend and navigates to **Shipping Bin Items Analytics** from the operator UI, which routes to the analytics dashboard page.
2. The dashboard loads aggregate shipping-bin-item analytics from the remote Nest API using the selected date range, defaulting to the current day when no dates are provided.
3. The operator reviews the top-level totals for parcels, orders, and shipping bin items to understand the current workload.
4. The operator filters the dashboard by tenant, marketplace, validation status, workflow step, and skip-sweeping mode to isolate a subset of operational data.
5. The dashboard updates the aggregate breakdowns so the operator can see which tenants, couriers, workflow stages, or validation states are contributing to the current volume.
6. If a validation issue or workflow bottleneck appears, the operator narrows the filters further to inspect the affected slice of the operation and compare it against the total daily workload.

## Features

### Analytics Dashboard and Navigation

- Operator-facing dashboard for shipping-bin-item analytics.
- Route registration for the analytics page from the frontend navigation.
- High-level summary cards for parcel, order, and shipping bin item totals.
- Breakdown panels for tenant distribution, courier distribution, validation state, and workflow state.
- Loading, empty, and error states suitable for operator monitoring workflows.

### Date and Operational Filtering

- Date-range filtering for the current reporting window.
- Tenant filtering for tenant-specific operational views.
- Marketplace filtering for integration-level comparisons.
- Validation-status filtering for exception triage.
- Workflow-step filtering for pipeline bottleneck analysis.
- Skip-sweeping filtering for distinguishing normal processing from skip-sweeping items.

### Tenant-Aware Remote API Access

- Remote Nest API requests for analytics data through the shared tenant-aware client.
- `x-tenant-id` preservation for tenant-scoped dashboard requests.
- Explicit tenant filtering when the operator needs to inspect a single tenant's activity.

### Monitoring and Breakdown Visibility

- Total workload visibility for the selected reporting window.
- Tenant distribution to reveal which tenants are driving volume.
- Courier distribution to show which carriers dominate the current workload.
- Validation breakdown to surface pending, verified, missing, rejected, or otherwise problematic items.
- Workflow breakdown to expose where items are entering, waiting, or leaving the shipping process.
- Normal versus skip-sweeping breakdown for operational process monitoring.

## Scope

### In Scope

- React/Vite frontend pages, components, hooks, services, types, constants, and utilities for shipping bin item analytics.
- FusionTech Nest API calls for aggregated shipping-bin-item analytics and related tenant-aware filtering.
- UI states and filtering interactions for daily monitoring, exception review, and workflow bottleneck detection.
- Operator-facing breakdowns that summarize workload without requiring the user to inspect raw item rows.

### Out of Scope

- Local persistence of shipping bin item analytics in the Flask/SQLite backend.
- Replacing or reimplementing the remote FusionTech Nest API that owns the analytics data.
- Local CUPS printing, waybill file download/rendering, and print-job monitoring behavior.
- Authentication, authorization, or role management beyond the current tenant header behavior.
- Raw-item editing, sync, export, or manifest-management workflows that belong to other shipping features.
- Creating analytics dimensions, filters, or states that are not represented by the current API and UI contract.

## Success Criteria

1. The frontend exposes a shipping-bin-items analytics dashboard that operators can reach from the main UI.
2. The dashboard can load aggregate counts for parcels, orders, and shipping bin items for the selected day or date range.
3. The dashboard can filter analytics by tenant, marketplace, validation status, workflow step, and skip-sweeping mode.
4. The dashboard can show tenant, courier, validation, and workflow breakdowns that help operators identify issues quickly.
5. All analytics requests use the configured Nest API client and preserve tenant scoping through `x-tenant-id` behavior.
