---
title: Technosphere
description: ERC-8004 AI Agent Infrastructure — trustless on-chain agent identity, reputation, and validation
---

# Technosphere

TAG IT's **Technosphere** is an AI agent infrastructure layer built on the **ERC-8004** standard. It enables AI agents to operate as first-class on-chain citizens with verifiable identity, trackable reputation, and multi-party validation.

## Vision

Traditional AI agents operate as opaque black boxes — users must trust the operator, not the agent. Technosphere changes this by anchoring agent identity, performance history, and validation proofs directly on-chain.

Every AI agent in the TAG IT ecosystem:

- **Has a soulbound identity** — an ERC-721 NFT that cannot be transferred, sold, or duplicated
- **Earns reputation on-chain** — verifiable feedback with time-weighted scoring
- **Passes multi-party validation** — defense-grade agents require 3-of-5 consensus

## ERC-8004 Standard

ERC-8004 defines three pillars for trustless agent infrastructure:

```mermaid
flowchart LR
    subgraph "ERC-8004: Trustless Agents"
        A["Identity\n(ERC-721 Soulbound)"]
        B["Reputation\n(Feedback Registry)"]
        C["Validation\n(Proof Verification)"]
    end

    A --> B
    A --> C
    B -.->|"informs"| C
```

| Pillar | Contract | Purpose |
|--------|----------|---------|
| **Identity** | [TAGITAgentIdentity](../contracts/agent-identity.md) | Soulbound ERC-721 agent registry with EIP-712 wallet verification |
| **Reputation** | [TAGITAgentReputation](../contracts/agent-reputation.md) | Feedback system with time-weighted scoring (90-day decay) |
| **Validation** | [TAGITAgentValidation](../contracts/agent-validation.md) | Multi-party proof verification with 3-of-5 consensus |

## Integration with BIDGES

Technosphere leverages the existing [BIDGES access control](../contracts/tagit-access.md) system:

```mermaid
flowchart TB
    subgraph "BIDGES Access Control"
        IB[IdentityBadge\nKYC_L1 Soulbound]
        CB[CapabilityBadge\nAGENT_VALIDATOR]
    end

    subgraph "Technosphere"
        AI[AgentIdentity]
        AR[AgentReputation]
        AV[AgentValidation]
    end

    IB -->|"required to register"| AI
    IB -->|"required to give feedback"| AR
    IB -->|"required to request"| AV
    CB -->|"required to validate"| AV
    AI -->|"identity registry"| AR
    AI -->|"identity registry"| AV
```

| Action | Required Badge |
|--------|---------------|
| Register an agent | KYC_L1 identity badge |
| Give feedback | KYC_L1 identity badge |
| Request validation | KYC_L1 identity badge |
| Submit validation response | AGENT_VALIDATOR capability badge |

**Defense Guard**: Addresses holding a `GOV_MIL` capability badge are blocked from registering agents. This prevents military/government clearance holders from creating autonomous agents without additional authorization.

## Agent Lifecycle

Each registered agent progresses through a defined status lifecycle:

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: register()
    ACTIVE --> SUSPENDED: suspendAgent()\n[owner only]
    SUSPENDED --> ACTIVE: reactivateAgent()\n[owner only]
    ACTIVE --> DECOMMISSIONED: decommissionAgent()\n[registrant]
    SUSPENDED --> DECOMMISSIONED: decommissionAgent()\n[registrant]
    DECOMMISSIONED --> [*]
```

| Status | Description | Can Receive Feedback | Can Be Validated |
|--------|-------------|---------------------|-----------------|
| **ACTIVE** | Operating normally | Yes | Yes |
| **SUSPENDED** | Temporarily disabled by owner | No | No |
| **DECOMMISSIONED** | Permanently retired (irreversible) | No | No |

### Registration Flow

```mermaid
sequenceDiagram
    participant R as Registrant
    participant AC as TAGITAccess
    participant AI as AgentIdentity

    R->>AC: Check KYC_L1 badge
    AC-->>R: Badge confirmed
    R->>AC: Check NOT GOV_MIL
    AC-->>R: Defense guard clear
    R->>AI: register(wallet, uri)
    AI->>AI: Mint soulbound ERC-721
    AI->>AI: Store agent data
    AI-->>R: Agent ID (e.g., 1)
    R->>AI: setMetadata(id, "name", "Sage")
    R->>AI: setMetadata(id, "model", "claude-opus-4-6")
```

### Soulbound Enforcement

Agent identity tokens are **non-transferable** (soulbound). The `_update()` function override blocks all transfers while allowing minting. This ensures:

- Agent identity cannot be sold or traded
- No agent impersonation via token transfer
- Decommissioning is the only way to retire an agent

### EIP-712 Wallet Verification

When updating an agent's operational wallet, EIP-712 typed data signatures prevent unauthorized wallet binding:

1. Registrant calls `setAgentWallet(agentId, newWallet, signature)`
2. Contract verifies the signature was produced by `newWallet`
3. Nonce increments to prevent replay attacks
4. Old wallet is freed for reuse

## Reputation Scoring

The reputation system uses **time-weighted scoring** to ensure recent feedback matters more than old feedback.

### Scoring Formula

```
weight = DECAY_PERIOD / (DECAY_PERIOD + age)
```

Where:
- `DECAY_PERIOD` = 90 days
- `age` = time since feedback was given (in seconds)
- Scores are scaled by 100 for precision (e.g., 450 = 4.50 stars)

### Decay Curve

| Feedback Age | Weight | Contribution |
|-------------|--------|-------------|
| Same day | ~100% | Full weight |
| 30 days | ~75% | Strong influence |
| 90 days | ~50% | Half weight |
| 180 days | ~33% | Diminished |
| 1 year | ~20% | Minimal |

### Anti-Sybil Protections

- **KYC_L1 required** — Only verified identities can leave feedback
- **Anti-self-review** — Registrants and agent wallets cannot rate their own agents
- **One review per user per agent** — Must revoke before re-reviewing

## Validation Flow

Validation proves an agent meets quality standards through independent review.

### Standard vs Defense-Grade

| Mode | Quorum | Use Case |
|------|--------|----------|
| **Standard** | 1-of-1 | General-purpose agents |
| **Defense** | 3-of-5 | Military, government, critical infrastructure |

### Validation Process

```mermaid
sequenceDiagram
    participant R as Requester
    participant AV as AgentValidation
    participant V1 as Validator 1
    participant V2 as Validator 2
    participant V3 as Validator 3

    R->>AV: validationRequest(agentId, isDefense=true)
    AV-->>R: requestId

    par Validators respond independently
        V1->>AV: validationResponse(requestId, 85, "Meets standards")
        V2->>AV: validationResponse(requestId, 72, "Adequate performance")
        V3->>AV: validationResponse(requestId, 90, "Excellent accuracy")
    end

    AV->>AV: Quorum met (3-of-5)
    AV->>AV: _finalize(): avg=82, >= 60 threshold
    AV-->>R: ValidationFinalized(passed=true, score=82)
```

### Scoring & Finalization

- Validators submit scores from **0 to 100**
- Passing threshold: **60** (average of all responses)
- Requests expire after **30 days** if quorum is not met
- Validator accuracy is tracked — scores aligned with final outcome count as "accurate"

## Deployed Contracts

### OP Sepolia (Testnet) — Chain ID: 11155420

| Contract | Address | Status |
|----------|---------|--------|
| TAGITAgentIdentity | `0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D` | Verified |
| TAGITAgentReputation | `0x57CCa1974DFE29593FBD24fdAEE1cD614Bfd6E4a` | Verified |
| TAGITAgentValidation | `0x9806919185F98Bd07a64F7BC7F264e91939e86b7` | Verified |

### Sage — Agent #1

The first registered agent in the Technosphere:

| Property | Value |
|----------|-------|
| Agent ID | 1 |
| Name | Sage |
| Type | Analysis |
| Model | claude-opus-4-6 |
| Wallet | `0xDb8ACD440Ef32a4D23AD685Dd64aC386b0d3d63F` |
| Status | Active |

## Related

- [TAGITAgentIdentity](../contracts/agent-identity.md) — Agent registry contract reference
- [TAGITAgentReputation](../contracts/agent-reputation.md) — Reputation contract reference
- [TAGITAgentValidation](../contracts/agent-validation.md) — Validation contract reference
- [TAGITAccess / BIDGES](../contracts/tagit-access.md) — Access control system
- [Architecture Overview](./overview.md) — System architecture
