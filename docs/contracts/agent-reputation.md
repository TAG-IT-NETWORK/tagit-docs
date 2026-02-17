---
title: TAGITAgentReputation
description: ERC-8004 agent reputation — feedback registry with time-weighted scoring
---

# TAGITAgentReputation

Feedback and reputation scoring system for AI agents. Part of the [Technosphere](../architecture/technosphere.md) ERC-8004 infrastructure.

## Contract Address

| Network | Address | Status |
|---------|---------|--------|
| OP Sepolia | `0x57CCa1974DFE29593FBD24fdAEE1cD614Bfd6E4a` | Verified |
| OP Mainnet | TBD | Pending |

## Overview

TAGITAgentReputation enables on-chain feedback for registered AI agents. Users with KYC_L1 identity badges can submit 1-5 star ratings with comments. Scores are computed using a time-weighted algorithm where recent feedback carries more weight. Anti-self-review and one-review-per-user protections prevent manipulation.

## Contract Details

| Property | Value |
|----------|-------|
| **Standard** | Custom (Feedback Registry) |
| **Inherits** | Ownable, Pausable, ReentrancyGuard |
| **License** | MIT |
| **Solidity** | ^0.8.20 |

## Scoring Algorithm

### Time-Weighted Formula

Each feedback entry's influence decays over time:

```
weight = DECAY_PERIOD * 100 / (DECAY_PERIOD + age)
```

The final weighted score is the weighted average of all active (non-revoked) ratings, scaled by 100 for precision.

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `DECAY_PERIOD` | 90 days | Half-life for weight decay |
| `MIN_RATING` | 1 | Minimum star rating |
| `MAX_RATING` | 5 | Maximum star rating |
| `MAX_COMMENT_LENGTH` | 1024 bytes | Comment size limit |
| `MAX_RESPONSE_LENGTH` | 512 bytes | Agent response size limit |

### Decay Curve

| Feedback Age | Approximate Weight |
|-------------|-------------------|
| Same day | ~100% |
| 30 days | ~75% |
| 90 days | ~50% |
| 180 days | ~33% |
| 1 year | ~20% |

### Score Precision

All scores are scaled by **100** for integer precision:
- A raw average of 4.50 stars is returned as `450`
- A weighted score of 3.75 is returned as `375`

## Data Structures

### Feedback

```solidity
struct Feedback {
    address reviewer;     // Address that gave feedback
    uint256 agentId;      // Agent being reviewed
    uint8   rating;       // 1-5 star rating
    string  comment;      // Feedback text
    string  response;     // Agent's response (if any)
    uint64  timestamp;    // When feedback was given
    bool    revoked;      // Whether feedback has been revoked
}
```

### ReputationSummary

```solidity
struct ReputationSummary {
    uint256 totalFeedback;    // Total feedback received (including revoked)
    uint256 activeFeedback;   // Non-revoked feedback count
    uint256 averageRating;    // Simple average (scaled by 100)
    uint256 weightedScore;    // Time-weighted score (scaled by 100)
    uint64  lastFeedbackAt;   // Timestamp of most recent feedback
}
```

## Functions

### giveFeedback

Submits feedback for a registered agent.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `agentId` | `uint256` | Agent to review |
| `rating` | `uint8` | Star rating (1-5) |
| `comment` | `string` | Feedback text (max 1024 bytes) |

#### Returns

| Type | Description |
|------|-------------|
| `uint256` | The new feedback ID |

#### Access Control

- Requires **KYC_L1** identity badge
- Agent must be **ACTIVE**
- Reviewer cannot be the agent's registrant or wallet (anti-self-review)
- One feedback per reviewer per agent (must revoke before re-reviewing)

#### Solidity

```solidity
function giveFeedback(
    uint256 agentId,
    uint8 rating,
    string calldata comment
) external returns (uint256);
```

#### SDK Example

```typescript
const feedbackId = await agentReputation.giveFeedback(
    agentId,
    5,           // 5-star rating
    "Excellent analysis accuracy and response time"
);
```

---

### revokeFeedback

Revokes previously submitted feedback. Only the original reviewer can revoke.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `feedbackId` | `uint256` | Feedback ID to revoke |

#### Access Control

Only the original reviewer. Feedback must not already be revoked.

#### Solidity

```solidity
function revokeFeedback(uint256 feedbackId) external;
```

#### SDK Example

```typescript
await agentReputation.revokeFeedback(feedbackId);
// Reviewer can now submit new feedback for the same agent
```

---

### appendResponse

Allows the agent's registrant to respond to feedback.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `feedbackId` | `uint256` | Feedback ID to respond to |
| `responseText` | `string` | Response text (max 512 bytes) |

#### Access Control

- Only the agent's registrant (verified via identity registry)
- Feedback must not already have a response
- Feedback must not be revoked

#### Solidity

```solidity
function appendResponse(uint256 feedbackId, string calldata responseText) external;
```

#### SDK Example

```typescript
await agentReputation.appendResponse(
    feedbackId,
    "Thank you for the feedback. We've improved response latency in v1.1."
);
```

---

### View Functions

#### getSummary

```solidity
function getSummary(uint256 agentId) external view returns (ReputationSummary memory);
```

Returns the computed reputation summary including simple average and time-weighted score. Both scores are scaled by 100.

#### SDK Example

```typescript
const summary = await agentReputation.getSummary(agentId);
console.log(`Average: ${Number(summary.averageRating) / 100} stars`);
console.log(`Weighted: ${Number(summary.weightedScore) / 100}`);
console.log(`Active reviews: ${summary.activeFeedback}`);
```

#### getFeedback

```solidity
function getFeedback(uint256 feedbackId) external view returns (Feedback memory);
```

Returns the complete Feedback struct for a given ID.

#### getAgentFeedbackIds

```solidity
function getAgentFeedbackIds(uint256 agentId) external view returns (uint256[] memory);
```

Returns all feedback IDs for an agent (including revoked).

#### readAllFeedback

```solidity
function readAllFeedback(uint256 agentId) external view returns (Feedback[] memory);
```

Returns all Feedback structs for an agent in a single call.

#### getReviewerFeedback

```solidity
function getReviewerFeedback(address reviewer, uint256 agentId) external view returns (uint256);
```

Returns the feedback ID for a reviewer-agent pair. Returns 0 if no feedback exists.

---

### Admin Functions

| Function | Access | Description |
|----------|--------|-------------|
| `setAccessController(address)` | Owner | Set the BIDGES access controller |
| `setIdentityRegistry(address)` | Owner | Set the TAGITAgentIdentity registry |
| `pause()` | Owner | Emergency pause |
| `unpause()` | Owner | Resume operations |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `FeedbackGiven` | `feedbackId, agentId, reviewer, rating` | New feedback submitted |
| `FeedbackRevoked` | `feedbackId, agentId` | Feedback revoked by reviewer |
| `ResponseAppended` | `feedbackId, agentId` | Agent registrant responded |
| `AccessControllerUpdated` | `previousController, newController` | Access controller changed |
| `IdentityRegistryUpdated` | `previousRegistry, newRegistry` | Identity registry changed |

## Errors

```solidity
error InvalidRating(uint8 rating);
error CommentTooLong(uint256 length);
error ResponseTooLong(uint256 length);
error SelfReviewBlocked(address reviewer, uint256 agentId);
error FeedbackNotFound(uint256 feedbackId);
error NotReviewer(address caller, uint256 feedbackId);
error FeedbackAlreadyRevoked(uint256 feedbackId);
error AgentNotFound(uint256 agentId);
error AgentNotActive(uint256 agentId);
error MissingKYCIdentity(address caller);
error AccessControllerNotSet();
error NotAgentRegistrant(address caller, uint256 agentId);
error ResponseAlreadyExists(uint256 feedbackId);
error IdentityRegistryNotSet();
```

## Access Control Matrix

| Function | KYC_L1 | Reviewer | Registrant | Owner |
|----------|--------|----------|------------|-------|
| `giveFeedback` | Required | — | Blocked (self) | — |
| `revokeFeedback` | — | Required | — | — |
| `appendResponse` | — | — | Required | — |
| Admin functions | — | — | — | Required |

## Anti-Manipulation Protections

| Protection | Mechanism |
|-----------|-----------|
| **Anti-Sybil** | KYC_L1 identity badge required to give feedback |
| **Anti-self-review** | Registrant and agent wallet cannot review their own agent |
| **One-per-user** | Only one active feedback per reviewer per agent |
| **Time decay** | Old feedback naturally loses influence over 90-day period |
| **Revoke + re-review** | Must explicitly revoke before submitting updated feedback |

## Security Considerations

- **CEI pattern** — All state-changing functions follow Checks-Effects-Interactions
- **ReentrancyGuard** — Protection on all mutating functions
- **Pausable** — Emergency circuit breaker
- **Identity registry dependency** — Requires TAGITAgentIdentity to verify agent existence and registrant identity
- **Comment/response length limits** — Prevents gas griefing via oversized strings

## Related

- [TAGITAgentIdentity](./agent-identity.md) — Agent registry (identity dependency)
- [TAGITAgentValidation](./agent-validation.md) — Agent proof verification
- [TAGITAccess](./tagit-access.md) — BIDGES access control
- [Technosphere Architecture](../architecture/technosphere.md) — System overview
- [Contracts Overview](./index.md) — All contracts
