# API Routes - Printing

## Base URL

The base URL is dynamic and depends on the device's IP address:

- Local: `http://localhost:5000`
- Network: `http://192.168.1.100:5000` (replace with actual IP address)

## Create & Print Waybill

**POST** `/api/waybills/prints`

Creates a waybill print request. Automatically downloads and prints the waybill.

### Request Body

```json
{
  "tenant_id": "1",
  "marketplace": "shopee",
  "invoice_number": "INV-12345",
  "waybill_url": "https://example.com/waybill.pdf" // optional
}
```

**Required:**

- `invoice_number` (string)
- `tenant_id` (string)

**Optional:**

- `waybill_url` (string)
- `marketplace` (string)

### Examples

**Example 1: Lazada (no waybill_url)**

```json
{
  "tenant_id": "herbofilipinas",
  "marketplace": "lazada", // tiktok, lazada, shopee, zalora
  "invoice_number": "1048623601548335"
}
```

**Example 2: Shopify (no waybill_url)**

```json
{
  "tenant_id": "havaianas",
  "marketplace": "shopify", // specific case for shopify, still no waybill_url
  "invoice_number": "6306203598961"
}
```

**Example 3: Janio (with waybill_url)**

```json
{
  "tenant_id": "janio", // this process is for janio only
  "marketplace": "no_marketplace",
  "invoice_number": "SH456789123",
  "waybill_url": "https://example.com/waybill.pdf" // optional
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
    "created_at": "2024-01-15 10:30:00"
  }
}
```

### Usage

Use Postman or similar API client to test the endpoint. Set the base URL to either:

- `http://localhost:5000` (local)
- `http://192.168.1.100:5000` (network - replace with actual IP)

### Note

After creating a waybill print, the system automatically:

1. Downloads the waybill file
2. Prints the waybill

No additional API calls needed.

