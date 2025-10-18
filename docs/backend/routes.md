# API Routes Reference

## Base URL

```
http://127.0.0.1:5000        (Development)
http://raspberrypi.local:5000 (Raspberry Pi)
```

## Endpoints

### 1. Home / Status Page

**GET** `/`

Returns the home page with API information and QR code for the print endpoint.

**Response:** HTML page with status information

**Example:**

```bash
curl http://127.0.0.1:5000/
```

---

### 2. Health Check

**GET** `/health`

Check if the API is running and ready to accept requests.

**Response (200 OK):**

```json
{
  "status": "healthy",
  "message": "API is running and ready to accept requests"
}
```

**Example:**

```bash
curl http://127.0.0.1:5000/health
```

---

### 3. Get Hostname

**GET** `/api/hostname`

Returns the system hostname for QR code URL construction and mDNS access.

**Response (200 OK):**

```json
{
  "hostname": "raspberrypi",
  "fqdn": "raspberrypi.local"
}
```

**Example:**

```bash
curl http://127.0.0.1:5000/api/hostname
```

---

### 4. Generate QR Code

**GET** `/api/qrcode`

Generates and returns a QR code image that encodes the full API endpoint URL for the print endpoint.

**Response:** PNG image file

**Example:**

```bash
curl http://127.0.0.1:5000/api/qrcode -o qrcode.png
```

---

### 5. Create Print Job

**POST** `/api/waybills/prints`

Submit a waybill for printing. This is the main endpoint for submitting print jobs.

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "tenant_id": "string",
  "invoice_number": "string",
  "waybill_url": "string"
}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `tenant_id` | string | Company/tenant identifier |
| `invoice_number` | string | Invoice number for tracking |
| `waybill_url` | string | URL to the waybill PDF |

**Response (201 Created):**

```json
{
  "id": 1,
  "tenant_id": "company_name",
  "invoice_number": "INV-12345",
  "waybill_url": "https://example.com/waybill.pdf",
  "status": "pending",
  "created_at": "2025-10-18T07:51:25.490Z"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid JSON or missing required fields
  ```json
  {
    "error": "Missing required field: tenant_id"
  }
  ```

- **409 Conflict** - Duplicate job (same tenant, invoice, and URL)
  ```json
  {
    "error": "Print job already exists for this tenant and invoice"
  }
  ```

**Example Request:**

```bash
curl -X POST http://127.0.0.1:5000/api/waybills/prints \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "etaily",
    "invoice_number": "INV-1040812389838967",
    "waybill_url": "https://example.com/waybill.pdf"
  }'
```

**Example Response:**

```json
{
  "id": 1,
  "tenant_id": "etaily",
  "invoice_number": "INV-1040812389838967",
  "waybill_url": "https://example.com/waybill.pdf",
  "status": "pending",
  "created_at": "2025-10-18T07:51:25.490000Z"
}
```

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request format or missing fields |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

Currently no rate limiting is implemented. Future versions may include request throttling.

---

## Testing with Postman

1. Import the endpoint: `POST http://127.0.0.1:5000/api/waybills/prints`
2. Set Content-Type to `application/json`
3. Add the JSON body with tenant_id, invoice_number, and waybill_url
4. Send the request
