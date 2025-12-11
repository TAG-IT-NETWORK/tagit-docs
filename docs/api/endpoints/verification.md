# Verification API

Endpoints for asset verification.

## Generate Challenge

Generate a verification challenge for an asset.

### Request

```
POST /verify/challenge
```

### Request Body

```json
{
  "tokenId": "123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "challengeId": "chal_abc123",
    "challenge": "0x123...",
    "expiresAt": "2025-12-11T10:35:00Z"
  }
}
```

### cURL Example

```bash
curl -X POST "https://api.tagit.network/v1/verify/challenge" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "123"}'
```

---

## Submit Verification

Submit a verification response for validation.

### Request

```
POST /verify/submit
```

### Request Body

```json
{
  "challengeId": "chal_abc123",
  "tokenId": "123",
  "response": "0xdef..."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "verificationId": "ver_xyz789",
    "verified": true,
    "asset": {
      "tokenId": "123",
      "state": "ACTIVATED",
      "owner": "0x123..."
    },
    "timestamp": "2025-12-11T10:30:00Z",
    "txHash": "0xabc..."
  }
}
```

### cURL Example

```bash
curl -X POST "https://api.tagit.network/v1/verify/submit" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": "chal_abc123",
    "tokenId": "123",
    "response": "0xdef..."
  }'
```

---

## Get Verification Result

Get the result of a previous verification.

### Request

```
GET /verify/:id
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Verification ID |

### Response

```json
{
  "success": true,
  "data": {
    "verificationId": "ver_xyz789",
    "verified": true,
    "tokenId": "123",
    "verifier": "0x456...",
    "timestamp": "2025-12-11T10:30:00Z",
    "txHash": "0xabc..."
  }
}
```

### cURL Example

```bash
curl -X GET "https://api.tagit.network/v1/verify/ver_xyz789" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Get Verification History

Get verification history for an asset.

### Request

```
GET /assets/:id/verifications
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | `number` | Page number |
| `limit` | `number` | Items per page |

### Response

```json
{
  "success": true,
  "data": {
    "verifications": [
      {
        "verificationId": "ver_xyz789",
        "verified": true,
        "verifier": "0x456...",
        "timestamp": "2025-12-11T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `CHALLENGE_NOT_FOUND` | 404 | Challenge does not exist |
| `CHALLENGE_EXPIRED` | 400 | Challenge has expired |
| `VERIFICATION_FAILED` | 400 | Signature verification failed |
| `ASSET_FLAGGED` | 400 | Asset is flagged and cannot be verified |
| `INVALID_TOKEN_ID` | 400 | Token ID is invalid |

## Verification Failure Reasons

When `verified: false`, check the `reason` field:

| Reason | Description |
|--------|-------------|
| `INVALID_SIGNATURE` | Chip signature doesn't match |
| `ASSET_FLAGGED` | Asset is in FLAGGED state |
| `CHIP_MISMATCH` | Chip ID doesn't match bound chip |
| `CHALLENGE_EXPIRED` | Challenge expired before submission |
| `REPLAY_DETECTED` | Same response used twice |

## Next Steps

- [Assets API](./assets.md) — Asset management
- [Programs API](./programs.md) — Reward programs
- [API Overview](../overview.md) — Full API reference
