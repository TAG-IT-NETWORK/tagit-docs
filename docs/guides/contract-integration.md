---
title: Contract Integration
description: How to interact with TAG IT Network smart contracts directly using viem and the SDK ABIs
---

# Contract Integration

This guide covers direct interaction with TAG IT Network smart contracts on OP Sepolia using [viem](https://viem.sh/) and the ABIs exported from `@tagit/sdk`.

> **Tip**: For most use cases, the [SDK Integration](./sdk-integration.md) guide provides a higher-level API. Use direct contract interaction when you need fine-grained control or want to listen to on-chain events.

## Prerequisites

```bash
pnpm add @tagit/sdk viem
```

## Using Contract ABIs from the SDK

The `@tagit/sdk` package exports typed ABIs for all deployed contracts:

```typescript
import {
  tagitCoreAbi,
  tagitAccessAbi,
  tagitRecoveryAbi,
  tagitProgramsAbi,
  tagitTokenAbi,
  tagitGovernorAbi,
  tagitTreasuryAbi,
  agentIdentityAbi,
  agentReputationAbi,
  agentValidationAbi,
} from '@tagit/sdk/abis';
```

## Setting Up a viem Client

### Read-Only Client

```typescript
import { createPublicClient, http } from 'viem';
import { optimismSepolia } from 'viem/chains';

const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http('https://sepolia.optimism.io'),
});
```

### Read-Write Client (with Wallet)

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { optimismSepolia } from 'viem/chains';

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
  account,
  chain: optimismSepolia,
  transport: http('https://sepolia.optimism.io'),
});
```

> **Security**: Never hardcode private keys. Use environment variables or a secure key management system.

## Reading Tag State from TAGITCore

The TAGITCore contract at `0x8bde22da889306d422802728cb98b6da42ed8e1a` is the primary contract for asset lifecycle management.

```typescript
import { tagitCoreAbi } from '@tagit/sdk/abis';

const TAGIT_CORE = '0x8bde22da889306d422802728cb98b6da42ed8e1a' as const;

// Read the lifecycle state of an asset
const state = await publicClient.readContract({
  address: TAGIT_CORE,
  abi: tagitCoreAbi,
  functionName: 'getState',
  args: [12345n], // tokenId
});

console.log('State:', state);
// Returns: 0=NONE, 1=MINTED, 2=BOUND, 3=ACTIVATED, 4=CLAIMED, 5=FLAGGED, 6=RECYCLED
```

### Reading Multiple Fields

```typescript
// Read asset owner
const owner = await publicClient.readContract({
  address: TAGIT_CORE,
  abi: tagitCoreAbi,
  functionName: 'ownerOf',
  args: [12345n],
});

// Read bound tag hash
const tagHash = await publicClient.readContract({
  address: TAGIT_CORE,
  abi: tagitCoreAbi,
  functionName: 'getTagHash',
  args: [12345n],
});

console.log('Owner:', owner);
console.log('Tag Hash:', tagHash);
```

## Writing Transactions

### Binding a Tag

```typescript
const hash = await walletClient.writeContract({
  address: TAGIT_CORE,
  abi: tagitCoreAbi,
  functionName: 'bindTag',
  args: [
    12345n,                             // tokenId
    '0xabcdef...' as `0x${string}`,     // tagHash (NFC chip identifier)
  ],
});

// Wait for confirmation
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log('Bound in block:', receipt.blockNumber);
```

## Event Subscriptions with viem

### Listening to Lifecycle Events

Subscribe to real-time events from TAGITCore:

```typescript
// Watch for all state transitions
const unwatch = publicClient.watchContractEvent({
  address: TAGIT_CORE,
  abi: tagitCoreAbi,
  eventName: 'StateChanged',
  onLogs: (logs) => {
    for (const log of logs) {
      console.log('Token:', log.args.tokenId);
      console.log('From:', log.args.fromState);
      console.log('To:', log.args.toState);
      console.log('Block:', log.blockNumber);
    }
  },
});

// Stop watching
// unwatch();
```

### Filtering Events by Token ID

```typescript
const unwatch = publicClient.watchContractEvent({
  address: TAGIT_CORE,
  abi: tagitCoreAbi,
  eventName: 'StateChanged',
  args: {
    tokenId: 12345n, // only this asset
  },
  onLogs: (logs) => {
    for (const log of logs) {
      console.log('State changed to:', log.args.toState);
    }
  },
});
```

### Querying Historical Events

```typescript
const logs = await publicClient.getContractEvents({
  address: TAGIT_CORE,
  abi: tagitCoreAbi,
  eventName: 'StateChanged',
  fromBlock: 0n,
  toBlock: 'latest',
  args: {
    tokenId: 12345n,
  },
});

console.log(`Found ${logs.length} state transitions`);
for (const log of logs) {
  console.log(`  Block ${log.blockNumber}: ${log.args.fromState} → ${log.args.toState}`);
}
```

### Watching Agent Events (ERC-8004)

```typescript
import { agentIdentityAbi } from '@tagit/sdk/abis';

const AGENT_IDENTITY = '0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D' as const;

const unwatch = publicClient.watchContractEvent({
  address: AGENT_IDENTITY,
  abi: agentIdentityAbi,
  eventName: 'AgentRegistered',
  onLogs: (logs) => {
    for (const log of logs) {
      console.log('New agent:', log.args.agentId);
      console.log('Wallet:', log.args.wallet);
    }
  },
});
```

## Error Codes Reference

TAG IT contracts use custom Solidity errors instead of string reverts. Handle them in your application:

### TAGITCore Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `InvalidState(uint8 current, uint8 expected)` | Attempted a transition from the wrong state | Check `getState()` before calling lifecycle functions |
| `NotAuthorized(address caller)` | Caller lacks required BIDGES capability | Verify the caller holds the correct capability badge |
| `TokenNotFound(uint256 tokenId)` | Token ID does not exist | Verify the token was minted |
| `TagAlreadyBound(bytes32 tagHash)` | NFC tag is already bound to another asset | Each tag can only be bound once |
| `InvalidSignature()` | Cryptographic signature validation failed | Check the SUN message format and key |
| `Expired(uint256 deadline)` | Operation past its deadline | Generate a new challenge or transaction |

### TAGITAccess Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `MissingCapability(uint256 capId)` | Caller does not hold the required capability badge | Request the badge from an admin |
| `BadgeNotTransferable()` | Attempted to transfer a soulbound badge | Identity badges are non-transferable |
| `RoleNotGrantable(bytes32 role)` | Caller cannot grant this role | Only `ADMIN_ROLE` can grant roles |

### TAGITRecovery Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `RecoveryNotInitiated(uint256 tokenId)` | No active recovery for this token | Call `initiateRecovery()` first |
| `QuarantineActive(uint256 tokenId)` | Asset is in quarantine, cannot transfer | Wait for quarantine resolution |
| `InsufficientApprovals()` | Multi-party threshold not met | Collect more recovery approvals |

### Catching Custom Errors in TypeScript

```typescript
import { BaseError, ContractFunctionRevertedError } from 'viem';

try {
  await walletClient.writeContract({
    address: TAGIT_CORE,
    abi: tagitCoreAbi,
    functionName: 'bindTag',
    args: [tokenId, tagHash],
  });
} catch (err) {
  if (err instanceof BaseError) {
    const revertError = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName;

      switch (errorName) {
        case 'InvalidState':
          console.error('Wrong state:', revertError.data?.args);
          break;
        case 'NotAuthorized':
          console.error('Missing permissions');
          break;
        case 'TagAlreadyBound':
          console.error('Tag is already in use');
          break;
        default:
          console.error('Contract error:', errorName);
      }
    }
  }
}
```

## Contract Addresses

All contracts are deployed on **OP Sepolia** (chain ID `11155420`). See the full [Deployment Reference](../contracts/deployment-reference.md) for addresses, block explorer links, and network configuration.

Key addresses for this guide:

| Contract | Address |
|----------|---------|
| TAGITCore | `0x8bde22da889306d422802728cb98b6da42ed8e1a` |
| TAGITAccess | `0x0611FE60f6E37230bDaf04c5F2Ac2dc9012130a9` |
| TAGITAgentIdentity | `0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D` |

## Related

- [SDK Integration](./sdk-integration.md) — Higher-level SDK usage patterns
- [Smart Contracts Overview](../contracts/index.md) — All 18 contract modules
- [Deployment Reference](../contracts/deployment-reference.md) — Full address list and network info
- [NTAG 424 DNA](../hardware/ntag-424-dna.md) — NFC chip used in `bindTag()`
- [Quickstart](../getting-started/quickstart.md) — 5-minute getting started guide
