---
title: TAGITVesting
description: Token vesting schedules for team and investors
---

# TAGITVesting

Manages token vesting schedules for team members, advisors, and investors.

## Overview

TAGITVesting locks tokens and releases them according to predefined schedules, ensuring long-term alignment of stakeholders.

## Vesting Schedules

| Category | Duration | Cliff | Release |
|----------|----------|-------|---------|
| Team | 4 years | 1 year | Linear monthly |
| Advisors | 2 years | 6 months | Linear monthly |
| Investors | 2 years | 6 months | Linear quarterly |

## Contract Interface

```solidity
interface ITAGITVesting {
    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        uint256 released;
        bool revocable;
        bool revoked;
    }

    // Schedule management
    function createVest(
        address beneficiary,
        uint256 amount,
        uint256 cliff,
        uint256 duration,
        bool revocable
    ) external returns (bytes32 vestingId);

    function release(bytes32 vestingId) external returns (uint256);
    function revoke(bytes32 vestingId) external;

    // View functions
    function vestedAmount(bytes32 vestingId) external view returns (uint256);
    function releasableAmount(bytes32 vestingId) external view returns (uint256);
    function getSchedule(bytes32 vestingId) external view returns (VestingSchedule memory);
}
```

## Key Functions

### createVest

Creates a new vesting schedule.

```solidity
function createVest(
    address beneficiary,
    uint256 amount,
    uint256 cliff,
    uint256 duration,
    bool revocable
) external returns (bytes32 vestingId);
```

### release

Releases vested tokens to the beneficiary.

```solidity
function release(bytes32 vestingId) external returns (uint256 released);
```

### revoke

Revokes a revocable vesting schedule (admin only).

```solidity
function revoke(bytes32 vestingId) external;
```

## Events

```solidity
event VestingCreated(bytes32 indexed vestingId, address indexed beneficiary, uint256 amount);
event TokensReleased(bytes32 indexed vestingId, uint256 amount);
event VestingRevoked(bytes32 indexed vestingId, uint256 unreleased);
```

## Related

- [TAGITToken](./tagit-token.md) — Base token contract
- [Token Distribution](../token/distribution.md) — Allocation details
