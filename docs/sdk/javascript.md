---
title: JavaScript SDK
description: Official JavaScript/TypeScript SDK for TAG IT Network
---

# JavaScript SDK

Complete reference for the official TAG IT JavaScript/TypeScript SDK.

## Installation

```bash
npm install @tagit/sdk
```

## Quick Start

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY,
  network: 'testnet'
});

// Verify an asset
const result = await tagit.verify(12345n);
console.log('Verified:', result.verified);
```

## Configuration

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({
  // Required
  apiKey: 'your-api-key',

  // Optional
  network: 'testnet',        // 'mainnet' | 'testnet'
  timeout: 30000,            // Request timeout in ms
  retries: 3,                // Retry attempts
  logging: true,             // Debug logging
  baseUrl: 'https://...',    // Custom API URL
});
```

## Assets

### Get Asset

```typescript
const asset = await tagit.assets.get(123n);

console.log('Token ID:', asset.tokenId);
console.log('State:', asset.state);
console.log('Owner:', asset.owner);
console.log('Metadata:', asset.metadata);
```

### List Assets

```typescript
const { assets, pagination } = await tagit.assets.list({
  state: 'ACTIVATED',
  owner: '0x123...',
  page: 1,
  limit: 20
});

for (const asset of assets) {
  console.log(asset.tokenId, asset.state);
}
```

### Create Asset

```typescript
const { tokenId, txHash } = await tagit.assets.create({
  to: '0x123...',
  metadata: {
    name: 'Product Name',
    brand: 'Brand',
    sku: 'SKU-123'
  }
});

console.log('Created:', tokenId);
```

### Bind Asset

```typescript
const result = await tagit.assets.bind(123n, {
  chipId: '0xabc...',
  signature: '0xdef...'
});

console.log('Bound:', result.state === 'BOUND');
```

## Verification

### Full Verification Flow

```typescript
// 1. Generate challenge
const { challengeId, challenge, expiresAt } = await tagit.verify.createChallenge(123n);

// 2. Get response from NFC chip (platform-specific)
const response = await nfcChip.sign(challenge);

// 3. Submit verification
const result = await tagit.verify.submit({
  challengeId,
  tokenId: 123n,
  response
});

if (result.verified) {
  console.log('Asset is authentic!');
  console.log('Owner:', result.asset.owner);
} else {
  console.log('Verification failed:', result.reason);
}
```

### Simple Verification

```typescript
// One-step verification (challenge/response handled internally)
const result = await tagit.verify(123n, challenge, response);
console.log('Verified:', result.verified);
```

## Programs

### List Programs

```typescript
const programs = await tagit.programs.list({ active: true });

for (const program of programs) {
  console.log(program.name, program.type);
}
```

### Enroll

```typescript
const enrollment = await tagit.programs.enroll('prog_123');
console.log('Enrolled:', enrollment.enrollmentId);
```

### Get Progress

```typescript
const progress = await tagit.programs.getProgress('prog_123');

console.log('Points:', progress.points);
console.log('Level:', progress.level);
console.log('Claimable rewards:', progress.claimableRewards);
```

### Claim Reward

```typescript
const claim = await tagit.programs.claim('prog_123', 'rew_1');
console.log('Claimed:', claim.rewardName);
```

## Events

### Subscribe to Events

```typescript
const unsubscribe = tagit.events.subscribe('asset.verified', (event) => {
  console.log('Asset verified:', event.tokenId);
  console.log('By:', event.verifier);
});

// Later: unsubscribe
unsubscribe();
```

### Event Types

| Event | Description |
|-------|-------------|
| `asset.minted` | New asset created |
| `asset.bound` | Asset bound to chip |
| `asset.verified` | Asset verification |
| `asset.transferred` | Ownership changed |
| `asset.flagged` | Asset flagged |

## Error Handling

```typescript
import { TagIt, TagItError, ErrorCode } from '@tagit/sdk';

try {
  const asset = await tagit.assets.get(123n);
} catch (error) {
  if (error instanceof TagItError) {
    switch (error.code) {
      case ErrorCode.NOT_FOUND:
        console.log('Asset not found');
        break;
      case ErrorCode.UNAUTHORIZED:
        console.log('Invalid API key');
        break;
      default:
        console.log('Error:', error.message);
    }
  }
}
```

## TypeScript Types

```typescript
import type {
  Asset,
  AssetState,
  VerificationResult,
  Program,
  ProgramProgress
} from '@tagit/sdk';

const asset: Asset = await tagit.assets.get(123n);
const state: AssetState = asset.state; // 'MINTED' | 'BOUND' | 'ACTIVATED' | ...
```

## Next Steps

- [SDK Overview](./overview.md) — All SDKs
- [Kotlin SDK](./kotlin.md) — Android documentation
- [Swift SDK](./swift.md) — iOS documentation
- [API Reference](../api/overview.md) — REST API
