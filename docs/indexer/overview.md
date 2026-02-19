---
title: Subgraph Indexer
description: Graph Protocol subgraph for indexing ERC-8004 agent contract events on OP Sepolia
---

# Subgraph Indexer

The **tagit-indexer** is a [Graph Protocol](https://thegraph.com/) subgraph that indexes on-chain events from the 3 ERC-8004 Agent Infrastructure contracts. It feeds the dashboard and the future BD Agent crawler.

**Repo:** [tagit-indexer](https://github.com/TAG-IT-NETWORK/tagit-indexer)

## Indexed Contracts

| Contract | Address (OP Sepolia) | Events |
|----------|---------------------|--------|
| TAGITAgentIdentity | `0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D` | 5 |
| TAGITAgentReputation | `0x57CCa1974DFE29593FBd24fdAEE1cD614Bfd6E4a` | 3 |
| TAGITAgentValidation | `0x9806919185F98Bd07a64F7BC7F264e91939e86b7` | 3 |

Start block: `39774582`

## Entities

| Entity | ID Format | Purpose |
|--------|-----------|---------|
| `Protocol` | `"1"` (singleton) | Global aggregates: totalAgents, totalActiveAgents, totalFeedback, averageRating, validation counts |
| `Agent` | `agentId` | Core agent record + denormalized reputation/validation aggregates |
| `AgentMetadata` | `{agentId}-{key}` | Key-value metadata (upsert on same key) |
| `AgentStatusChange` | `{agentId}-{txHash}-{logIndex}` | Immutable historical status transitions |
| `Feedback` | `feedbackId` | Feedback entry with revoked/response flags |
| `ValidationRequest` | `requestId` | Validation request lifecycle (PENDING → IN_PROGRESS → VALIDATED/REJECTED) |
| `ValidationResponse` | `{requestId}-{validator}` | Immutable individual validator response |

## Events Indexed (11)

### TAGITAgentIdentity
- `AgentRegistered` — new agent registration
- `AgentURIUpdated` — metadata URI change
- `AgentWalletUpdated` — wallet address change
- `AgentMetadataSet` — key-value metadata upsert
- `AgentStatusChanged` — status transitions (INACTIVE → ACTIVE → SUSPENDED → DEREGISTERED)

### TAGITAgentReputation
- `FeedbackGiven` — new feedback with rating
- `FeedbackRevoked` — feedback revocation
- `ResponseAppended` — agent response to feedback

### TAGITAgentValidation
- `ValidationRequested` — new validation request
- `ValidationResponseSubmitted` — validator vote
- `ValidationFinalized` — final result with pass/fail and score

## Sample Queries

### Get agent by ID
```graphql
{
  agent(id: "1") {
    agentId
    wallet
    uri
    statusLabel
    feedbackCount
    averageRating
    isValidated
  }
}
```

### Protocol overview
```graphql
{
  protocol(id: "1") {
    totalAgents
    totalActiveAgents
    totalFeedback
    averageRating
    totalValidationsPassed
  }
}
```

### Active agents with reputation
```graphql
{
  agents(where: { status: 1 }, orderBy: averageRating, orderDirection: desc) {
    agentId
    statusLabel
    feedbackCount
    averageRating
    isValidated
  }
}
```

## Development

```bash
git clone https://github.com/TAG-IT-NETWORK/tagit-indexer
cd tagit-indexer
npm install
npx graph codegen
npx graph build
```

### Deploy to Goldsky
```bash
npx goldsky subgraph deploy tagit-indexer/0.1.0 --path .
```

## Related

- [Agent Infrastructure Contracts](../contracts/index.md#agent-infrastructure-3--erc-8004)
- [Technosphere Architecture](../architecture/technosphere.md)
- [Agent Gateway](../services/agent-gateway.md)
