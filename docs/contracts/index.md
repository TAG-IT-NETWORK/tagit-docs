---
title: Smart Contracts
description: Overview of TAG IT Network smart contract modules (15 contracts)
---

# Smart Contracts

TAG IT Network's on-chain logic is organized into **15 contract modules** across 4 categories.

## Module Overview

```mermaid
flowchart TB
    subgraph "Core (6)"
        A[TAGITCore]
        B[TAGITAccess]
        C[TAGITRecovery]
        D[TAGITGovernor]
        E[TAGITTreasury]
        F[TAGITPrograms]
    end

    subgraph "Token (5)"
        G[TAGITToken]
        H[TAGITEmissions]
        I[TAGITBurner]
        J[TAGITVesting]
        K[TAGITStaking]
    end

    subgraph "Account Abstraction (3)"
        L[TAGITPaymaster]
        M[TAGITAccountFactory]
        N[TAGITAccount]
    end

    subgraph "Bridge (1)"
        O[CCIPAdapter]
    end

    A --> B
    A --> C
    D --> A & E
    F --> A & E
    G --> H & I & K
    D --> G
    L --> M --> N
    O --> A
```

## Core Contracts (6)

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| [**TAGITCore**](./tagit-core.md) | Asset NFT, lifecycle, verification | `mint`, `bind`, `verify`, `transfer` |
| [**TAGITAccess**](./tagit-access.md) | BIDGES badges, role-based access | `grantRole`, `revokeRole`, `hasRole` |
| [**TAGITRecovery**](./tagit-recovery.md) | AIRP protocol, quarantine | `initiateRecovery`, `quarantine`, `release` |
| [**TAGITGovernor**](./tagit-governor.md) | Multi-house DAO governance | `propose`, `vote`, `execute` |
| [**TAGITTreasury**](./tagit-treasury.md) | Protocol funds management | `deposit`, `withdraw`, `allocate` |
| [**TAGITPrograms**](./tagit-programs.md) | Rewards, customs, recalls | `createProgram`, `enroll`, `claim` |

## Token Contracts (5)

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| [**TAGITToken**](./tagit-token.md) | ERC-20 governance token | `transfer`, `delegate`, `getVotes` |
| [**TAGITEmissions**](./tagit-emissions.md) | Inflation schedule, rewards | `emit`, `claimRewards`, `setRate` |
| [**TAGITBurner**](./tagit-burner.md) | Deflationary burns | `burn`, `burnFrom`, `totalBurned` |
| [**TAGITVesting**](./tagit-vesting.md) | Token vesting schedules | `createVest`, `release`, `revoke` |
| [**TAGITStaking**](./tagit-staking.md) | Stake tokens, earn rewards | `stake`, `unstake`, `claimRewards` |

## Account Abstraction (3)

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| [**TAGITPaymaster**](./tagit-paymaster.md) | ERC-4337 gas sponsorship | `validatePaymasterUserOp`, `postOp` |
| [**TAGITAccountFactory**](./tagit-account-factory.md) | Create smart wallets | `createAccount`, `getAddress` |
| [**TAGITAccount**](./tagit-account.md) | ERC-4337 smart wallet | `execute`, `validateUserOp` |

## Bridge Contract (1)

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| [**CCIPAdapter**](./ccip-adapter.md) | Chainlink CCIP bridge | `sendMessage`, `receiveMessage` |

## Deployment Addresses

### OP Sepolia (Testnet) — VERIFIED

| Contract | Address |
|----------|---------|
| TAGITCore | `0x6a58eE8f2d500981b1793868C55072789c58fba6` |
| TAGITAccess | `0xf7efefc59E81540408b4c9c2a09417Ddb10b4936` |
| IdentityBadge | `0xb3f757fca307a7febA5CA210Cd7D840EC0999be8` |
| CapabilityBadge | `0xfa7E212efc6E9214c5dE5bd29C9f1e4ef089486` |
| TAGITRecovery | TBD |
| TAGITGovernor | TBD |
| TAGITTreasury | TBD |
| TAGITPrograms | TBD |
| TAGITToken | TBD |
| TAGITEmissions | TBD |
| TAGITBurner | TBD |
| TAGITVesting | TBD |
| TAGITStaking | TBD |
| TAGITPaymaster | TBD |
| TAGITAccountFactory | TBD |
| CCIPAdapter | TBD |

### OP Mainnet (Production)

> Coming soon

## Access Control Model

```mermaid
flowchart LR
    subgraph "Roles (BIDGES)"
        R1[ADMIN_ROLE]
        R2[MINTER_ROLE]
        R3[BINDER_ROLE]
        R4[VERIFIER_ROLE]
        R5[FLAGGING_ROLE]
        R6[RECOVERY_ROLE]
    end

    R1 --> R2 & R3 & R4 & R5 & R6
```

| Role | Permissions |
|------|-------------|
| `ADMIN_ROLE` | Full system administration |
| `MINTER_ROLE` | Create new asset NFTs |
| `BINDER_ROLE` | Bind NFC chips to assets |
| `VERIFIER_ROLE` | Submit verification proofs |
| `FLAGGING_ROLE` | Flag assets for disputes |
| `RECOVERY_ROLE` | Execute AIRP recovery |

## Development

### Prerequisites

- [Foundry](https://book.getfoundry.sh/)
- Node.js 18+
- Git

### Clone & Build

```bash
git clone https://github.com/tagit-network/tagit-contracts
cd tagit-contracts
forge install
forge build
```

### Run Tests

```bash
forge test
```

### Deploy to Testnet

```bash
forge script script/Deploy.s.sol --rpc-url op-sepolia --broadcast
```

## Security

All contracts follow these security requirements:

- **ReentrancyGuard** on all state-changing functions
- **Checks-Effects-Interactions** pattern
- **Custom errors** (no string reverts)
- **Input validation** on all parameters
- **Events** for all state changes
- **BIDGES capability checks** for access control

See [Security Documentation](../security/threat-model.md) for threat analysis.

## Gas Optimization

| Operation | Max Gas |
|-----------|---------|
| `mint()` | < 150,000 |
| `bind()` | < 80,000 |
| `verify()` | < 50,000 |
| `transfer()` | < 100,000 |

## Related

- [Architecture Overview](../architecture/overview.md)
- [Token Documentation](../token/tokenomics.md)
- [API Reference](../api/overview.md)
- [SDK Documentation](../sdk/overview.md)
