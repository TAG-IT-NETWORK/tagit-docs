# wTAG & Voucher Subgraph Schema

Developer reference for the `TAGITToken` (wTAG) and `VerificationEscrow` (Voucher) data sources in the [tagit-indexer](https://github.com/TAG-IT-NETWORK/tagit-indexer) subgraph.

> **See also:**
> [Notion Wiki](https://www.notion.so/3324e3e9a2d3812a8b51dc25fc42a78b) ·
> [tagit-docs MDX](https://github.com/TAG-IT-NETWORK/tagit-docs/pull/4) ·
> [tagit-indexer PR #1](https://github.com/TAG-IT-NETWORK/tagit-indexer/pull/1)

---

## Overview

This PR extends the tagit-indexer subgraph with 2 new data sources and 10 new GraphQL entities, preserving all 3 existing Agent data sources unchanged.

| Data Source | Contract | Events | Network |
|-------------|----------|--------|---------|
| `TAGITToken` (wTAG) | TAGITToken ERC-20 UUPS | 6 | OP Sepolia, Arbitrum |
| `VerificationEscrow` | Voucher escrow | 4 | OP Sepolia, Arbitrum |
| `TAGITAgentIdentity` | Agent Identity | 5 | _(unchanged)_ |
| `TAGITAgentReputation` | Agent Reputation | 3 | _(unchanged)_ |
| `TAGITAgentValidation` | Agent Validation | 3 | _(unchanged)_ |

> **Note:** TAGITToken and VerificationEscrow addresses are currently `0x0000…0000` — update `subgraph.yaml` and `networks.json` after deployment.

---

## GraphQL Entities

### Protocol (extended)

```graphql
type Protocol @entity {
  id: ID!                          # always "1"

  # existing Agent aggregates
  totalAgents: Int!
  totalActiveAgents: Int!
  totalFeedback: Int!
  averageRating: BigDecimal!
  totalValidationRequests: Int!
  totalValidationsPassed: Int!
  totalValidationsFailed: Int!

  # NEW — wTAG aggregates
  wtagTotalSupply: BigInt!
  wtagTotalTransfers: Int!
  wtagTotalBurned: BigInt!

  # NEW — Voucher (escrow) aggregates
  totalEscrows: Int!
  totalEscrowsReleased: Int!
  totalEscrowsCancelled: Int!
  totalEscrowVolume: BigInt!
}
```

---

### wTAG Entities

#### `WTagAccount`
```graphql
type WTagAccount @entity {
  id: ID!                   # hex address
  address: Bytes!
  balance: BigInt!
  transfersSent: Int!
  transfersReceived: Int!
  transfersFrom: [WTagTransfer!]! @derivedFrom(field: "from")
  transfersTo:   [WTagTransfer!]! @derivedFrom(field: "to")
  approvals:     [WTagApproval!]! @derivedFrom(field: "owner")
}
```

#### `WTagTransfer` _(immutable)_
```graphql
type WTagTransfer @entity(immutable: true) {
  id: ID!               # {txHash}-{logIndex}
  from: WTagAccount!
  to: WTagAccount!
  value: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

#### `WTagApproval` _(immutable)_
```graphql
type WTagApproval @entity(immutable: true) {
  id: ID!
  owner: WTagAccount!
  spender: Bytes!
  value: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

#### `WTagMint` _(immutable)_
```graphql
type WTagMint @entity(immutable: true) {
  id: ID!
  to: WTagAccount!
  amount: BigInt!
  totalSupplyAfter: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

#### `WTagBurn` _(immutable)_
```graphql
type WTagBurn @entity(immutable: true) {
  id: ID!
  from: WTagAccount!
  amount: BigInt!
  totalSupplyAfter: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

#### `WTagEmissionsConfig` _(immutable)_
```graphql
type WTagEmissionsConfig @entity(immutable: true) {
  id: ID!
  emissions: Bytes!
  setter: Bytes!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

#### `WTagUpgrade` _(immutable)_
```graphql
type WTagUpgrade @entity(immutable: true) {
  id: ID!
  newImplementation: Bytes!
  version: String!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

---

### Voucher Entities

#### `Escrow` _(mutable)_

Tracks lifecycle states: `CREATED` → `RELEASED` or `CANCELLED`

```graphql
type Escrow @entity {
  id: ID!               # escrowId as string
  escrowId: BigInt!
  assetId: BigInt!
  buyer: Bytes!
  seller: Bytes!
  amount: BigInt!
  status: String!       # "CREATED" | "RELEASED" | "CANCELLED"
  createdAt: BigInt!
  createdAtBlock: BigInt!
  releasedAt: BigInt    # null until released
  cancelledAt: BigInt   # null until cancelled
  oracle: Bytes         # null until oracle set
  transactionHash: Bytes!
}
```

#### `EscrowCreated` _(immutable)_
```graphql
type EscrowCreated @entity(immutable: true) {
  id: ID!
  escrow: Escrow!
  assetId: BigInt!
  buyer: Bytes!
  seller: Bytes!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

#### `EscrowReleased` _(immutable)_
```graphql
type EscrowReleased @entity(immutable: true) {
  id: ID!
  escrow: Escrow!
  assetId: BigInt!
  seller: Bytes!
  amount: BigInt!
  oracle: Bytes!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

#### `EscrowCancelled` _(immutable)_
```graphql
type EscrowCancelled @entity(immutable: true) {
  id: ID!
  escrow: Escrow!
  assetId: BigInt!
  buyer: Bytes!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

#### `OracleUpdate` _(immutable)_
```graphql
type OracleUpdate @entity(immutable: true) {
  id: ID!
  previousOracle: Bytes!
  newOracle: Bytes!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}
```

---

## Event Handlers

### `src/handlers/wtag.ts`

| Handler | Event Signature | Entity Written |
|---------|----------------|----------------|
| `handleTransfer` | `Transfer(address indexed from, address indexed to, uint256 value)` | `WTagAccount` (×2), `WTagTransfer`, `Protocol.wtagTotalTransfers` |
| `handleApproval` | `Approval(address indexed owner, address indexed spender, uint256 value)` | `WTagApproval` |
| `handleTokensMinted` | `TokensMinted(address indexed to, uint256 amount, uint256 totalSupply)` | `WTagMint`, `WTagAccount`, `Protocol.wtagTotalSupply` |
| `handleTokensBurned` | `TokensBurned(address indexed from, uint256 amount, uint256 totalSupply)` | `WTagBurn`, `WTagAccount`, `Protocol.wtagTotalSupply`, `Protocol.wtagTotalBurned` |
| `handleEmissionsAddressSet` | `EmissionsAddressSet(address indexed emissions, address indexed setter)` | `WTagEmissionsConfig` |
| `handleContractUpgraded` | `ContractUpgraded(address indexed newImpl, string version)` | `WTagUpgrade` |

> **Known issue (medium):** `wtagTotalTransfers` increments on ALL `Transfer` events, including mint and burn. This is intentional but verify against dashboard consumer requirements.

### `src/handlers/voucher.ts`

| Handler | Event Signature | Action |
|---------|----------------|--------|
| `handleEscrowCreated` | `EscrowCreated(uint256 indexed escrowId, uint256 indexed assetId, address buyer, address seller, uint256 amount)` | Creates `Escrow` (status `CREATED`), writes `EscrowCreated`, increments `Protocol.totalEscrows` + `totalEscrowVolume` |
| `handleEscrowReleased` | `EscrowReleased(uint256 indexed escrowId, uint256 indexed assetId, address seller, uint256 amount, address oracle)` | Updates `Escrow` → `RELEASED`, writes `EscrowReleased`, increments `Protocol.totalEscrowsReleased` |
| `handleEscrowCancelled` | `EscrowCancelled(uint256 indexed escrowId, uint256 indexed assetId, address buyer, uint256 amount)` | Updates `Escrow` → `CANCELLED`, writes `EscrowCancelled`, increments `Protocol.totalEscrowsCancelled` |
| `handleTrustedOracleUpdated` | `TrustedOracleUpdated(address indexed previousOracle, address indexed newOracle)` | Writes `OracleUpdate` |

---

## Escrow Lifecycle Diagram

```
EscrowCreated → [status: CREATED]
                      │
          ┌───────────┴───────────┐
          │                       │
   EscrowReleased          EscrowCancelled
   [status: RELEASED]      [status: CANCELLED]
   (oracle verified,        (buyer refunded)
    funds → seller)
```

---

## Sample Queries

### wTAG top holders

```graphql
{
  wTagAccounts(orderBy: balance, orderDirection: desc, first: 10) {
    address
    balance
    transfersSent
    transfersReceived
  }
}
```

### wTAG supply stats

```graphql
{
  protocol(id: "1") {
    wtagTotalSupply
    wtagTotalTransfers
    wtagTotalBurned
  }
}
```

### Open escrows

```graphql
{
  escrows(where: { status: "CREATED" }) {
    escrowId
    assetId
    buyer
    seller
    amount
    createdAt
  }
}
```

### Escrow history for an asset

```graphql
{
  escrows(where: { assetId: "42" }) {
    escrowId
    status
    createdAt
    releasedAt
    cancelledAt
    oracle
  }
}
```

---

## Deployment

```bash
# Codegen (must produce 5 WASM modules)
graph codegen

# Build
graph build

# Deploy to Goldsky
goldsky subgraph deploy tagit-indexer/v2 --path .
```

**Before deploying**, replace placeholder `0x0000…0000` addresses in:
- `subgraph.yaml` — `dataSources[*].source.address`
- `networks.json` — `optimism-sepolia` and `arbitrum-one` entries

---

## Known Issues / Pending

| Severity | Location | Issue |
|----------|---------|-------|
| Medium | `wtag.ts:76` | `wtagTotalTransfers` includes mint/burn events — clarify with consumer |
| Medium | `wtag.test.ts` | Tests absent — add for Linux CI (Matchstick) |
| Medium | `voucher.test.ts` | Escrow lifecycle transitions untested |
| Low | `voucher.ts:58` | Silent null return on missing escrow may understate counters on reorg |
| Low | `networks.json:3` | Placeholder `0x0` addresses — add CI guard before deploy |
| Low | `subgraph.yaml:14` | Shared `startBlock` may cause extra re-indexing — update post-deploy |
