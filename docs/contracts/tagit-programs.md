# TAGITPrograms

Rewards, customs integration, and recall management contract.

## Overview

TAGITPrograms manages various incentive and compliance programs including loyalty rewards, customs clearance, and product recalls.

## Program Types

| Type | Description |
|------|-------------|
| **Rewards** | User loyalty and verification incentives |
| **Customs** | Import/export compliance tracking |
| **Recalls** | Product recall management |
| **Bounties** | Bug bounty and fraud detection rewards |

## Functions

### createProgram

Creates a new program.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `programType` | `ProgramType` | Type of program |
| `name` | `string` | Program name |
| `budget` | `uint256` | Total budget allocation |
| `params` | `bytes` | Program-specific parameters |

#### Returns

| Type | Description |
|------|-------------|
| `uint256` | Program ID |

#### Access Control

Requires governance approval.

#### Solidity

```solidity
function createProgram(
    ProgramType programType,
    string calldata name,
    uint256 budget,
    bytes calldata params
) external returns (uint256 programId);
```

---

### enroll

Enrolls a participant in a program.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `programId` | `uint256` | Program ID |
| `participant` | `address` | Participant address |

#### Solidity

```solidity
function enroll(uint256 programId, address participant) external;
```

---

### claimReward

Claims a reward from a program.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `programId` | `uint256` | Program ID |
| `proof` | `bytes` | Claim proof (merkle proof, etc.) |

#### Solidity

```solidity
function claimReward(uint256 programId, bytes calldata proof) external;
```

---

### initiateRecall

Initiates a product recall program.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `manufacturerId` | `uint256` | Manufacturer badge ID |
| `affectedTokens` | `uint256[]` | List of affected token IDs |
| `reason` | `string` | Recall reason |

#### Returns

| Type | Description |
|------|-------------|
| `uint256` | Recall program ID |

#### Solidity

```solidity
function initiateRecall(
    uint256 manufacturerId,
    uint256[] calldata affectedTokens,
    string calldata reason
) external returns (uint256 recallId);
```

---

## Events

```solidity
event ProgramCreated(uint256 indexed programId, ProgramType programType, string name);
event ParticipantEnrolled(uint256 indexed programId, address indexed participant);
event RewardClaimed(uint256 indexed programId, address indexed claimer, uint256 amount);
event RecallInitiated(uint256 indexed recallId, uint256 indexed manufacturerId, uint256 affectedCount);
```

## Rewards Structure

### Verification Rewards

| Action | Reward |
|--------|--------|
| First verification | 10 points |
| Subsequent verification | 1 point |
| Report fraud | 100 points |
| Refer new user | 50 points |

### Point Redemption

| Points | Reward |
|--------|--------|
| 100 | NFT Badge |
| 500 | $5 Store Credit |
| 1000 | Premium Features |

## Customs Integration

TAGITPrograms supports customs clearance tracking:

1. **Pre-clearance** — Submit manifest before shipment
2. **Inspection** — Customs officers verify assets
3. **Clearance** — Assets marked as cleared
4. **Release** — Shipment released to recipient

## Next Steps

- [TAGITTreasury](./tagit-treasury.md) — Fund allocation
- [TAGITCore](./tagit-core.md) — Asset management
- [Contracts Overview](./index.md) — All contracts
