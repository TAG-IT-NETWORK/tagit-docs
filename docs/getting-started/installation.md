# Installation Guide

Complete installation instructions for TAG IT Network SDKs.

## JavaScript / TypeScript

### npm

```bash
npm install @tagit/sdk
```

### yarn

```bash
yarn add @tagit/sdk
```

### pnpm

```bash
pnpm add @tagit/sdk
```

## Kotlin (Android)

Add to your `build.gradle.kts`:

```kotlin
dependencies {
    implementation("network.tagit:sdk:1.0.0")
}
```

## Swift (iOS)

### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/tagit-network/tagit-swift.git", from: "1.0.0")
]
```

### CocoaPods

Add to your `Podfile`:

```ruby
pod 'TagItSDK', '~> 1.0'
```

## Configuration

### Environment Variables

```bash
# Required
TAGIT_API_KEY=your_api_key_here

# Optional
TAGIT_NETWORK=testnet  # or mainnet
TAGIT_RPC_URL=https://your-rpc-url
```

### SDK Configuration

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY,
  network: 'testnet',
  timeout: 30000,        // Request timeout in ms
  retries: 3,            // Number of retry attempts
  logging: true          // Enable debug logging
});
```

## Verify Installation

```typescript
// Check SDK version and connection
const status = await tagit.health();
console.log('SDK Version:', status.sdkVersion);
console.log('API Version:', status.apiVersion);
console.log('Network:', status.network);
```

## Next Steps

- [Quickstart Guide](./quickstart.md) — Get started quickly
- [First Verification](./first-verification.md) — Verify your first asset
