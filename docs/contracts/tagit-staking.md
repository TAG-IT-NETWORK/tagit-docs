---
title: TAGITStaking
description: Token staking for rewards and governance power
---

# TAGITStaking

Enables token holders to stake TAGIT for rewards and enhanced governance power.

## Contract Address

| Network | Address | Status |
|---------|---------|--------|
| OP Sepolia | `0x12EE464e32a683f813fDb478e6C8e68E3d63d781` | ✅ LIVE |
| OP Mainnet | TBD | 🔜 Pending |

## Overview

TAGITStaking allows users to lock their tokens to earn staking rewards from protocol emissions and gain voting power in governance.

## Staking Parameters

| Parameter | Value |
|-----------|-------|
| Minimum Stake | 100 TAGIT |
| Cooldown Period | 7 days |
| Reward Frequency | Per block |
| Voting Power Multiplier | 1.5x for staked tokens |

## Contract Interface

```solidity
interface ITAGITStaking {
    struct StakeInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastStakeTime;
        uint256 cooldownEnd;
    }

    // Staking functions
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function claimRewards() external returns (uint256);

    // View functions
    function stakedBalance(address account) external view returns (uint256);
    function pendingRewards(address account) external view returns (uint256);
    function totalStaked() external view returns (uint256);
    function votingPower(address account) external view returns (uint256);

    // Admin functions
    function setMinStake(uint256 amount) external;
    function setCooldown(uint256 duration) external;
}
```

## Key Functions

### stake

Stakes tokens to earn rewards.

```solidity
function stake(uint256 amount) external;
```

### unstake

Initiates unstaking (subject to cooldown).

```solidity
function unstake(uint256 amount) external;
```

### claimRewards

Claims accumulated staking rewards.

```solidity
function claimRewards() external returns (uint256 claimed);
```

### votingPower

Returns the voting power for an account (includes staking multiplier).

```solidity
function votingPower(address account) external view returns (uint256);
```

## Events

```solidity
event Staked(address indexed account, uint256 amount);
event Unstaked(address indexed account, uint256 amount);
event RewardsClaimed(address indexed account, uint256 amount);
event CooldownStarted(address indexed account, uint256 endTime);
```

## Related

- [TAGITToken](./tagit-token.md) — Base token contract
- [TAGITEmissions](./tagit-emissions.md) — Reward source
- [TAGITGovernor](./tagit-governor.md) — Governance voting
- [Staking Guide](../token/staking.md) — User guide
