---
title: TAGITToken
description: ERC-20 governance and utility token for TAG IT Network
---

# TAGITToken

ERC-20 governance and utility token for TAG IT Network.

## Overview

TAGIT is the native token powering governance, staking, and fee distribution across the TAG IT Network ecosystem.

## Token Details

| Property | Value |
|----------|-------|
| Standard | ERC-20 |
| Symbol | TAGIT |
| Decimals | 18 |
| Max Supply | 7,777,777,333 TAGIT |
| Genesis Supply | 7,777,777,333 TAGIT (minted to deployer) |
| Proxy Pattern | UUPS (ERC1967Proxy) |

## Utility

### 1. Governance

Vote on proposals and delegate voting power through [TAGITGovernor](./tagit-governor.md).

```solidity
// Delegate voting power
function delegate(address delegatee) external;

// Get voting power at a specific block
function getVotes(address account) external view returns (uint256);
```

### 2. Staking

Secure the network and earn verification fees.

```solidity
// Stake tokens
function stake(uint256 amount) external;

// Unstake tokens (subject to cooldown)
function unstake(uint256 amount) external;

// Claim staking rewards
function claimRewards() external returns (uint256);
```

### 3. Fees

Pay for premium features and priority verification.

| Feature | Fee |
|---------|-----|
| Priority Verification | 0.1 TAGIT |
| Bulk Minting | 0.01 TAGIT/asset |
| Custom Programs | Variable |

### 4. Rewards

Earn tokens from verification activities and fraud reporting.

| Activity | Reward |
|----------|--------|
| Successful Verification | 0.001 TAGIT |
| Fraud Report (confirmed) | 10 TAGIT |
| Program Participation | Variable |

## Distribution (Placeholder)

| Allocation | % | Vesting |
|------------|---|---------|
| Team | X% | 4-year, 1-year cliff |
| Treasury | X% | DAO-controlled |
| Community | X% | Emissions schedule |
| Investors | X% | TBD |

> **Note:** Final tokenomics to be published before mainnet launch. Genesis supply (7.77B) is currently held by the deployer wallet pending distribution setup via TAGITEmissions and TAGITVesting contracts.

## Contract Interface

```solidity
interface ITAGITToken {
    // ERC-20 Standard
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // Governance
    function delegate(address delegatee) external;
    function getVotes(address account) external view returns (uint256);
    function getPastVotes(address account, uint256 blockNumber) external view returns (uint256);

    // Staking
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function claimRewards() external returns (uint256);
    function stakedBalance(address account) external view returns (uint256);
}
```

## Contract Addresses

| Network | Type | Address |
|---------|------|---------|
| OP Sepolia | Proxy | `0xEe8f9544f0fC0be05408F4d0fa557be99a1cED94` |
| OP Sepolia | Implementation | `0xa6620502d99e00b65dB65daea5bf6fb29B937BC9` |
| OP Mainnet | — | Coming soon |

> **Deployed:** February 27, 2026 as part of SEC-AUD-001 remediation.

## Related

- [TAGITGovernor](./tagit-governor.md) — Voting and proposals
- [TAGITTreasury](./tagit-treasury.md) — Fee distribution
- [TAGITPrograms](./tagit-programs.md) — Reward payouts
