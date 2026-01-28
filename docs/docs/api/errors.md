# Error Handling

Standard error responses and codes for the Authentication Test API.

## Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2026-01-28T10:30:00Z",
  "path": "/api/v1/schedule"
}
```

## HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

## Error Codes

### UNAUTHORIZED (401)

Missing or invalid JWT token.

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "timestamp": "2026-01-28T10:30:00Z",
  "path": "/api/v1/schedule"
}
```

### FORBIDDEN (403)

Valid token but insufficient permissions.

```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions. Required role: schedule-user",
  "timestamp": "2026-01-28T10:30:00Z",
  "path": "/api/v1/schedule"
}
```

### INTERNAL_ERROR (500)

Unexpected server error.

```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "timestamp": "2026-01-28T10:30:00Z",
  "path": "/api/v1/schedule"
}
```

## Handling Errors

### In Client Applications

```javascript
fetch('http://localhost:9080/api/v1/schedule', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => {
  if (!response.ok) {
    return response.json().then(error => {
      throw new Error(error.message);
    });
  }
  return response.json();
})
.catch(error => {
  console.error('API Error:', error.message);
});
```

## Next Steps

- [API Endpoints](endpoints.md)
- [Troubleshooting](../troubleshooting/common-issues.md)