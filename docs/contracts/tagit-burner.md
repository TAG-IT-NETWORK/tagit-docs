---
title: TAGITBurner
description: Deflationary token burn mechanism
---

# TAGITBurner

Manages deflationary burns of TAGIT tokens to reduce supply over time.

## Overview

TAGITBurner provides mechanisms for burning tokens, creating deflationary pressure to balance the emission schedule.

## Burn Mechanisms

| Mechanism | Rate | Trigger |
|-----------|------|---------|
| Fee Burns | 50% of fees | Automatic |
| Buyback Burns | Variable | Treasury vote |
| Voluntary Burns | 100% | User initiated |

## Contract Interface

```solidity
interface ITAGITBurner {
    // Burn functions
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;

    // Statistics
    function totalBurned() external view returns (uint256);
    function burnedByAccount(address account) external view returns (uint256);

    // Fee burn automation
    function processFees() external returns (uint256 burned);
}
```

## Key Functions

### burn

Burns tokens from the caller's balance.

```solidity
function burn(uint256 amount) external;
```

### burnFrom

Burns tokens from a specified account (requires approval).

```solidity
function burnFrom(address account, uint256 amount) external;
```

### totalBurned

Returns the total amount of tokens burned.

```solidity
function totalBurned() external view returns (uint256);
```

## Events

```solidity
event TokensBurned(address indexed burner, uint256 amount);
event FeeBurn(uint256 amount, uint256 totalBurned);
```

## Related

- [TAGITToken](./tagit-token.md) — Base token contract
- [TAGITTreasury](./tagit-treasury.md) — Fee collection
- [Token Economics](../token/tokenomics.md) — Full tokenomics
