# ORACULS Stack

Deep dive into the Oracle-Augmented Chain for Universal Logistics Security.

## What is ORACULS?

ORACULS (Oracle-Augmented Chain for Universal Logistics Security) is the full technology stack powering TAG IT Network. It combines:

- **On-chain state** — Asset ownership, lifecycle, permissions
- **Off-chain compute** — AI fraud detection, event processing
- **Cross-chain interop** — Multi-network asset tracking
- **Hardware security** — NFC chips with cryptographic attestation

## Stack Layers

### Layer 1: Hardware

```
┌─────────────────────────────────────────────────────────┐
│                    HARDWARE LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   NFC Tags   │  │   PQC Chips  │  │   Readers    │   │
│  │  (NXP DNA)   │  │   (Future)   │  │  (Mobile)    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

- **NFC Tags**: NXP DNA chips with secure element
- **PQC Chips**: Post-quantum ready (future roadmap)
- **Readers**: Mobile NFC, industrial scanners

### Layer 2: Smart Contracts

```
┌─────────────────────────────────────────────────────────┐
│                  SMART CONTRACT LAYER                    │
│  ┌─────────────────────────────────────────────────────┐│
│  │                    TAGITCore                         ││
│  │            Asset NFTs + Lifecycle + Verify           ││
│  └─────────────────────────────────────────────────────┘│
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │TAGITAccess │  │TAGITRecov. │  │   TAGITPrograms    │ │
│  │  BIDGES    │  │    AIRP    │  │ Rewards/Customs    │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│  ┌────────────────────────┐  ┌────────────────────────┐ │
│  │     TAGITGovernor      │  │     TAGITTreasury     │ │
│  │    Multi-house DAO     │  │    Protocol Funds     │ │
│  └────────────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Layer 3: Rollup Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                   ROLLUP LAYER                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │                   TAGIT L2                           ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐    ││
│  │  │ Sequencer │  │  Batcher  │  │   Proposer    │    ││
│  │  └───────────┘  └───────────┘  └───────────────┘    ││
│  │  ┌─────────────────────────────────────────────┐    ││
│  │  │              EigenDA (Data Availability)     │    ││
│  │  └─────────────────────────────────────────────┘    ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

- **OP Stack**: Optimism-based rollup architecture
- **EigenDA**: Data availability layer for cost efficiency
- **7-day Finality**: Challenge period for fraud proofs

### Layer 4: Cross-Chain

```
┌─────────────────────────────────────────────────────────┐
│                  INTEROP LAYER                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │                 Chainlink CCIP                       ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐    ││
│  │  │  Message  │  │   Token   │  │   Programmable│    ││
│  │  │  Passing  │  │ Transfers │  │   Transfers   │    ││
│  │  └───────────┘  └───────────┘  └───────────────┘    ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## Security Model

### Multi-Signal Verification

Every verification requires 5+ signals:

1. **NFC Challenge-Response** — Hardware attestation
2. **On-chain State** — Asset not FLAGGED
3. **Timestamp Bounds** — Within valid window
4. **Geographic Check** — Location plausibility
5. **Behavioral Analysis** — AI fraud detection

### Zero-Trust Architecture

- All roles verified via BIDGES badges
- Capability-based access control
- Timelocked admin actions
- Multi-sig for critical operations

## Performance Targets

| Metric | Target |
|--------|--------|
| Verification latency | < 2 seconds |
| Transaction throughput | 1000+ TPS |
| Data availability | 99.99% uptime |
| Challenge window | 7 days |

## Next Steps

- [Architecture Overview](./overview.md) — High-level system design
- [Data Flow](./data-flow.md) — Request flows
- [Smart Contracts](../contracts/index.md) — Contract documentation
