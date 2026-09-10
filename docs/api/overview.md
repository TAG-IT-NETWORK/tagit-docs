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

### Owner Actions (September 2026)

Actions the on-chain owner of an asset can take from the TAG IT app — report it
lost/stolen, list/delist it for resale, or retire it. No API key: the owner's
wallet signature is the credential. Source: `tagit-services/src/owner-actions/`.

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/v1/assets/:tokenId/owner-actions?owner=0x…` | none (public read) |
| `POST` | `/api/v1/assets/:tokenId/owner-actions` | owner wallet signature |

`POST` body:

```json
{
  "action": "flag",
  "params": { "reason": "stolen from a delivery box" },
  "owner": "0x...",
  "signature": "0x...",
  "timestamp": 1757500000000,
  "source": "app"
}
```

`action` is one of `flag | list | delist | recycle | cancel-recycle`. `source`
is `app | verify | console` and is optional. `params` differs per action:

| Action | Params |
|--------|--------|
| `flag` | `{ reason }` |
| `list` | `{ priceUsdc }` (string, up to 6 decimal places) |
| `delist` | `{ reason? }` |
| `recycle` | `{ reason, method: "self" \| "bin" }` |
| `cancel-recycle` | `{}` |

The owner signs an EIP-191 `personal_sign` message built from exactly these
lines:

```
TAG IT owner action
token: <tokenId>
action: <flag|list|delist|recycle|cancel-recycle>
params-sha256: <lowercase hex sha256 of the canonical params JSON (sorted keys, empty/null values dropped), or "none" if there are no params>
ts: <unix ms>
```

`ts` must be within 15 minutes of the server's clock, and `(tokenId, action,
ts)` must be unique — replaying an old signed message is rejected. Services
verifies the signature, then reads `ownerOf(tokenId)` on-chain and rejects the
call if the signer is not the current owner.

What happens once a request is accepted:
- **flag** — the relayer calls `flag()` on `TAGITCore` immediately (state → `FLAGGED`).
- **list** / **delist** — creates or removes a marketplace listing with the owner as seller.
- **recycle** — not executed immediately. It is scheduled `OWNER_RECYCLE_GRACE_MS`
  (default 24h) in the future; a background reconciler sweep executes it when
  due, re-checking on-chain ownership first, and calls `recycle()` on `TAGITCore`.
- **cancel-recycle** — cancels a still-pending scheduled recycle.

Each submitted action returns a row with `status` one of `executed | scheduled
| cancelled | failed`.

Errors: `400` validation, `403 NOT_OWNER` (signer isn't the current on-chain
owner), `404` (e.g. `cancel-recycle` with nothing scheduled), `429` (limited to
10 requests/minute per IP), `502` when the underlying rail (chain read or
relayer tx) fails.

See [Manage a Product from the TAG IT App](../guides/owner-actions.md) for the
end-user walkthrough.

### Verified-Owner Ratings (September 2026)

A product rating that only the wallet currently holding the asset's token can
leave — one rating per owner per token; a later submission replaces the
earlier one. Shown on the `verify.tagit.network` asset page. Source:
`tagit-services/src/ratings/`.

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/v1/assets/:tokenId/ratings` | none |
| `POST` | `/api/v1/assets/:tokenId/ratings` | owner wallet signature |
| `GET` | `/api/v1/templates/:templateId/rating` | none — product-line roll-up |

`POST` body: `{ stars: 1-5, review?: string (≤500 chars), rater: "0x...",
signature: "0x...", timestamp, source?: "verify" | "app" | "console" }`. The
signed message (EIP-191 `personal_sign`) is:

```
TAG IT product rating
token: <tokenId>
stars: <1-5>
review-sha256: <sha256 hex of the trimmed review text, or "none">
ts: <unix ms>
```

Same 15-minute signing window and on-chain `ownerOf` check as owner actions.
Unlike owner actions, a rating never touches the chain — it is a
signature-gated database write, upserted per `(tokenId, rater)`. Errors: `400`,
`403 NOT_OWNER`, `429` (10/min per IP), `502` if the owner can't be read
on-chain.

### Logistics — Carrier Tracking (September 2026)

Shipment tracking behind a normalized shape, backed by carrier adapters (a
deterministic demo carrier, and UPS when `UPS_CLIENT_ID` / `UPS_CLIENT_SECRET`
are configured). API-key tier — same gateway key as the rest of the guarded
surface. Source: `tagit-services/src/logistics/`.

| Method | Endpoint | Description |
|--------|----------|--------------|
| `GET` | `/api/v1/agents/logistics/carriers` | Lists carrier adapters and whether each is configured |
| `POST` | `/api/v1/agents/logistics/track` | `{ trackingNumber, carrier? }` → normalized tracking result |

`carrier` is guessed from the tracking-number format when omitted (UPS numbers
match `1Z…`; anything else falls back to the demo carrier).

## Agent-to-Agent (A2A)

The same gateway also speaks JSON-RPC 2.0 for agent-to-agent calls:

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/.well-known/agent.json` | none — agent card / skill discovery |
| `POST` | `/a2a` | none |

As of September 2026 the registered agents include a **Logistics** agent
exposing two skills over this endpoint — `logistics__track_shipment` and
`logistics__carriers` — mirroring the HTTP surface above, so any agent (or the
admin console's Agent Catalog) can ask "where is this shipment?" without a
carrier-specific integration.

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
