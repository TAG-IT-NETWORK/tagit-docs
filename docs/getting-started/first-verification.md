---
title: First Verification
description: Complete walkthrough of verifying your first asset with TAG IT
---

# First Verification

A step-by-step guide to verifying your first asset using the challenge-response protocol.

## Overview

Asset verification proves that a physical item (with an NFC chip) matches its on-chain Digital Twin. This involves:

1. Reading the NFC chip
2. Sending a challenge to the chip
3. Verifying the response on-chain
4. Receiving the verification result

## Prerequisites

- TAG IT SDK installed ([Installation Guide](./installation.md))
- API key configured
- A TAG IT-enabled device or test asset

## Step 1: Read the NFC Chip

Using the ORACULAR mobile app or SDK:

```typescript
import { TagIt, NfcReader } from '@tagit/sdk';

const tagit = new TagIt({ apiKey: process.env.TAGIT_API_KEY });
const nfc = new NfcReader();

// Start NFC scan
const chipData = await nfc.scan();
console.log('Chip ID:', chipData.chipId);
console.log('Token ID:', chipData.tokenId);
```

## Step 2: Generate Challenge

```typescript
// Generate a unique challenge for this verification
const challenge = await tagit.createChallenge(chipData.tokenId);
console.log('Challenge:', challenge.data);
console.log('Expires:', challenge.expiresAt);
```

## Step 3: Get Chip Response

```typescript
// Send challenge to NFC chip and get signed response
const response = await nfc.challenge(challenge.data);
console.log('Chip Response:', response.signature);
```

## Step 4: Verify On-Chain

```typescript
// Submit to blockchain for verification
const result = await tagit.verify({
  tokenId: chipData.tokenId,
  challenge: challenge.data,
  response: response.signature
});

if (result.verified) {
  console.log('Verification PASSED');
  console.log('Asset State:', result.asset.state);
  console.log('Owner:', result.asset.owner);
  console.log('Verified At:', result.timestamp);
} else {
  console.log('Verification FAILED');
  console.log('Reason:', result.reason);
}
```

## Complete Example

```typescript
import { TagIt, NfcReader } from '@tagit/sdk';

async function verifyAsset() {
  const tagit = new TagIt({ apiKey: process.env.TAGIT_API_KEY });
  const nfc = new NfcReader();

  try {
    // 1. Scan NFC chip
    console.log('Scanning NFC chip...');
    const chipData = await nfc.scan();

    // 2. Create challenge
    console.log('Creating challenge...');
    const challenge = await tagit.createChallenge(chipData.tokenId);

    // 3. Get chip response
    console.log('Getting chip response...');
    const response = await nfc.challenge(challenge.data);

    // 4. Verify on-chain
    console.log('Verifying on-chain...');
    const result = await tagit.verify({
      tokenId: chipData.tokenId,
      challenge: challenge.data,
      response: response.signature
    });

    return result;
  } catch (error) {
    console.error('Verification error:', error.message);
    throw error;
  }
}

// Run verification
verifyAsset().then(result => {
  console.log('Result:', result);
});
```

## Understanding Results

| Field | Description |
|-------|-------------|
| `verified` | Boolean indicating pass/fail |
| `asset.state` | Current asset state (BOUND, ACTIVATED, etc.) |
| `asset.owner` | Current owner address |
| `timestamp` | When verification occurred |
| `txHash` | Transaction hash (if on-chain) |

## Troubleshooting

### "Chip not found"
- Ensure NFC is enabled on your device
- Hold device closer to the chip
- Try repositioning the chip

### "Challenge expired"
- Challenges expire after 5 minutes
- Generate a new challenge and retry

### "Verification failed"
- Check if asset is in FLAGGED state
- Verify the chip hasn't been tampered with
- Contact support if issue persists

## Next Steps

- [SDK Reference](../sdk/overview.md) — Full API documentation
- [API Endpoints](../api/endpoints/verification.md) — REST API details
- [TAGITCore Contract](../contracts/tagit-core.md) — Smart contract reference
