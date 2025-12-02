# API Routes - Printing

## Base URL

The base URL is dynamic and depends on the device's IP address:

- Local: `http://localhost:5000`
- Network: `http://192.168.1.100:5000` (replace with actual IP address)

## Health Check

**GET** `/api/health/check`

Check if the server is reachable and the base URL is valid. Used by mobile devices to validate the connection before sending print requests.

### Response

```json
{
  "status": "success",
  "message": "✓ Connected! You can now send API requests."
}
```

### Example Usage

```bash
curl http://localhost:5000/api/health/check
```

## Create & Print Waybill

**POST** `/api/waybills/prints`

Creates a waybill print request. Automatically downloads the waybill after creation, and optionally prints it based on the `auto_print` flag.

### Request Body

```json
{
  "tenant_id": "1",
  "marketplace": "shopee",
  "invoice_number": "INV-12345",
  "waybill_url": "https://example.com/waybill.pdf",
  "auto_print": false
}
```

**Required:**

- `invoice_number` (string)
- `tenant_id` (string)

**Optional:**

- `waybill_url` (string)
- `marketplace` (string)
- `auto_print` (boolean) - Whether to automatically print after download completes (defaults to `false`)

### Examples

**Example 1: Lazada (no waybill_url, manual print required)**

```json
{
  "tenant_id": "herbofilipinas",
  "marketplace": "lazada",
  "invoice_number": "1048623601548335"
}
```

**Example 2: Shopify (no waybill_url, auto-print enabled)**

```json
{
  "tenant_id": "havaianas",
  "marketplace": "shopify",
  "invoice_number": "6306203598961",
  "auto_print": true
}
```

**Example 3: Janio (with waybill_url, auto-print enabled)**

```json
{
  "tenant_id": "janio",
  "marketplace": "no_marketplace",
  "invoice_number": "SH456789123",
  "waybill_url": "https://example.com/waybill.pdf",
  "auto_print": true
}
```

### Response

```json
{
  "status": "success",
  "message": "Waybill print request stored",
  "data": {
    "id": 1,
    "invoice_number": "INV-12345",
    "tenant_id": 1,
    "status": "pending",
    "print_status": "idle",
    "auto_print": false,
    "created_at": "2024-01-15 10:30:00"
  }
}
```

### Usage

Use Postman or similar API client to test the endpoint. Set the base URL to either:

- `http://localhost:5000` (local)
- `http://192.168.1.100:5000` (network - replace with actual IP)

### Automatic Workflow

After creating a waybill print, the system automatically:

1. **Immediately queues for download** - The download task is queued as soon as the print request is created
2. **Downloads the waybill file** - Background worker processes the download asynchronously
3. **Conditionally queues for printing** - If `auto_print` is `true`, printing is automatically queued after successful download
   - If `auto_print` is `false`, download completes but manual printing is required via `/api/waybills/prints/<id>/print` endpoint

No additional API calls needed for automatic download. The print step only occurs automatically if `auto_print` is enabled.

## Get Waybill Status

**GET** `/api/waybills/prints/<id>/status`

Retrieves comprehensive status information for a waybill print job. Useful for mobile/remote monitoring to check download progress, print status, error messages, and detect stuck jobs.

### Path Parameters

- `id` (integer) - The waybill print ID

### Response

```json
{
  "status": "success",
  "message": "Status retrieved successfully",
  "data": {
    "id": 1,
    "invoice_number": "INV-12345",
    "marketplace": "zalora",
    "download_status": "downloaded",
    "download_error": null,
    "downloaded_at": "2025-11-28 14:25:30",
    "local_file_path": "/path/to/file.pdf",
    "print_status": "printing",
    "print_error": null,
    "print_completed_at": null,
    "cups_job_id": 12345,
    "printer_name": "Brother_QL_810W",
    "created_at": "2025-11-28 14:20:00",
    "updated_at": "2025-11-28 14:25:35",
    "is_download_stuck": false,
    "is_print_stuck": false,
    "download_elapsed_seconds": 330,
    "print_elapsed_seconds": 35
  }
}
```

### Response Fields

**Basic Info:**

- `id` - WaybillPrint ID
- `invoice_number` - Invoice identifier
- `marketplace` - Marketplace name

**Download Status:**

- `download_status` - Current download status (`pending`, `downloading`, `downloaded`, `error`)
- `download_error` - Error message if download failed (null if successful)
- `downloaded_at` - Timestamp when download completed (null if not completed)
- `local_file_path` - Path to downloaded file (null if not downloaded)

**Print Status:**

- `print_status` - Current print status (`idle`, `pending`, `printing`, `completed`, `error`)
- `print_error` - Error message if print failed (null if successful)
- `print_completed_at` - Timestamp when print completed (null if not completed)
- `cups_job_id` - CUPS job ID for tracking (null if not printing)
- `printer_name` - Printer used for this job (null if not printing)

**Timestamps:**

- `created_at` - When job was created
- `updated_at` - Last update time

**Stuck Detection:**

- `is_download_stuck` - Boolean flag if download is stuck (> 60 seconds in "downloading" state)
- `is_print_stuck` - Boolean flag if print is stuck (> 10 minutes in "printing" state)
- `download_elapsed_seconds` - Seconds elapsed since download started (null if not started)
- `print_elapsed_seconds` - Seconds elapsed since print started (null if not started)

### Example Usage

```bash
curl http://localhost:5000/api/waybills/prints/1/status
```

### Error Response

```json
{
  "status": "error",
  "message": "Waybill not found"
}
```
