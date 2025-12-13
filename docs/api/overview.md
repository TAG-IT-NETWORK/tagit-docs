---
title: API Overview
description: TAG IT Network REST API reference
---

# API Overview

The TAG IT API provides programmatic access to all platform features.

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.tagit.network/v1` |
| Staging | `https://api.staging.tagit.network/v1` |
| Development | `https://api.dev.tagit.network/v1` |

## Authentication

All API requests require authentication. See [Authentication](./authentication.md) for details.

```bash
curl -X GET "https://api.tagit.network/v1/assets/123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Response Format

All responses are JSON with consistent structure:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-12-11T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ASSET_NOT_FOUND",
    "message": "Asset with ID 123 not found",
    "details": {}
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-12-11T10:30:00Z"
  }
}
```

## Rate Limits

| Tier | Requests/min | Requests/day |
|------|--------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 50,000 |
| Enterprise | 1,000 | Unlimited |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1702297800
```

## API Endpoints

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/assets` | List assets |
| `GET` | `/assets/:id` | Get asset details |
| `POST` | `/assets` | Create new asset |
| `POST` | `/assets/:id/bind` | Bind NFC chip |

See [Assets API](./endpoints/assets.md) for details.

### Verification

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/verify/challenge` | Generate challenge |
| `POST` | `/verify/submit` | Submit verification |
| `GET` | `/verify/:id` | Get verification result |

See [Verification API](./endpoints/verification.md) for details.

### Programs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/programs` | List programs |
| `POST` | `/programs/:id/enroll` | Enroll in program |
| `POST` | `/programs/:id/claim` | Claim reward |

See [Programs API](./endpoints/programs.md) for details.

## SDKs

Official SDKs are available for:

- [JavaScript/TypeScript](../sdk/javascript.md)
- [Kotlin (Android)](../sdk/kotlin.md)
- [Swift (iOS)](../sdk/swift.md)

## Health Check

```bash
GET /health
```

Response:

```json
{
  "status": "ok",
  "api": true,
  "blockchain": true,
  "indexer": true,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Related

- [Authentication](./authentication.md) — API authentication
- [Assets Endpoint](./endpoints/assets.md) — Asset management
- [Verification Endpoint](./endpoints/verification.md) — Asset verification
- [SDK Documentation](../sdk/overview.md) — Official SDKs
