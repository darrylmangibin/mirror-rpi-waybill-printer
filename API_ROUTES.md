# API Routes - Printing

## Quick Reference

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 1 | `/api/health/check` | GET | Health check - verify server connection |
| 2 | `/api/waybills/prints` | POST | Create & download waybill request |
| 3 | `/api/waybills/prints/by-invoice/print` | POST | Print by invoice number (tenant-specific) |
| 4 | `/api/waybills/prints/by-invoice/status` | GET | Get status by invoice number (tenant-specific) |

---

## Base URL

The base URL is dynamic and depends on the device's IP address:

- Local: `http://localhost:5000`
- Network: `http://192.168.1.100:5000` (replace with actual IP address)

---

## 1. Health Check

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

---

## 2. Create & Download Waybill

**POST** `/api/waybills/prints`

Creates a waybill request and automatically downloads the waybill file. By default, printing is disabled (`auto_print: false`). To print, use the invoice number routes after creation.

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

**Example 1: Lazada (no waybill_url)**

```json
{
  "tenant_id": "herbofilipinas",
  "marketplace": "lazada",
  "invoice_number": "1048623601548335"
}
```

**Example 2: Shopify (with waybill_url)**

```json
{
  "tenant_id": "havaianas",
  "marketplace": "shopify",
  "invoice_number": "6306203598961"
}
```

**Example 3: Janio (with waybill_url)**

```json
{
  "tenant_id": "janio",
  "marketplace": "no_marketplace",
  "invoice_number": "SH456789123",
  "waybill_url": "https://example.com/waybill.pdf"
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

After creating a waybill:

1. **Immediately queues for download** - The download task is queued as soon as the request is created
2. **Downloads the waybill file** - Background worker processes the download asynchronously
3. **Auto-print (optional)** - If `auto_print` is `true`, printing is automatically queued after successful download
   - If `auto_print` is `false` (default), use endpoint #3 to print by invoice number

To print a waybill after creation, use **endpoint #3** (Print by invoice number) with the same invoice number.

---

## 3. Print Waybill by Invoice Number

**POST** `/api/waybills/prints/by-invoice/print`

Prints the latest waybill by invoice number for a specific tenant. Automatically retrieves the most recent waybill (by `created_at`) with the given invoice number and prints it.

### Request Body

```json
{
  "invoice_number": "INV-12345",
  "tenant_id": "tenant123"
}
```

**Required:**

- `invoice_number` - The invoice number to search for
- `tenant_id` - Ensures tenant data isolation

### Response (Success)

```json
{
  "status": "success",
  "message": "Print job queued successfully",
  "data": {
    "id": 1,
    "invoice_number": "INV-12345",
    "print_status": "pending",
    "cups_job_id": 12345
  }
}
```

### Response (Error - Not Found)

```json
{
  "status": "error",
  "message": "No waybill found with invoice number: INV-12345 for tenant: tenant123"
}
```

### Response (Error - Missing Field)

```json
{
  "status": "error",
  "message": "invoice_number is required in request body"
}
```

Or:

```json
{
  "status": "error",
  "message": "tenant_id is required in request body"
}
```

### Example Usage

```bash
curl -X POST http://localhost:5000/api/waybills/prints/by-invoice/print \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV-12345",
    "tenant_id": "tenant123"
  }'
```

### How It Works

1. Extract `invoice_number` and `tenant_id` from request body
2. Query for the latest waybill matching both `invoice_number` AND `tenant_id` (ordered by `created_at DESC`)
3. If found, trigger the print action
4. Return the result with print job details
5. If not found, return 404 with descriptive error message

---

## 4. Get Waybill Status by Invoice Number

**GET** `/api/waybills/prints/by-invoice/status`

Retrieves comprehensive status information for the latest waybill by invoice number for a specific tenant. Automatically finds the most recent waybill (by `created_at`) matching both the invoice number and tenant ID.

### Query Parameters

- `invoice_number` (string, required) - The invoice number to search for
- `tenant_id` (string, required) - Ensures tenant data isolation

### Response (Success)

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

### Response (Error - Not Found)

```json
{
  "status": "error",
  "message": "No waybill found with invoice number: INV-12345 for tenant: tenant123"
}
```

### Response (Error - Missing Parameter)

```json
{
  "status": "error",
  "message": "invoice_number is required as query parameter"
}
```

Or:

```json
{
  "status": "error",
  "message": "tenant_id is required as query parameter"
}
```

### Example Usage

```bash
curl "http://localhost:5000/api/waybills/prints/by-invoice/status?invoice_number=INV-12345&tenant_id=tenant123"
```

### How It Works

1. Extract `invoice_number` and `tenant_id` from query parameters
2. Query for the latest waybill matching both `invoice_number` AND `tenant_id` (ordered by `created_at DESC`)
3. If found, retrieve comprehensive status information
4. Return the status data with all download and print details
5. If not found, return 404 with descriptive error message

---

## HTTP Status Codes Reference

| Code | Meaning | Used In |
|------|---------|---------|
| 200 | OK - Request succeeded | All successful operations |
| 400 | Bad Request - Invalid/missing parameters | Missing required fields |
| 404 | Not Found - Resource doesn't exist | Waybill not found |
| 500 | Server Error - Internal server error | Unexpected exceptions |

---

## Error Response Format

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Description of what went wrong"
}
```

---

## Success Response Format

All success responses follow this format:

```json
{
  "status": "success",
  "message": "Description of what was done",
  "data": {}
}
```
