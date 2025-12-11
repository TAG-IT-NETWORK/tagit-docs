# Data Flow Diagrams

Detailed request and data flows for TAG IT Network operations.

## Asset Verification Flow

```mermaid
sequenceDiagram
    participant User
    participant ORACULAR as ORACULAR App
    participant NFC as NFC Chip
    participant API as API Gateway
    participant Contract as TAGITCore
    participant AI as AI Orchestrator

    User->>ORACULAR: Tap NFC tag
    ORACULAR->>NFC: Read chip ID
    NFC-->>ORACULAR: Chip data + token ID

    ORACULAR->>API: POST /verify/challenge
    API->>Contract: getAsset(tokenId)
    Contract-->>API: Asset state
    API-->>ORACULAR: Challenge + nonce

    ORACULAR->>NFC: Sign challenge
    NFC-->>ORACULAR: Signature

    ORACULAR->>API: POST /verify/submit
    API->>AI: Analyze request
    AI-->>API: Risk score
    API->>Contract: verify(tokenId, sig)
    Contract-->>API: Verification result
    API-->>ORACULAR: Result + metadata

    ORACULAR->>User: Display result
```

## Asset Minting Flow

```mermaid
sequenceDiagram
    participant Mfr as Manufacturer
    participant Dash as Dashboard
    participant API as API Gateway
    participant Core as TAGITCore
    participant Access as TAGITAccess

    Mfr->>Dash: Create asset batch
    Dash->>API: POST /assets/mint
    API->>Access: hasCapability(CAP_MINT)
    Access-->>API: Authorized
    API->>Core: mint(metadata)
    Core-->>API: tokenId
    API-->>Dash: Asset created
    Dash-->>Mfr: Token ID + QR code
```

## Asset Binding Flow

```mermaid
sequenceDiagram
    participant Worker as Factory Worker
    participant App as ORACULAR App
    participant NFC as NFC Chip
    participant API as API Gateway
    participant Core as TAGITCore

    Worker->>App: Scan product QR
    App-->>Worker: Token ID loaded

    Worker->>App: Tap NFC chip
    App->>NFC: Read chip ID
    NFC-->>App: Chip ID + attestation

    App->>API: POST /assets/bind
    API->>Core: bind(tokenId, chipId, sig)
    Core-->>API: Success
    API-->>App: Binding confirmed
    App-->>Worker: Asset bound
```

## Ownership Transfer Flow

```mermaid
sequenceDiagram
    participant Seller
    participant Buyer
    participant App as ORACULAR App
    participant API as API Gateway
    participant Core as TAGITCore

    Seller->>App: Initiate transfer
    App->>API: POST /transfers/initiate
    API->>Core: initiateTransfer(tokenId, buyer)
    Core-->>API: Transfer ID
    API-->>App: Pending transfer

    Buyer->>App: Accept transfer
    App->>API: POST /transfers/accept
    API->>Core: acceptTransfer(transferId)
    Core-->>API: Transfer complete
    API-->>App: Ownership updated
    App-->>Buyer: You now own this asset
```

## AIRP Recovery Flow

```mermaid
sequenceDiagram
    participant Owner
    participant Support as Support Team
    participant API as API Gateway
    participant Recovery as TAGITRecovery
    participant Access as TAGITAccess

    Owner->>Support: Report lost/stolen
    Support->>API: POST /recovery/initiate
    API->>Access: hasCapability(CAP_RECOVERY_INIT)
    Access-->>API: Authorized
    API->>Recovery: initiateRecovery(tokenId)
    Recovery-->>API: Recovery case created

    Note over Recovery: Investigation period

    Support->>API: POST /recovery/resolve
    API->>Access: hasCapability(CAP_RECOVERY_APPROVE)
    Access-->>API: Authorized
    API->>Recovery: resolveRecovery(caseId, decision)
    Recovery-->>API: Resolution applied
    API-->>Support: Case closed
```

## Event Processing Flow

```mermaid
flowchart LR
    subgraph Blockchain
        Contract[Smart Contracts]
    end

    subgraph Indexer
        Graph[Graph Node]
        Goldsky[Goldsky]
    end

    subgraph Services
        EventRouter[Event Router]
        Webhooks[Webhook Delivery]
    end

    subgraph Consumers
        Dashboard[Dashboard]
        Partners[Partner Systems]
    end

    Contract -->|Events| Graph
    Contract -->|Events| Goldsky
    Graph --> EventRouter
    Goldsky --> EventRouter
    EventRouter --> Webhooks
    Webhooks --> Dashboard
    Webhooks --> Partners
```

## Next Steps

- [Architecture Overview](./overview.md) — System components
- [ORACULS Stack](./oraculs-stack.md) — Technology deep dive
- [API Reference](../api/overview.md) — REST API documentation
