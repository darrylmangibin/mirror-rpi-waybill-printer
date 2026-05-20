# RPI Waybill Printer

## Overview

RPI Waybill Printer is an on-premise waybill printing station for warehouse and fulfillment operators, intended to run on a Raspberry Pi or Linux device connected to a USB thermal label printer. It provides a local Flask API for receiving waybill print requests, resolving supplied or marketplace fallback waybill URLs, downloading/rendering printable files, storing print-job state in SQLite, and submitting labels to CUPS, while a React/Vite frontend gives operators a browser-based dashboard for creating, searching, previewing, printing, cancelling, and cleaning up waybill jobs. The frontend also connects to FusionTech's Nest API for shipping manifest workflows, letting the device support both local printer operations and warehouse scanning/manifest tasks.

## Goals

1. Let devices on the local network submit and monitor waybill print requests through a Raspberry Pi-hosted API without requiring the printer to be attached to each client device.
2. Download, normalize, store, preview, and print waybill files for supported marketplaces using a local thermal printer configured through CUPS.
3. Give operators a low-friction web UI for managing waybill jobs, scanning/working with shipping manifests, and accessing the print station from another device by IP address or QR-style network information.
4. Keep the deployment practical for Raspberry Pi installations by providing Docker, systemd, and installer scripts that configure Python, Node, Chromium, CUPS, USB printer access, environment files, and service startup.

## Core User Flow

1. An installer or operator deploys the application on a Raspberry Pi/Linux host, configures `.env` values, and connects/configures the thermal printer in CUPS.
2. The backend starts on port `5000`, initializes SQLite storage, registers health and waybill APIs, starts background workers, and begins scheduled monitoring/cleanup jobs.
3. The frontend starts on port `5173` and points to the backend using `VITE_API_URL`, usually the Raspberry Pi's local-network IP address.
4. A client system, mobile device, or operator creates a waybill print request with `tenant_id`, `invoice_number`, optional `marketplace`, optional `waybill_url`, and optional `auto_print`.
5. The backend stores a `WaybillPrint` record, cancels any previous CUPS job for the same tenant/invoice when applicable, and queues or performs the download.
6. The download service fetches the provided waybill URL or builds a marketplace fallback URL, saves the file under `app/storage/waybills`, and applies marketplace-specific PDF handling when needed.
7. The operator uses the dashboard to search, preview/download, print, cancel, edit, delete, or bulk-clean waybill records while the UI receives real-time or polling-based status updates.
8. When printing is requested, the backend validates the local file, converts unsupported PNG labels to PDF when needed, submits the job to CUPS, records the CUPS job ID, and scheduled monitoring updates the print status until completion, cancellation, or error.

## Features

### Local Waybill Print API

- Health check endpoint for validating that client devices can reach the Raspberry Pi print station.
- Waybill CRUD endpoints for creating, listing, updating, deleting, previewing, downloading, and printing waybill records.
- Tenant/invoice-specific print, status, and cancel endpoints so external systems can operate on the latest matching waybill while preserving tenant isolation.
- Search, pagination, status filtering, and date filtering for waybill lists.
- Server-Sent Events stream for waybill updates, with frontend cache invalidation and fallback polling behavior.

### Download and File Processing

- Local persistence of downloaded waybill files in `app/storage/waybills`.
- Direct HTTP downloads from `waybill_url` when provided.
- Marketplace fallback URL generation for Shopify via tenant-specific FusionTech hosted pages and for other marketplaces via the leadOS API pattern.
- Supported marketplace handling for Shopify, Shopee, TikTok, Lazada, and Zalora.
- PDF cropping/configuration for marketplace labels that need 4x6 thermal-label normalization.
- Playwright/Chromium support for rendering HTML waybill pages to printable PDF output.

### Printer Integration

- CUPS-backed printing through the configured default printer or `PRINTER_NAME`.
- XPrinter-style thermal label defaults of 100mm by 150mm with configurable scaling.
- PNG-to-PDF conversion for printer compatibility.
- CUPS job ID tracking, cancellation, offline-printer checks, stuck-job handling, and scheduled print-job monitoring.
- Printer health endpoints for status checks and manual stuck-job handling.

### Operator Frontend

- React/Vite dashboard for waybill job management.
- Create, edit, delete, bulk delete, cleanup, preview, download, print, and cancel dialogs/actions.
- Searchable waybill table with status-aware actions and active-download polling.
- Network information endpoint usage for exposing the local API URL to other devices.
- Shipping manifest pages for listing manifests, opening details, scanning shipping bin codes or tracking numbers, handling open-manifest conflicts, and closing/creating manifests through FusionTech's Nest API.
- Tenant configuration lookups through the remote Nest API using the `x-tenant-id` header.

### Deployment and Operations

- Docker scripts and compose files for development and production containers.
- USB device passthrough and privileged backend container support for printer access.
- Installer scripts for online/offline setup, Python virtualenv, Node/npm, Chromium, CUPS, environment files, and project permissions.
- Systemd service files and shell scripts for auto-start and operational diagnostics.
- Automatic cleanup of old waybill records/files using configurable cleanup interval and age threshold.

## Scope

### In Scope

- Running a local Flask backend and React frontend on Raspberry Pi/Linux for warehouse printing operations.
- Receiving print requests from local-network clients and external systems over HTTP.
- Persisting waybill job metadata in a local SQLite database.
- Resolving, downloading/rendering, storing, previewing, and printing waybill files.
- Managing CUPS printer jobs, printer health, cancellations, and stuck/offline-job behavior.
- Providing an operator UI for waybill print management and shipping manifest workflows.
- Integrating the frontend with FusionTech's remote Nest API for manifests and tenant configuration.
- Supporting Docker, systemd, and scripted setup paths for practical device deployment.

### Out of Scope

- Hosting a centralized multi-device print server beyond the local Raspberry Pi/Linux print station.
- Replacing the remote FusionTech Nest API or owning shipping manifest persistence locally.
- Full user authentication, authorization, or role management in the local Flask API/frontend.
- Managing printer hardware outside what CUPS, USB detection, and the provided scripts can configure.
- Long-term archival/reporting of historical waybill data beyond the local SQLite database and cleanup window.
- Supporting arbitrary marketplaces or label layouts that are not encoded in the current marketplace/download configuration.

## Success Criteria

1. A deployed Raspberry Pi/Linux host can expose the frontend and backend on the local network and pass `/api/health/check` from another device.
2. An operator or client can create a waybill request with tenant and invoice data, and the backend persists it as a `WaybillPrint` record.
3. A waybill can be downloaded from a supplied URL or generated through the configured marketplace fallback path and stored locally for preview.
4. A downloaded waybill can be submitted to the configured CUPS thermal printer, tracked by CUPS job ID, and moved to completed, cancelled, or error status based on the print outcome.
5. The frontend dashboard can list/search waybills, show current statuses, preview files, and trigger print/cancel/delete/cleanup actions against the local API.
6. Shipping manifest pages can reach the configured FusionTech Nest API with tenant headers and support the scanning/detail workflows present in the UI.
7. Docker or installer-based deployment configures the necessary runtime pieces: Python dependencies, frontend dependencies, CUPS/printer access, Chromium/Playwright support, environment files, persistent storage, and service startup.
