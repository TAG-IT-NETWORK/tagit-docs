# TAGITTreasury

Protocol treasury and fee distribution contract.

## Contract Address

| Network | Address | Status |
|---------|---------|--------|
| OP Sepolia | `0xf6f5e2e03f6e28aE9Dc17bCc814a0cf758c887c9` | ✅ LIVE |
| OP Mainnet | TBD | 🔜 Pending |

## Overview

TAGITTreasury manages protocol funds, including fee collection, distribution to stakeholders, and reserve management.

## Fee Structure (Demo)

| Operation | Fee | Distribution |
|-----------|-----|--------------|
| Mint | 0.00002 ETH | 70% Treasury, 30% Validators |
| Verify | 0.00001ETH | 50% Treasury, 50% Validators |
| Transfer | 0.00001ETH | 80% Treasury, 20% Validators |

## Functions

### deposit

Deposits funds into the treasury.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `amount` | `uint256` | Amount to deposit |
| `token` | `address` | Token address (address(0) for ETH) |

#### Solidity

```solidity
function deposit(uint256 amount, address token) external payable;
```

---

### withdraw

Withdraws funds from the treasury.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `to` | `address` | Recipient address |
| `amount` | `uint256` | Amount to withdraw |
| `token` | `address` | Token address |

#### Access Control

Requires governance approval via TAGITGovernor.

#### Solidity

```solidity
function withdraw(address to, uint256 amount, address token) external;
```

---

### allocate

Allocates funds to a specific program or initiative.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `programId` | `uint256` | Program identifier |
| `amount` | `uint256` | Amount to allocate |

#### Solidity

```solidity
function allocate(uint256 programId, uint256 amount) external;
```

---

### claimRewards

Claims accumulated rewards for validators.

#### Solidity

```solidity
function claimRewards() external;
```

---

## Events

```solidity
event Deposited(address indexed from, address token, uint256 amount);
event Withdrawn(address indexed to, address token, uint256 amount);
event Allocated(uint256 indexed programId, uint256 amount);
event RewardsClaimed(address indexed validator, uint256 amount);
```

## Treasury Reserves

| Reserve | Purpose | Target |
|---------|---------|--------|
| Operating | Day-to-day operations | 6 months runway |
| Insurance | Asset recovery fund | $1M minimum |
| Development | Protocol upgrades | 20% of fees |
| Community | Grants and rewards | 10% of fees |

## Security

- Multi-sig required for withdrawals
- Timelock on large transfers
- Governance approval for allocations
- Regular audits of fund management

## Next Steps

- [TAGITGovernor](./tagit-governor.md) — Governance
- [TAGITPrograms](./tagit-programs.md) — Reward programs
- [Contracts Overview](./index.md) — All contracts
