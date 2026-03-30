---
title: Quickstart
description: Get started with TAG IT Network in 5 minutes
---

# Quickstart

Get up and running with TAG IT Network in under 5 minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 18+ | [Download](https://nodejs.org/) or use `nvm install 18` |
| **pnpm** | 8+ | `npm install -g pnpm` (npm or yarn also work) |
| **OP Sepolia RPC** | — | Public: `https://sepolia.optimism.io` or get a dedicated endpoint from [Alchemy](https://alchemy.com) / [QuickNode](https://quicknode.com) |
| **API Key** | — | Get one at [dashboard.tagit.network](https://dashboard.tagit.network) |

> **Tip**: For local development, you can also run a local fork with Anvil:
> `anvil --fork-url https://sepolia.optimism.io`

## Installation

```bash
pnpm add @tagit/sdk
```

Or with npm/yarn:

```bash
npm install @tagit/sdk
# or
yarn add @tagit/sdk
```

## Connect to OP Sepolia

The SDK connects to TAG IT's OP Sepolia testnet deployment by default:

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY,
  network: 'testnet', // OP Sepolia (chain ID 11155420)
});
```

For direct blockchain interaction using [viem](https://viem.sh/), configure the OP Sepolia chain:

```typescript
import { createPublicClient, http } from 'viem';
import { optimismSepolia } from 'viem/chains';

const client = createPublicClient({
  chain: optimismSepolia,
  transport: http('https://sepolia.optimism.io'),
});
```

## First Tag Lookup

Look up an asset by its token ID to read its current lifecycle state:

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY,
  network: 'testnet',
});

// Look up an asset by token ID
const asset = await tagit.assets.get(12345n);

console.log('Token ID:', asset.tokenId);
console.log('State:', asset.state);      // e.g. 'BOUND', 'ACTIVATED', 'CLAIMED'
console.log('Owner:', asset.owner);
console.log('Metadata:', asset.metadata);
```

### Lifecycle States

Assets progress through these states (see [Asset Lifecycle](../architecture/data-flow.md)):

| State | ID | Description |
|-------|-----|-------------|
| `NONE` | 0 | Default — asset does not exist |
| `MINTED` | 1 | NFT created, not yet bound to a chip |
| `BOUND` | 2 | Linked to a physical NFC chip |
| `ACTIVATED` | 3 | Chip verified, ready for market |
| `CLAIMED` | 4 | Owned by end consumer |
| `FLAGGED` | 5 | Frozen for dispute or investigation |
| `RECYCLED` | 6 | End of life (terminal) |

## First Verification

Verify that a physical product is authentic by validating its NFC chip response:

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY,
  network: 'testnet',
});

// Step 1: Generate a challenge for the NFC chip
const { challengeId, challenge, expiresAt } = await tagit.verify.createChallenge(12345n);

// Step 2: Get the chip's response (platform-specific NFC read)
// The NTAG 424 DNA chip produces a SUN message with encrypted UID + counter + MAC
const chipResponse = await readNfcChip(challenge); // your NFC integration

// Step 3: Submit for on-chain verification
const result = await tagit.verify.submit({
  challengeId,
  tokenId: 12345n,
  response: chipResponse,
});

if (result.verified) {
  console.log('Asset is authentic!');
  console.log('Owner:', result.asset.owner);
  console.log('State:', result.asset.state);
} else {
  console.log('Verification failed:', result.reason);
}
```

> **Security**: The challenge expires after the `expiresAt` timestamp. Always generate a fresh challenge for each verification to prevent replay attacks.

## Next Steps

- [Full Installation Guide](./installation.md) — Detailed setup instructions
- [First Verification](./first-verification.md) — Complete verification walkthrough
- [SDK Reference](../sdk/javascript.md) — Full API documentation
- [Contract Integration](../guides/contract-integration.md) — Direct smart contract interaction
- [SDK Integration](../guides/sdk-integration.md) — Complete SDK usage patterns
- [NTAG 424 DNA](../hardware/ntag-424-dna.md) — NFC chip specifications
- [Deployment Reference](../contracts/deployment-reference.md) — OP Sepolia addresses and network info
