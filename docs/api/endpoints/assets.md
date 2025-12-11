# Assets API

Endpoints for asset management.

## List Assets

Get a paginated list of assets.

### Request

```
GET /assets
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Items per page (max: 100) |
| `state` | `string` | Filter by state |
| `owner` | `string` | Filter by owner address |

### Response

```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "tokenId": "123",
        "state": "ACTIVATED",
        "owner": "0x123...",
        "metadata": {},
        "createdAt": "2025-12-11T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

### cURL Example

```bash
curl -X GET "https://api.tagit.network/v1/assets?state=ACTIVATED&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Get Asset

Get details of a specific asset.

### Request

```
GET /assets/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Asset token ID |

### Response

```json
{
  "success": true,
  "data": {
    "tokenId": "123",
    "state": "ACTIVATED",
    "owner": "0x123...",
    "chipId": "0xabc...",
    "metadata": {
      "name": "Product Name",
      "brand": "Brand Name",
      "sku": "SKU-123"
    },
    "history": [
      {
        "event": "MINTED",
        "timestamp": "2025-12-01T10:00:00Z",
        "actor": "0x456..."
      },
      {
        "event": "BOUND",
        "timestamp": "2025-12-02T10:00:00Z",
        "actor": "0x456..."
      }
    ],
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-11T10:00:00Z"
  }
}
```

### cURL Example

```bash
curl -X GET "https://api.tagit.network/v1/assets/123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Create Asset

Mint a new asset NFT.

### Request

```
POST /assets
```

### Request Body

```json
{
  "to": "0x123...",
  "metadata": {
    "name": "Product Name",
    "brand": "Brand Name",
    "sku": "SKU-123",
    "description": "Product description"
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "tokenId": "124",
    "txHash": "0xdef...",
    "state": "MINTED"
  }
}
```

### cURL Example

```bash
curl -X POST "https://api.tagit.network/v1/assets" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x123...",
    "metadata": {
      "name": "Product Name",
      "brand": "Brand Name"
    }
  }'
```

---

## Bind Asset

Bind an NFC chip to an asset.

### Request

```
POST /assets/:id/bind
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Asset token ID |

### Request Body

```json
{
  "chipId": "0xabc...",
  "signature": "0xdef..."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "tokenId": "123",
    "chipId": "0xabc...",
    "txHash": "0xghi...",
    "state": "BOUND"
  }
}
```

### cURL Example

```bash
curl -X POST "https://api.tagit.network/v1/assets/123/bind" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "chipId": "0xabc...",
    "signature": "0xdef..."
  }'
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `ASSET_NOT_FOUND` | 404 | Asset does not exist |
| `INVALID_STATE` | 400 | Asset in wrong state for operation |
| `CHIP_ALREADY_BOUND` | 400 | Chip is bound to another asset |
| `UNAUTHORIZED` | 401 | Missing/invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |

## Next Steps

- [Verification API](./verification.md) — Verify assets
- [Programs API](./programs.md) — Reward programs
- [API Overview](../overview.md) — Full API reference
