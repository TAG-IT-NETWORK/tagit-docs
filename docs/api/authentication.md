# Authentication

API authentication methods for TAG IT Network.

## Authentication Methods

### API Key

For server-to-server communication, use an API key.

```bash
curl -X GET "https://api.tagit.network/v1/assets" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### JWT Token

For user-authenticated requests, use JWT tokens.

```bash
curl -X GET "https://api.tagit.network/v1/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Obtaining Credentials

### API Keys

1. Log in to the [Dashboard](https://dashboard.tagit.network)
2. Navigate to **Settings > API Keys**
3. Click **Create New Key**
4. Copy your key (shown only once)

### JWT Tokens

Authenticate users via OAuth or the login endpoint:

```bash
curl -X POST "https://api.tagit.network/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

## Token Refresh

Refresh expired tokens:

```bash
curl -X POST "https://api.tagit.network/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

## Scopes

API keys can be scoped to specific permissions:

| Scope | Description |
|-------|-------------|
| `assets:read` | Read asset data |
| `assets:write` | Create/update assets |
| `verify:execute` | Execute verifications |
| `programs:read` | Read program data |
| `programs:write` | Manage programs |
| `admin:*` | Full admin access |

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Rotate keys** regularly (every 90 days)
3. **Use scoped keys** with minimum required permissions
4. **Monitor usage** in the dashboard
5. **Revoke compromised keys** immediately

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid credentials |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INVALID_SCOPE` | 403 | Key doesn't have required scope |

## SDK Authentication

### JavaScript

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY
});
```

### Kotlin

```kotlin
val tagit = TagIt.Builder()
    .apiKey(BuildConfig.TAGIT_API_KEY)
    .build()
```

### Swift

```swift
let tagit = TagIt(apiKey: Config.tagitApiKey)
```

## Next Steps

- [API Overview](./overview.md) — Full API documentation
- [Assets Endpoint](./endpoints/assets.md) — Asset management
