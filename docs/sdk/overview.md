# SDK Overview

Official SDKs for TAG IT Network integration.

## Available SDKs

| Platform | Package | Documentation |
|----------|---------|---------------|
| JavaScript/TypeScript | `@tagit/sdk` | [View](./javascript.md) |
| Kotlin (Android) | `network.tagit:sdk` | [View](./kotlin.md) |
| Swift (iOS) | `TagItSDK` | [View](./swift.md) |

## Features

All SDKs provide:

- **Asset Management** — Create, read, update assets
- **Verification** — NFC challenge-response verification
- **Programs** — Reward program integration
- **Events** — Real-time event subscriptions
- **Offline Support** — Cached data for offline access

## Quick Comparison

| Feature | JavaScript | Kotlin | Swift |
|---------|------------|--------|-------|
| Asset CRUD | Yes | Yes | Yes |
| Verification | Yes | Yes | Yes |
| NFC Reading | No* | Yes | Yes |
| Programs | Yes | Yes | Yes |
| WebSockets | Yes | Yes | Yes |
| Offline Cache | Yes | Yes | Yes |

*JavaScript SDK requires native NFC bridge for mobile apps.

## Installation

### JavaScript

```bash
npm install @tagit/sdk
```

### Kotlin

```kotlin
dependencies {
    implementation("network.tagit:sdk:1.0.0")
}
```

### Swift

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/tagit-network/tagit-swift.git", from: "1.0.0")
]
```

## Basic Usage

### JavaScript

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({ apiKey: process.env.TAGIT_API_KEY });

// Get an asset
const asset = await tagit.assets.get(123n);
console.log('Asset:', asset);

// Verify an asset
const result = await tagit.verify(123n, challenge, response);
console.log('Verified:', result.verified);
```

### Kotlin

```kotlin
val tagit = TagIt.Builder()
    .apiKey(BuildConfig.TAGIT_API_KEY)
    .build()

// Get an asset
val asset = tagit.assets.get(123)
println("Asset: $asset")

// Verify an asset
val result = tagit.verify(123, challenge, response)
println("Verified: ${result.verified}")
```

### Swift

```swift
let tagit = TagIt(apiKey: Config.tagitApiKey)

// Get an asset
let asset = try await tagit.assets.get(id: 123)
print("Asset: \(asset)")

// Verify an asset
let result = try await tagit.verify(tokenId: 123, challenge: challenge, response: response)
print("Verified: \(result.verified)")
```

## Error Handling

All SDKs throw/return consistent error types:

| Error | Description |
|-------|-------------|
| `TagItError.unauthorized` | Invalid API key |
| `TagItError.notFound` | Resource not found |
| `TagItError.validationError` | Invalid input |
| `TagItError.networkError` | Network connectivity issue |
| `TagItError.serverError` | Server-side error |

## Next Steps

- [JavaScript SDK](./javascript.md) — Full JS/TS documentation
- [Kotlin SDK](./kotlin.md) — Full Android documentation
- [Swift SDK](./swift.md) — Full iOS documentation
- [API Reference](../api/overview.md) — REST API documentation
