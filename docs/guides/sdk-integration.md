---
title: SDK Integration
description: Complete guide to integrating TAG IT Network using the JavaScript/TypeScript SDK
---

# SDK Integration

This guide provides end-to-end code examples for common TAG IT Network integration workflows using the `@tagit/sdk` package.

> **Tip**: For direct smart contract interaction, see the [Contract Integration](./contract-integration.md) guide.

## Installation

```bash
pnpm add @tagit/sdk
```

## TypeScript Type Imports

The SDK exports all types for full IntelliSense and compile-time safety:

```typescript
import type {
  Asset,
  AssetState,
  VerificationResult,
  VerificationChallenge,
  Program,
  ProgramProgress,
  AgentIdentity,
  AgentReputation,
  TagItConfig,
  TagItError,
} from '@tagit/sdk';
```

### Lifecycle State Enum

```typescript
import { AssetState } from '@tagit/sdk';

// States map to on-chain uint8 values
AssetState.NONE;       // 0
AssetState.MINTED;     // 1
AssetState.BOUND;      // 2
AssetState.ACTIVATED;  // 3
AssetState.CLAIMED;    // 4
AssetState.FLAGGED;    // 5
AssetState.RECYCLED;   // 6
```

## SDK Initialization

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY,
  network: 'testnet',        // 'testnet' (OP Sepolia) or 'mainnet'
  timeout: 30000,            // request timeout in ms (default: 30s)
  retries: 3,                // retry attempts on transient failures
});
```

## Tag Registration Flow

The full lifecycle from minting a Digital Twin to binding it to a physical NFC chip:

### Step 1: Mint a Digital Twin

```typescript
import { TagIt } from '@tagit/sdk';
import type { Asset } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY,
  network: 'testnet',
});

// Mint a new asset NFT (requires MINTER_ROLE)
const { tokenId, txHash } = await tagit.assets.create({
  to: '0xYourWalletAddress',
  metadata: {
    name: 'Limited Edition Sneaker',
    brand: 'ExampleBrand',
    sku: 'SNK-2026-001',
    description: 'Authenticated limited-edition sneaker',
  },
});

console.log('Minted token:', tokenId);
console.log('Transaction:', txHash);
// State is now MINTED (1)
```

### Step 2: Bind to NFC Chip

```typescript
// Bind the minted NFT to a physical NTAG 424 DNA chip (requires BINDER_ROLE)
const bindResult = await tagit.assets.bind(tokenId, {
  chipId: '0x04A2B3C4D5E6F7',      // 7-byte UID from the NFC chip
  signature: '0xabc123...',          // SUN authentication signature from the chip
});

console.log('Bound:', bindResult.state === 'BOUND');
console.log('Tag hash:', bindResult.tagHash);
// State is now BOUND (2)
```

### Step 3: Activate

```typescript
// Activate the asset after QA verification (requires VERIFIER_ROLE)
const activateResult = await tagit.assets.activate(tokenId);

console.log('Activated:', activateResult.state === 'ACTIVATED');
// State is now ACTIVATED (3) — ready for market
```

### Step 4: Claim (Transfer to Consumer)

```typescript
// Transfer ownership to the end consumer
const claimResult = await tagit.assets.claim(tokenId, {
  newOwner: '0xConsumerWalletAddress',
});

console.log('Claimed by:', claimResult.owner);
// State is now CLAIMED (4)
```

## Verification Flow with NFC SUN Message

Verify a product's authenticity using the NTAG 424 DNA SUN (Secure Unique NFC) protocol:

```typescript
import { TagIt } from '@tagit/sdk';
import type { VerificationResult } from '@tagit/sdk';

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY,
  network: 'testnet',
});

async function verifyProduct(tokenId: bigint): Promise<VerificationResult> {
  // 1. Generate a cryptographic challenge
  const { challengeId, challenge, expiresAt } = await tagit.verify.createChallenge(tokenId);

  console.log('Challenge expires at:', new Date(expiresAt));

  // 2. Read the NFC chip's SUN response
  //    The NTAG 424 DNA chip returns encrypted PICC data + MAC
  //    This step is platform-specific (Web NFC, Android NFC, iOS CoreNFC)
  const chipResponse = await readNfcChipSunMessage(challenge);

  // 3. Submit the response for verification
  const result = await tagit.verify.submit({
    challengeId,
    tokenId,
    response: chipResponse,
  });

  return result;
}

// Usage
const result = await verifyProduct(12345n);

if (result.verified) {
  console.log('AUTHENTIC');
  console.log('Owner:', result.asset.owner);
  console.log('State:', result.asset.state);
  console.log('Scan count:', result.scanCount);
} else {
  console.log('VERIFICATION FAILED:', result.reason);
  // Possible reasons: 'INVALID_MAC', 'COUNTER_MISMATCH', 'EXPIRED', 'TAG_NOT_BOUND'
}
```

### Simple One-Step Verification

For cases where the NFC response is already available:

```typescript
const result = await tagit.verify(12345n, challenge, chipResponse);
console.log('Verified:', result.verified);
```

## Agent Registration and Validation

Register and manage AI agents using the ERC-8004 agent infrastructure:

### Register an Agent

```typescript
// Register a new agent identity (soulbound to the wallet)
const agent = await tagit.agents.register({
  name: 'Verification Bot',
  description: 'Automated product verification agent',
  wallet: '0xAgentWalletAddress',
  metadata: {
    capabilities: ['verify', 'scan'],
    version: '1.0.0',
  },
});

console.log('Agent ID:', agent.agentId);
console.log('Registry:', agent.registryAddress);
```

### Query Agent Reputation

```typescript
const reputation = await tagit.agents.getReputation(agentId);

console.log('Score:', reputation.score);
console.log('Total feedback:', reputation.totalFeedback);
console.log('Positive:', reputation.positiveFeedback);
console.log('Time-weighted score:', reputation.timeWeightedScore);
```

### Submit Agent Validation

```typescript
// Request multi-party validation for an agent action
const validation = await tagit.agents.requestValidation({
  agentId,
  action: 'verify',
  tokenId: 12345n,
  proof: '0xValidationProofData...',
});

console.log('Validation ID:', validation.validationId);
console.log('Status:', validation.status); // 'PENDING', 'APPROVED', 'REJECTED'
```

## Error Handling Patterns

### Basic Error Handling

```typescript
import { TagIt, TagItError, ErrorCode } from '@tagit/sdk';

try {
  const asset = await tagit.assets.get(12345n);
} catch (error) {
  if (error instanceof TagItError) {
    switch (error.code) {
      case ErrorCode.NOT_FOUND:
        console.error('Asset does not exist');
        break;
      case ErrorCode.UNAUTHORIZED:
        console.error('Invalid or expired API key');
        break;
      case ErrorCode.FORBIDDEN:
        console.error('Insufficient permissions (check BIDGES capabilities)');
        break;
      case ErrorCode.RATE_LIMITED:
        console.error('Too many requests. Retry after:', error.retryAfter);
        break;
      case ErrorCode.CONTRACT_REVERT:
        console.error('On-chain error:', error.revertReason);
        break;
      default:
        console.error('Unexpected error:', error.message);
    }
  } else {
    // Network or other non-SDK error
    console.error('System error:', error);
  }
}
```

### Retry with Backoff

```typescript
import { TagIt, TagItError, ErrorCode } from '@tagit/sdk';

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof TagItError &&
        error.code === ErrorCode.RATE_LIMITED &&
        attempt < maxRetries
      ) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const asset = await withRetry(() => tagit.assets.get(12345n));
```

### Transaction Error Handling

```typescript
try {
  const { tokenId, txHash } = await tagit.assets.create({
    to: walletAddress,
    metadata: { name: 'Test', brand: 'Test', sku: 'T-001' },
  });

  console.log('Success! Token:', tokenId);
} catch (error) {
  if (error instanceof TagItError) {
    if (error.code === ErrorCode.CONTRACT_REVERT) {
      // Parse the specific Solidity custom error
      console.error('Contract reverted:', error.revertReason);
      // e.g. 'NotAuthorized', 'InvalidState', 'TagAlreadyBound'
    } else if (error.code === ErrorCode.INSUFFICIENT_FUNDS) {
      console.error('Wallet needs ETH for gas on OP Sepolia');
    }
  }
}
```

## Full Integration Example

A complete Express.js endpoint that verifies a product scan:

```typescript
import express from 'express';
import { TagIt, TagItError, ErrorCode } from '@tagit/sdk';
import type { VerificationResult } from '@tagit/sdk';

const app = express();
app.use(express.json());

const tagit = new TagIt({
  apiKey: process.env.TAGIT_API_KEY!,
  network: 'testnet',
});

app.post('/api/verify', async (req, res) => {
  const { tokenId, challengeId, chipResponse } = req.body;

  try {
    const result: VerificationResult = await tagit.verify.submit({
      challengeId,
      tokenId: BigInt(tokenId),
      response: chipResponse,
    });

    res.json({
      authentic: result.verified,
      asset: result.verified
        ? {
            owner: result.asset.owner,
            state: result.asset.state,
            metadata: result.asset.metadata,
          }
        : undefined,
      reason: result.verified ? undefined : result.reason,
    });
  } catch (error) {
    if (error instanceof TagItError) {
      res.status(error.code === ErrorCode.NOT_FOUND ? 404 : 500).json({
        error: error.message,
        code: error.code,
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(3000, () => console.log('Verification API running on :3000'));
```

## Related

- [JavaScript SDK Reference](../sdk/javascript.md) — Full API documentation
- [Contract Integration](./contract-integration.md) — Direct smart contract interaction
- [NTAG 424 DNA](../hardware/ntag-424-dna.md) — NFC chip specifications for SUN messages
- [Quickstart](../getting-started/quickstart.md) — 5-minute getting started guide
- [Agent Integration Tutorial](./agent-integration-tutorial.md) — ERC-8004 agent deep-dive
