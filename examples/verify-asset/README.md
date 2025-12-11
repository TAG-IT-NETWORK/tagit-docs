# Verify Asset Example

This example demonstrates how to verify an asset's authenticity using the challenge-response protocol.

## Overview

Asset verification proves that a physical product (with NFC chip) matches its on-chain Digital Twin:

1. **Generate Challenge** — Create a unique challenge for the verification
2. **Get Chip Response** — The NFC chip signs the challenge
3. **Submit Verification** — Validate the signature on-chain

## Prerequisites

- Node.js 18+
- TAG IT API key
- An asset token ID to verify
- NFC chip response (in production, from actual chip)

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

### 1. Generate Challenge

```typescript
const challenge = await tagit.verify.createChallenge(tokenId);
console.log('Challenge:', challenge.data);
console.log('Expires:', challenge.expiresAt);
```

### 2. Get Chip Response

In production, this comes from the actual NFC chip:

```typescript
// Mobile SDK example
const response = await nfcChip.sign(challenge.data);
```

### 3. Submit Verification

```typescript
const result = await tagit.verify.submit({
  challengeId: challenge.challengeId,
  tokenId,
  response: chipSignature
});
```

### 4. Handle Result

```typescript
if (result.verified) {
  console.log('Asset is authentic!');
  console.log('Owner:', result.asset.owner);
} else {
  console.log('Verification failed:', result.reason);
}
```

## Expected Output

```
Generating verification challenge...
Challenge ID: chal_abc123
Challenge: 0x1234...
Expires: 2025-12-11T10:35:00Z

Submitting verification...
Verification result: PASSED
Transaction: 0xdef...

Asset Details:
  Token ID: 123
  State: ACTIVATED
  Owner: 0x123...
  Last Verified: 2025-12-11T10:30:00Z
```

## Verification Failure Reasons

| Reason | Description |
|--------|-------------|
| `INVALID_SIGNATURE` | Chip signature doesn't match |
| `ASSET_FLAGGED` | Asset is in FLAGGED state |
| `CHIP_MISMATCH` | Wrong chip for this asset |
| `CHALLENGE_EXPIRED` | Challenge expired |

## Next Steps

- [Mint and Bind Example](../mint-and-bind/) — Create new assets
- [Transfer Ownership Example](../transfer-ownership/) — Transfer assets
- [SDK Documentation](../../docs/sdk/javascript.md) — Full SDK reference
