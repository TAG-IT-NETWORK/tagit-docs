# Architecture Overview

High-level architecture of the TAG IT Network platform.

## System Overview

TAG IT Network is a Web3 supply-chain authentication platform that creates verifiable links between physical assets and their on-chain Digital Twins.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   ORACULAR   │  │   Dashboard  │  │  Partner     │  │    CLI      │  │
│  │  Mobile App  │  │   Console    │  │    APIs      │  │   Tools     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│                            GATEWAY LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                      tagit-services                                 ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ ││
│  │  │   Auth   │  │   API    │  │  Event   │  │   AI Orchestrator    │ ││
│  │  │ Service  │  │ Gateway  │  │  Router  │  │   (Fraud Detection)  │ ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│                            LEDGER LAYER                                 │
│  ┌─────────────────────┐  ┌────────────────────────────────────────────┐│
│  │      TAGIT L2       │  │               Smart Contracts              ││
│  │    (OP Stack)       │  │  ┌────────┐ ┌────────┐ ┌────────┐          ││
│  │  ┌───────────────┐  │  │  │ Core   │ │ Access │ │Recovery│          ││
│  │  │   Sequencer   │  │  │  └────────┘ └────────┘ └────────┘          ││
│  │  │   EigenDA     │  │  │  ┌────────┐ ┌────────┐ ┌────────┐          ││
│  │  └───────────────┘  │  │  │Governor│ │Treasury│ │Programs│          ││
│  └─────────────────────┘  │  └────────┘ └────────┘ └────────┘          ││
│                           └────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│                          SETTLEMENT LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                         Ethereum L1                                 ││
│  │              Escrow │ Timelocks │ Bridge Anchors                    ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│                          INTEROP LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                       Chainlink CCIP                                ││
│  │              Cross-chain messaging │ Token transfers                ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### Application Layer

| Component | Purpose |
|-----------|---------|
| **ORACULAR** | Mobile app for NFC scanning and verification |
| **Dashboard** | Admin console for managing assets and roles |
| **Partner APIs** | Integration endpoints for enterprise partners |
| **CLI Tools** | Developer tools for testing and deployment |

### Gateway Layer

| Component | Purpose |
|-----------|---------|
| **Auth Service** | JWT/API key authentication, BIDGES integration |
| **API Gateway** | Request routing, rate limiting, caching |
| **Event Router** | Webhook delivery, event subscriptions |
| **AI Orchestrator** | Fraud detection, anomaly analysis |

### Ledger Layer

| Component | Purpose |
|-----------|---------|
| **TAGIT L2** | OP Stack rollup with EigenDA for data availability |
| **Smart Contracts** | 6 core modules (see [Contracts](../contracts/index.md)) |

### Settlement Layer

| Component | Purpose |
|-----------|---------|
| **Ethereum L1** | Final settlement, high-value escrow |
| **Bridge Anchors** | Cross-chain state roots |

## Data Flow

See [Data Flow Diagrams](./data-flow.md) for detailed request flows.

## Next Steps

- [ORACULS Stack](./oraculs-stack.md) — Deep dive into the technology stack
- [Data Flow](./data-flow.md) — Request/response flows
- [Smart Contracts](../contracts/index.md) — Contract architecture
