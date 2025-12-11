# Transfer Ownership Example

This example demonstrates how to transfer asset ownership from one party to another.

## Overview

Ownership transfer moves the Digital Twin from the current owner to a new owner:

1. **Initiate Transfer** — Current owner starts the transfer
2. **Accept Transfer** — New owner accepts (optional, based on config)
3. **Complete Transfer** — Ownership is updated on-chain

## Prerequisites

- Node.js 18+
- TAG IT API key
- An asset token ID in ACTIVATED or CLAIMED state
- Recipient wallet address

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

### 1. Check Asset State

```typescript
const asset = await tagit.assets.get(tokenId);

if (asset.state !== 'ACTIVATED' && asset.state !== 'CLAIMED') {
  throw new Error('Asset must be ACTIVATED or CLAIMED to transfer');
}
```

### 2. Initiate Transfer

```typescript
const transfer = await tagit.transfers.initiate({
  tokenId,
  to: recipientAddress,
  message: 'Transferring ownership'
});
```

### 3. Accept Transfer (if required)

```typescript
// As the recipient
await tagit.transfers.accept(transfer.transferId);
```

### 4. Verify Transfer

```typescript
const updatedAsset = await tagit.assets.get(tokenId);
console.log('New owner:', updatedAsset.owner);
console.log('State:', updatedAsset.state); // CLAIMED
```

## Expected Output

```
Checking asset state...
  Token ID: 123
  Current State: ACTIVATED
  Current Owner: 0x123...

Initiating transfer to 0x456...
  Transfer ID: xfr_abc123
  Status: PENDING

Accepting transfer...
  Status: COMPLETED
  Transaction: 0xdef...

Transfer complete!
  New Owner: 0x456...
  State: CLAIMED
```

## Transfer Types

| Type | Description |
|------|-------------|
| **Direct** | Immediate transfer, no acceptance needed |
| **Pending** | Requires recipient acceptance |
| **Escrow** | Held in escrow until conditions met |

## Error Cases

| Error | Description |
|-------|-------------|
| `ASSET_FLAGGED` | Cannot transfer flagged assets |
| `NOT_OWNER` | Caller is not the current owner |
| `INVALID_RECIPIENT` | Recipient address is invalid |
| `TRANSFER_EXPIRED` | Pending transfer expired |

## Next Steps

- [Mint and Bind Example](../mint-and-bind/) — Create new assets
- [Verify Asset Example](../verify-asset/) — Verify assets
- [SDK Documentation](../../docs/sdk/javascript.md) — Full SDK reference
