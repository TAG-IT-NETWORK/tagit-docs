---
title: Data Flow
description: Transaction and data flow diagrams for TAG IT Network
---

# Data Flow

This document describes how data flows through the TAG IT Network system for key operations.

## Asset Lifecycle Flow

```mermaid
stateDiagram-v2
    [*] --> MINTED
    MINTED --> BOUND: bind()
    BOUND --> ACTIVATED: verify() first time
    ACTIVATED --> CLAIMED: transfer()
    CLAIMED --> RECYCLED: recycle()
    BOUND --> FLAGGED: flag()
    ACTIVATED --> FLAGGED: flag()
    CLAIMED --> FLAGGED: flag()
    FLAGGED --> ACTIVATED: resolve() - cleared
    FLAGGED --> RECYCLED: resolve() - decommission
```

## 1. Minting Flow

Creating a new Digital Twin NFT.

```mermaid
sequenceDiagram
    participant Brand
    participant API as API Gateway
    participant L2 as TAGIT L2
    participant Core as TAGITCore
    participant Indexer

    Brand->>API: POST /assets/mint
    API->>API: Validate API Key
    API->>L2: Submit mint tx
    L2->>Core: mint(metadata)
    Core->>Core: Create NFT
    Core-->>L2: AssetMinted event
    L2-->>Indexer: Index event
    Indexer-->>API: Confirm indexed
    API-->>Brand: { tokenId, txHash }
```

### Request

```json
POST /api/v1/assets/mint
{
  "metadata": {
    "name": "Product XYZ",
    "sku": "SKU-12345",
    "manufacturer": "Brand Co",
    "manufactureDate": "2025-01-15"
  }
}
```

### Response

```json
{
  "tokenId": "12345",
  "txHash": "0x...",
  "state": "MINTED",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

## 2. Binding Flow

Linking a physical NFC chip to a Digital Twin.

```mermaid
sequenceDiagram
    participant Factory
    participant NFC as NFC Chip
    participant API as API Gateway
    participant L2 as TAGIT L2
    participant Core as TAGITCore

    Factory->>NFC: Read chip ID
    NFC-->>Factory: chipId
    Factory->>API: POST /assets/{id}/bind
    API->>L2: Submit bind tx
    L2->>Core: bind(tokenId, chipId, signature)
    Core->>Core: Verify signature
    Core->>Core: Store binding
    Core-->>L2: AssetBound event
    L2-->>API: Tx confirmed
    API-->>Factory: { bound: true }
```

### Binding Signature

```solidity
// Generate binding signature
const message = ethers.solidityPackedKeccak256(
    ["uint256", "bytes32", "uint256"],
    [tokenId, chipId, nonce]
);
const signature = await signer.signMessage(ethers.getBytes(message));
```

## 3. Verification Flow

Authenticating an asset via NFC scan.

```mermaid
sequenceDiagram
    participant User
    participant App as ORACULAR App
    participant NFC as NFC Chip
    participant API as Verification Service
    participant L2 as TAGIT L2
    participant Core as TAGITCore

    User->>App: Scan product
    App->>NFC: Read chip ID
    NFC-->>App: chipId
    App->>API: GET /verify/challenge/{chipId}
    API-->>App: { challenge }
    App->>NFC: Send challenge
    NFC->>NFC: Compute response
    NFC-->>App: { response }
    App->>API: POST /verify
    API->>L2: Call verify()
    L2->>Core: verify(chipId, challenge, response)
    Core->>Core: Validate response
    Core-->>L2: AssetVerified event
    L2-->>API: Verification result
    API-->>App: { verified: true, asset: {...} }
    App-->>User: Authentic!
```

### Challenge-Response Protocol

```
1. App requests challenge from API
2. API generates random challenge (32 bytes)
3. App sends challenge to NFC chip
4. Chip computes: response = HMAC(chipSecret, challenge)
5. App sends response to API
6. Contract verifies response against stored binding
```

## 4. Transfer Flow

Transferring ownership of an asset.

```mermaid
sequenceDiagram
    participant Seller
    participant Buyer
    participant App as ORACULAR App
    participant L2 as TAGIT L2
    participant Core as TAGITCore

    Seller->>App: Initiate transfer
    App->>L2: initiateTransfer(tokenId, buyerAddress)
    L2->>Core: Create pending transfer
    Core-->>L2: TransferInitiated event
    Buyer->>App: Accept transfer
    App->>L2: acceptTransfer(tokenId)
    L2->>Core: Complete transfer
    Core->>Core: Update ownership
    Core-->>L2: Transfer event
    L2-->>App: Transfer complete
    App-->>Buyer: You now own this asset
```

## 5. Flagging Flow

Flagging an asset for fraud/dispute.

```mermaid
sequenceDiagram
    participant Operator
    participant API as API Gateway
    participant L2 as TAGIT L2
    participant Core as TAGITCore
    participant Recovery as TAGITRecovery

    Operator->>API: POST /assets/{id}/flag
    API->>API: Verify FLAGGING_ROLE
    API->>L2: Submit flag tx
    L2->>Core: flag(tokenId, reason)
    Core->>Core: Set state = FLAGGED
    Core->>Recovery: initiateRecovery(tokenId)
    Recovery-->>L2: AssetFlagged event
    L2-->>API: Tx confirmed
    API-->>Operator: { flagged: true }
```

## Event Types

| Event | Emitted By | Data |
|-------|------------|------|
| `AssetMinted` | TAGITCore | tokenId, metadata, timestamp |
| `AssetBound` | TAGITCore | tokenId, chipId, timestamp |
| `AssetVerified` | TAGITCore | tokenId, verifier, result, timestamp |
| `AssetTransferred` | TAGITCore | tokenId, from, to, timestamp |
| `AssetFlagged` | TAGITCore | tokenId, reason, flaggedBy, timestamp |
| `AssetRecycled` | TAGITCore | tokenId, recycledBy, timestamp |

## Related

- [Architecture Overview](./overview.md)
- [TAGITCore Contract](../contracts/tagit-core.md)
- [API Reference](../api/overview.md)
