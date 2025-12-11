# Quickstart Guide

Get started with TAG IT Network in 5 minutes.

## Prerequisites

- Node.js 18+
- npm or yarn
- An API key (get one at [dashboard.tagit.network](https://dashboard.tagit.network))

## Installation

```bash
npm install @tagit/sdk
```

## Basic Usage

### 1. Initialize the SDK

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY,
  network: 'testnet' // or 'mainnet'
});
```

### 2. Verify an Asset

```typescript
// Verify an asset by token ID
const result = await tagit.verify(12345n);

if (result.verified) {
  console.log('Asset is authentic!');
  console.log('Owner:', result.owner);
  console.log('State:', result.state);
} else {
  console.log('Verification failed:', result.reason);
}
```

### 3. Get Asset Details

```typescript
const asset = await tagit.getAsset(12345n);

console.log('Token ID:', asset.tokenId);
console.log('State:', asset.state);
console.log('Bound at:', asset.boundAt);
console.log('Metadata:', asset.metadata);
```

## Next Steps

- [Full Installation Guide](./installation.md) — Detailed setup instructions
- [First Verification](./first-verification.md) — Complete verification walkthrough
- [SDK Reference](../sdk/javascript.md) — Full API documentation
