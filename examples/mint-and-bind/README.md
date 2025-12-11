# Mint and Bind Example

This example demonstrates how to mint a new asset NFT and bind an NFC chip to it.

## Overview

The mint-and-bind flow is the foundation of TAG IT's Digital Twin system:

1. **Mint** — Create an NFT representing the physical product
2. **Bind** — Cryptographically link an NFC chip to the NFT

## Prerequisites

- Node.js 18+
- TAG IT API key with `CAP_MINT` and `CAP_BIND` capabilities
- NFC chip data (for binding)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
TAGIT_API_KEY=your_api_key_here
TAGIT_NETWORK=testnet
```

## Running the Example

```bash
npx ts-node index.ts
```

## Code Walkthrough

### 1. Initialize SDK

```typescript
const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY!,
  network: 'testnet'
});
```

### 2. Mint Asset

```typescript
const { tokenId } = await tagit.assets.create({
  to: manufacturerAddress,
  metadata: {
    name: 'Example Product',
    brand: 'Example Brand',
    sku: 'SKU-001'
  }
});
```

### 3. Bind NFC Chip

```typescript
await tagit.assets.bind(tokenId, {
  chipId: nfcChipId,
  signature: chipAttestation
});
```

## Expected Output

```
Minting new asset...
Asset minted: tokenId=123
Transaction: 0xabc...

Binding NFC chip...
Asset bound: state=BOUND
Transaction: 0xdef...

Done! Asset 123 is now bound to chip 0xabc...
```

## Next Steps

- [Verify Asset Example](../verify-asset/) — Verify the bound asset
- [Transfer Ownership Example](../transfer-ownership/) — Transfer to new owner
- [SDK Documentation](../../docs/sdk/javascript.md) — Full SDK reference
