# API Response Format Guide

All API responses follow a standardized format using the `ResponseTrait` mixin.

## Usage in Actions/Controllers

```python
from utils import ResponseTrait

class MyAction(ResponseTrait):
    def handle(self):
        return self.success(data, "Message", 200)
```

## Response Methods

### Success Responses

#### `success(data, message, status_code)`
Generic success response with custom status code.

**Example:**
```python
return self.success(
    data=user_dict,
    message="User retrieved successfully",
    status_code=200
)
```

**Response:**
```json
{
  "message": "User retrieved successfully",
  "data": { ... },
  "status": "success"
}
```

---

#### `created(data, message)`
201 Created response (default for POST requests that create resources).

**Example:**
```python
return self.created(
    data=print_job.to_dict(),
    message="Print job created successfully"
)
```

**Response:**
```json
{
  "message": "Print job created successfully",
  "data": {
    "id": 1,
    "invoice_number": "1040812389838967",
    "waybill_url": "https://...",
    "status": "pending",
    "created_at": "2025-10-16T08:55:06.362189",
    "updated_at": "2025-10-16T08:55:06.362189"
  },
  "status": "success"
}
```

---

#### `paginated(items, total, page, per_page, message)`
Paginated response for list endpoints.

**Example:**
```python
return self.paginated(
    items=jobs_list,
    total=100,
    page=1,
    per_page=10,
    message="Print jobs retrieved successfully"
)
```

**Response:**
```json
{
  "message": "Print jobs retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 10,
    "last_page": 10
  },
  "status": "success"
}
```

---

### Error Responses

#### `error(message, errors, status_code)`
Generic error response.

**Example:**
```python
return self.error(
    message="Operation failed",
    errors=["Database connection timeout"],
    status_code=400
)
```

**Response:**
```json
{
  "message": "Operation failed",
  "errors": ["Database connection timeout"],
  "status": "error"
}
```

---

#### `validation_error(errors, message)`
422 Unprocessable Entity - Validation error response.

**Example:**
```python
return self.validation_error(
    errors=[
        "invoice_number is required",
        "waybill_url is required"
    ],
    message="Validation failed"
)
```

**Response:**
```json
{
  "message": "Validation failed",
  "errors": [
    "invoice_number is required",
    "waybill_url is required"
  ],
  "status": "error"
}
```

---

#### `not_found(message)`
404 Not Found response.

**Example:**
```python
return self.not_found("Print job not found")
```

**Response:**
```json
{
  "message": "Print job not found",
  "status": "error"
}
```

---

#### `unauthorized(message)`
401 Unauthorized response.

**Example:**
```python
return self.unauthorized("Invalid authentication token")
```

**Response:**
```json
{
  "message": "Invalid authentication token",
  "status": "error"
}
```

---

#### `forbidden(message)`
403 Forbidden response.

**Example:**
```python
return self.forbidden("You don't have permission to access this resource")
```

**Response:**
```json
{
  "message": "You don't have permission to access this resource",
  "status": "error"
}
```

---

#### `server_error(message)`
500 Internal Server Error response.

**Example:**
```python
return self.server_error("Database connection failed")
```

**Response:**
```json
{
  "message": "Database connection failed",
  "status": "error"
}
```

---

## HTTP Status Codes

| Method | Status Code | Use Case |
|--------|-------------|----------|
| `success()` | Custom (default 200) | General success responses |
| `created()` | 201 | Resource creation |
| `paginated()` | 200 | List with pagination |
| `validation_error()` | 422 | Validation failures |
| `error()` | 400 | Generic errors |
| `not_found()` | 404 | Resource not found |
| `unauthorized()` | 401 | Auth failures |
| `forbidden()` | 403 | Permission denied |
| `server_error()` | 500 | Server errors |

---

## Benefits

✅ **Consistency** - All responses follow the same format  
✅ **Clarity** - Clear separation of success/error  
✅ **Extensibility** - Easy to add new response methods  
✅ **DRY** - No duplicate response code  
✅ **Maintainability** - Central place to modify response structure

## Adding New Response Methods

Simply add a new method to `utils/response.py`:

```python
@staticmethod
def conflict(message="Resource already exists"):
    """Return a 409 Conflict response."""
    return ResponseTrait.error(message, status_code=409)
```

Then use it:
```python
return self.conflict("This invoice number already exists")
```
