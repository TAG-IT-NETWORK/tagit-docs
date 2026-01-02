---
title: TAGITPaymaster
description: ERC-4337 Paymaster for gasless transactions
---

# TAGITPaymaster

ERC-4337 compliant Paymaster enabling gasless transactions for TAG IT users.

## Overview

TAGITPaymaster sponsors gas fees for user operations, allowing users to interact with the protocol without holding ETH.

## Sponsorship Rules

| User Tier | Gas Sponsorship | Daily Limit |
|-----------|-----------------|-------------|
| Free | Verification only | 10 ops/day |
| Pro | All operations | 100 ops/day |
| Enterprise | Unlimited | No limit |

## Contract Interface

```solidity
interface ITAGITPaymaster {
    // ERC-4337 required functions
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external returns (bytes memory context, uint256 validationData);

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external;

    // Sponsorship management
    function addSponsoredSelector(bytes4 selector) external;
    function removeSponsoredSelector(bytes4 selector) external;
    function isSponsoredSelector(bytes4 selector) external view returns (bool);

    // Deposit management
    function deposit() external payable;
    function withdrawTo(address payable to, uint256 amount) external;
    function getDeposit() external view returns (uint256);
}
```

## Sponsored Operations

| Operation | Sponsored |
|-----------|-----------|
| `verify()` | Yes |
| `bind()` | Yes (first time) |
| `transfer()` | Pro+ only |
| `mint()` | Enterprise only |

## Events

```solidity
event UserOperationSponsored(address indexed user, bytes32 userOpHash, uint256 gasCost);
event SponsoredSelectorAdded(bytes4 selector);
event SponsoredSelectorRemoved(bytes4 selector);
```

## Related

- [TAGITAccountFactory](./tagit-account-factory.md) — Account creation
- [TAGITAccount](./tagit-account.md) — Smart wallet
- [Architecture Overview](../architecture/overview.md) — System design
