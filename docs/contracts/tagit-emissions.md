---
title: TAGITEmissions
description: Token emission schedule and reward distribution
---

# TAGITEmissions

Manages the inflation schedule and reward distribution for TAGIT tokens.

## Overview

TAGITEmissions controls the minting of new TAGIT tokens according to a predetermined emission schedule, distributing rewards to stakers, verifiers, and ecosystem participants.

## Emission Parameters

| Parameter | Value |
|-----------|-------|
| Base Inflation Rate | 3.33% annually |
| Emission Frequency | Per block |
| Halving Schedule | None (fixed rate) |
| Max Emission Cap | Governed by DAO |

## Distribution

| Recipient | Share | Purpose |
|-----------|-------|---------|
| Stakers | 50% | Staking rewards |
| Verifiers | 30% | Verification incentives |
| Treasury | 20% | Protocol development |

## Contract Interface

```solidity
interface ITAGITEmissions {
    // Emission rate management
    function emissionRate() external view returns (uint256);
    function setEmissionRate(uint256 rate) external;

    // Reward distribution
    function emit() external returns (uint256);
    function claimRewards(address account) external returns (uint256);
    function pendingRewards(address account) external view returns (uint256);

    // Epoch tracking
    function currentEpoch() external view returns (uint256);
    function epochEmission(uint256 epoch) external view returns (uint256);
}
```

## Key Functions

### emit

Mints new tokens according to the emission schedule.

```solidity
function emit() external returns (uint256 amount);
```

### claimRewards

Claims accumulated rewards for an account.

```solidity
function claimRewards(address account) external returns (uint256 claimed);
```

## Events

```solidity
event Emission(uint256 indexed epoch, uint256 amount);
event RewardsClaimed(address indexed account, uint256 amount);
event EmissionRateUpdated(uint256 oldRate, uint256 newRate);
```

## Related

- [TAGITToken](./tagit-token.md) — Base token contract
- [TAGITStaking](./tagit-staking.md) — Staking rewards
- [Token Economics](../token/tokenomics.md) — Full tokenomics
