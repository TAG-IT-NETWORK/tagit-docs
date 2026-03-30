---
title: Deployment Reference
description: TAG IT Network contract addresses, block explorer links, and OP Sepolia network configuration
---

# Deployment Reference

All TAG IT Network smart contracts are deployed on **OP Sepolia** (Optimism Sepolia testnet).

> **Last Updated**: February 27, 2026 | SEC-AUD-001 fully remediated

## Network Configuration

| Parameter | Value |
|-----------|-------|
| **Network Name** | OP Sepolia |
| **Chain ID** | `11155420` |
| **Currency** | ETH |
| **RPC URL (Public)** | `https://sepolia.optimism.io` |
| **RPC URL (Alchemy)** | `https://opt-sepolia.g.alchemy.com/v2/{API_KEY}` |
| **RPC URL (QuickNode)** | `https://optimism-sepolia.quiknode.pro/{API_KEY}` |
| **Block Explorer** | [sepolia-optimism.etherscan.io](https://sepolia-optimism.etherscan.io) |
| **Blockscout Explorer** | [optimism-sepolia.blockscout.com](https://optimism-sepolia.blockscout.com) |
| **Bridge** | [app.optimism.io/bridge](https://app.optimism.io/bridge) |

### Wallet Configuration

Add OP Sepolia to MetaMask or any EVM wallet:

| Field | Value |
|-------|-------|
| Network Name | OP Sepolia |
| New RPC URL | `https://sepolia.optimism.io` |
| Chain ID | `11155420` |
| Currency Symbol | `ETH` |
| Block Explorer URL | `https://sepolia-optimism.etherscan.io` |

### Programmatic Configuration (viem)

```typescript
import { createPublicClient, http } from 'viem';
import { optimismSepolia } from 'viem/chains';

const client = createPublicClient({
  chain: optimismSepolia,  // chain ID 11155420 pre-configured
  transport: http('https://sepolia.optimism.io'),
});
```

## Faucets

Get free testnet ETH for OP Sepolia:

| Faucet | URL | Requirements |
|--------|-----|--------------|
| **Superchain Faucet** | [app.optimism.io/faucet](https://app.optimism.io/faucet) | GitHub authentication |
| **Alchemy Faucet** | [sepoliafaucet.com](https://sepoliafaucet.com) | Alchemy account |
| **QuickNode Faucet** | [faucet.quicknode.com/optimism/sepolia](https://faucet.quicknode.com/optimism/sepolia) | QuickNode account |
| **Bridge from L1 Sepolia** | [app.optimism.io/bridge](https://app.optimism.io/bridge) | Sepolia ETH on L1 |

> **Tip**: The fastest path is to get Sepolia ETH from any Ethereum Sepolia faucet, then bridge it to OP Sepolia using the Optimism bridge.

## Contract Addresses

### Core Contracts

| Contract | Address | Explorer | Status |
|----------|---------|----------|--------|
| TAGITCore | `0x8bde22da889306d422802728cb98b6da42ed8e1a` | [View](https://sepolia-optimism.etherscan.io/address/0x8bde22da889306d422802728cb98b6da42ed8e1a) | LIVE (UUPS Proxy) |
| TAGITAccess | `0x0611FE60f6E37230bDaf04c5F2Ac2dc9012130a9` | [View](https://sepolia-optimism.etherscan.io/address/0x0611FE60f6E37230bDaf04c5F2Ac2dc9012130a9) | LIVE |
| IdentityBadge | `0x26F2EBb84664EF1eF8554e15777EBEc6611256A6` | [View](https://sepolia-optimism.etherscan.io/address/0x26F2EBb84664EF1eF8554e15777EBEc6611256A6) | LIVE |
| CapabilityBadge | `0x5e190F6Ebde4BD1e11a5566a1e81a933cdDf3505` | [View](https://sepolia-optimism.etherscan.io/address/0x5e190F6Ebde4BD1e11a5566a1e81a933cdDf3505) | LIVE |

### NIST Phase 3 Contracts (ERC-1967 Proxies)

| Contract | Proxy | Implementation | Explorer | Status |
|----------|-------|----------------|----------|--------|
| TAGITRecovery | `0x17c0af6B37aBD06587303f1695a06A668F8A5A8c` | `0x8d8a5300e8c5E8BaBebd73175954ce01a427CDCe` | [View](https://sepolia-optimism.etherscan.io/address/0x17c0af6B37aBD06587303f1695a06A668F8A5A8c) | LIVE (v1.1.0) |
| TAGITPaymaster | `0x670DC1C7821E0A717CFf5Cc949B05EC01b532104` | `0x4339c46D63231063250834D9b3fa4E51FdB8026e` | [View](https://sepolia-optimism.etherscan.io/address/0x670DC1C7821E0A717CFf5Cc949B05EC01b532104) | LIVE |
| TAGITTreasury | `0x018b5c4b5550Bcc0ffe53e2FD0a5D9d1046cad78` | `0xf6f5e2e03f6e28aE9Dc17bCc814a0cf758c887c9` | [View](https://sepolia-optimism.etherscan.io/address/0x018b5c4b5550Bcc0ffe53e2FD0a5D9d1046cad78) | LIVE |
| TAGITPrograms | `0x4d1007eB4823a5a13905A0361478C339421ce4C9` | `0x066FB866C0345115FA27a27cC704e8eaC61A565f` | [View](https://sepolia-optimism.etherscan.io/address/0x4d1007eB4823a5a13905A0361478C339421ce4C9) | LIVE (v1.1.0) |
| TAGITStaking | `0xe500CDfbA693CE1f39A6F05CfB4614971370Ee93` | `0x12EE464e32a683f813fDb478e6C8e68E3d63d781` | [View](https://sepolia-optimism.etherscan.io/address/0xe500CDfbA693CE1f39A6F05CfB4614971370Ee93) | LIVE |

### Account Abstraction (ERC-4337)

| Contract | Address | Explorer | Status |
|----------|---------|----------|--------|
| TAGITAccount | `0xC159FDec7a8fDc0d98571C89c342e28bB405e682` | [View](https://sepolia-optimism.etherscan.io/address/0xC159FDec7a8fDc0d98571C89c342e28bB405e682) | LIVE |
| TAGITAccountFactory | `0x8D27B612a9D3e45d51D2234B2f4e03dCC5ca844b` | [View](https://sepolia-optimism.etherscan.io/address/0x8D27B612a9D3e45d51D2234B2f4e03dCC5ca844b) | LIVE |

### Cross-Chain Bridge

| Contract | Address | Explorer | Status |
|----------|---------|----------|--------|
| CCIPAdapter | `0x8dA6D7ffCD4cc0F2c9FfD6411CeD7C9c573C9E88` | [View](https://sepolia-optimism.etherscan.io/address/0x8dA6D7ffCD4cc0F2c9FfD6411CeD7C9c573C9E88) | LIVE |

### Agent Infrastructure (ERC-8004)

| Contract | Address | Explorer | Status |
|----------|---------|----------|--------|
| TAGITAgentIdentity | `0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D` | [View](https://sepolia-optimism.etherscan.io/address/0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D) | LIVE |
| TAGITAgentReputation | `0x57CCa1974DFE29593FBD24fdAEE1cD614Bfd6E4a` | [View](https://sepolia-optimism.etherscan.io/address/0x57CCa1974DFE29593FBD24fdAEE1cD614Bfd6E4a) | LIVE |
| TAGITAgentValidation | `0x9806919185F98Bd07a64F7BC7F264e91939e86b7` | [View](https://sepolia-optimism.etherscan.io/address/0x9806919185F98Bd07a64F7BC7F264e91939e86b7) | LIVE |

### Token and Governance Contracts

| Contract | Proxy | Implementation | Explorer | Status |
|----------|-------|----------------|----------|--------|
| TAGITToken | `0xEe8f9544f0fC0be05408F4d0fa557be99a1cED94` | `0xa6620502d99e00b65dB65daea5bf6fb29B937BC9` | [View](https://sepolia-optimism.etherscan.io/address/0xEe8f9544f0fC0be05408F4d0fa557be99a1cED94) | LIVE (UUPS) |
| TAGITGovernor | `0x53F88a7fa2A7F2062A74c5FeB2Bab1Df29348DD8` | `0xFBbae8ED8EE66CDCf7b528106D66f5254d28E192` | [View](https://sepolia-optimism.etherscan.io/address/0x53F88a7fa2A7F2062A74c5FeB2Bab1Df29348DD8) | LIVE (UUPS) |
| TAGITEmissions | TBD | — | — | Pending |
| TAGITBurner | TBD | — | — | Pending |
| TAGITVesting | TBD | — | — | Pending |

## OP Mainnet (Production)

> **Status**: Coming soon. Mainnet deployment will require DAO governance approval and multi-sig execution.

## Using Addresses in Code

### Import from SDK

```typescript
import { addresses } from '@tagit/sdk';

// addresses.testnet.TAGITCore → '0x8bde22da889306d422802728cb98b6da42ed8e1a'
// addresses.testnet.TAGITAccess → '0x0611FE60f6E37230bDaf04c5F2Ac2dc9012130a9'
```

### Manual Configuration

```typescript
const CONTRACTS = {
  TAGITCore: '0x8bde22da889306d422802728cb98b6da42ed8e1a',
  TAGITAccess: '0x0611FE60f6E37230bDaf04c5F2Ac2dc9012130a9',
  TAGITRecovery: '0x17c0af6B37aBD06587303f1695a06A668F8A5A8c',
  TAGITPaymaster: '0x670DC1C7821E0A717CFf5Cc949B05EC01b532104',
  TAGITTreasury: '0x018b5c4b5550Bcc0ffe53e2FD0a5D9d1046cad78',
  TAGITPrograms: '0x4d1007eB4823a5a13905A0361478C339421ce4C9',
  TAGITStaking: '0xe500CDfbA693CE1f39A6F05CfB4614971370Ee93',
  TAGITAgentIdentity: '0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D',
  TAGITAgentReputation: '0x57CCa1974DFE29593FBD24fdAEE1cD614Bfd6E4a',
  TAGITAgentValidation: '0x9806919185F98Bd07a64F7BC7F264e91939e86b7',
  TAGITToken: '0xEe8f9544f0fC0be05408F4d0fa557be99a1cED94',
  TAGITGovernor: '0x53F88a7fa2A7F2062A74c5FeB2Bab1Df29348DD8',
} as const;
```

## Related

- [Smart Contracts Overview](./index.md) — All 18 contract modules
- [Contract Integration Guide](../guides/contract-integration.md) — How to interact with contracts
- [Quickstart](../getting-started/quickstart.md) — 5-minute setup guide
- [Glossary](../glossary.md) — Key terminology
