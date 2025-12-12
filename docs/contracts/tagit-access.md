---
title: TAGITAccess
description: BIDGES badge-based identity and role-based access control
---

# TAGITAccess

BIDGES (Badge-based Identity for Decentralized Governance and Enterprise Security) contract.

## Overview

TAGITAccess manages identity badges and capability badges for the TAG IT Network permission system.

## Badge Types

### Identity Badges (Soulbound)

Non-transferable badges representing verified identity.

| Badge ID | Name | Description |
|----------|------|-------------|
| 1 | `KYC_L1` | Basic identity verified |
| 2 | `KYC_L2` | Enhanced verification |
| 3 | `KYC_L3` | Institutional/accredited |
| 10 | `MANUFACTURER` | Verified brand/factory |
| 11 | `RETAILER` | Authorized seller |
| 20 | `GOV_MIL` | Government/military clearance |
| 21 | `LAW_ENFORCEMENT` | Police/customs authority |

### Capability Badges (Transferable)

Transferable badges granting specific permissions.

| Cap ID | Name | Permission |
|--------|------|------------|
| 100 | `CAP_MINT` | Create new asset NFTs |
| 101 | `CAP_BIND` | Bind NFC tags to assets |
| 102 | `CAP_ACTIVATE` | QA activation approval |
| 104 | `CAP_FLAG` | Flag assets as suspicious |
| 105 | `CAP_RECOVERY_INIT` | Start AIRP recovery |
| 106 | `CAP_RECOVERY_APPROVE` | Approve recovery resolution |
| 107 | `CAP_FREEZE` | Emergency pause authority |
| 108 | `CAP_DAO_VOTE` | Governance voting rights |

## Functions

### grantIdentityBadge

Grants a soulbound identity badge.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `to` | `address` | Recipient address |
| `badgeId` | `uint256` | Identity badge ID |
| `expiry` | `uint64` | Badge expiration timestamp |

#### Access Control

Requires `BADGE_ADMIN` role.

#### Solidity

```solidity
function grantIdentityBadge(
    address to,
    uint256 badgeId,
    uint64 expiry
) external;
```

---

### grantCapability

Grants a capability badge.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `to` | `address` | Recipient address |
| `capId` | `uint256` | Capability badge ID |
| `amount` | `uint256` | Number of capability tokens |

#### Access Control

Requires `CAP_ADMIN` role.

#### Solidity

```solidity
function grantCapability(
    address to,
    uint256 capId,
    uint256 amount
) external;
```

---

### hasCapability

Checks if an address has a specific capability.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `account` | `address` | Address to check |
| `capId` | `uint256` | Capability ID |

#### Returns

| Type | Description |
|------|-------------|
| `bool` | True if has capability |

#### Solidity

```solidity
function hasCapability(address account, uint256 capId) external view returns (bool);
```

---

### hasIdentity

Checks if an address has a specific identity badge.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `account` | `address` | Address to check |
| `badgeId` | `uint256` | Identity badge ID |

#### Returns

| Type | Description |
|------|-------------|
| `bool` | True if has valid identity badge |

#### Solidity

```solidity
function hasIdentity(address account, uint256 badgeId) external view returns (bool);
```

---

## Events

```solidity
event IdentityBadgeGranted(address indexed to, uint256 indexed badgeId, uint64 expiry);
event IdentityBadgeRevoked(address indexed from, uint256 indexed badgeId);
event CapabilityGranted(address indexed to, uint256 indexed capId, uint256 amount);
event CapabilityRevoked(address indexed from, uint256 indexed capId, uint256 amount);
```

## Security

- Identity badges are **soulbound** (non-transferable)
- Badges can be revoked by admin
- Expiration enforced on-chain
- Multi-sig required for admin actions

## Next Steps

- [TAGITCore](./tagit-core.md) — Asset management
- [TAGITGovernor](./tagit-governor.md) — Governance
- [Contracts Overview](./index.md) — All contracts
