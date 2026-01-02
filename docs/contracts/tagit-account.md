---
title: TAGITAccount
description: ERC-4337 smart wallet for TAG IT users
---

# TAGITAccount

ERC-4337 compliant smart wallet for TAG IT Network users.

## Overview

TAGITAccount is a smart contract wallet that enables gasless transactions, batch operations, and enhanced security features.

## Features

| Feature | Description |
|---------|-------------|
| Gasless Transactions | Via TAGITPaymaster |
| Batch Operations | Multiple calls in one tx |
| Social Recovery | Recover via guardians |
| Session Keys | Delegated permissions |

## Contract Interface

```solidity
interface ITAGITAccount {
    // ERC-4337 required
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);

    // Execution
    function execute(
        address dest,
        uint256 value,
        bytes calldata data
    ) external;

    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata data
    ) external;

    // Owner management
    function owner() external view returns (address);
    function transferOwnership(address newOwner) external;

    // Guardian management (social recovery)
    function addGuardian(address guardian) external;
    function removeGuardian(address guardian) external;
    function recover(address newOwner, bytes[] calldata signatures) external;

    // Session keys
    function addSessionKey(address key, uint256 validUntil, bytes4[] calldata allowedSelectors) external;
    function revokeSessionKey(address key) external;
}
```

## Key Functions

### execute

Executes a single call from the wallet.

```solidity
function execute(
    address dest,
    uint256 value,
    bytes calldata data
) external;
```

### executeBatch

Executes multiple calls in a single transaction.

```solidity
function executeBatch(
    address[] calldata dest,
    uint256[] calldata value,
    bytes[] calldata data
) external;
```

### recover

Recovers the account via guardian signatures.

```solidity
function recover(address newOwner, bytes[] calldata signatures) external;
```

## Events

```solidity
event Executed(address indexed dest, uint256 value, bytes data);
event BatchExecuted(uint256 count);
event GuardianAdded(address indexed guardian);
event GuardianRemoved(address indexed guardian);
event AccountRecovered(address indexed oldOwner, address indexed newOwner);
event SessionKeyAdded(address indexed key, uint256 validUntil);
event SessionKeyRevoked(address indexed key);
```

## Related

- [TAGITAccountFactory](./tagit-account-factory.md) — Account creation
- [TAGITPaymaster](./tagit-paymaster.md) — Gas sponsorship
