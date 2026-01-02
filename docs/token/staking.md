---
title: Staking
description: Stake TAGIT tokens to earn rewards and governance power
---

# Staking

Stake TAGIT tokens to earn rewards and increase governance power.

## Overview

Staking TAGIT tokens provides:
- **Rewards** — Share of protocol emissions
- **Governance** — 1.5x voting power multiplier
- **Priority** — Early access to features

## Staking Parameters

| Parameter | Value |
|-----------|-------|
| Minimum Stake | 100 TAGIT |
| Cooldown Period | 7 days |
| Reward Frequency | Per block |
| Voting Multiplier | 1.5x |

## Reward Distribution

### APY Calculation

Staking APY depends on total staked amount:

| Total Staked | Approximate APY |
|--------------|-----------------|
| <10% of supply | ~15% |
| 10-20% of supply | ~10% |
| 20-30% of supply | ~7% |
| >30% of supply | ~5% |

### Reward Sources

| Source | Share | Description |
|--------|-------|-------------|
| Emissions | 50% | New token emissions |
| Fees | 25% | Protocol fee share |
| Slashing | Variable | From bad actors |

## How to Stake

### 1. Acquire TAGIT

Purchase TAGIT from supported exchanges or DEXs.

### 2. Connect Wallet

Connect your wallet to the TAG IT dashboard.

### 3. Stake Tokens

```typescript
import { TagIt } from '@tagit/sdk';

const tagit = new TagIt({ apiKey: process.env.TAGIT_API_KEY });

// Stake 1000 TAGIT
const tx = await tagit.staking.stake(1000n * 10n**18n);
console.log('Staked:', tx.hash);
```

### 4. Claim Rewards

```typescript
// Check pending rewards
const pending = await tagit.staking.pendingRewards(address);
console.log('Pending:', pending);

// Claim rewards
const claim = await tagit.staking.claimRewards();
console.log('Claimed:', claim.amount);
```

## Unstaking

### Cooldown Period

Unstaking requires a 7-day cooldown:

1. **Initiate** — Call `unstake(amount)`
2. **Cooldown** — 7-day waiting period
3. **Withdraw** — Claim unstaked tokens

```typescript
// Initiate unstaking
await tagit.staking.unstake(500n * 10n**18n);

// After 7 days, withdraw
await tagit.staking.withdraw();
```

### Early Withdrawal

No early withdrawal option — must wait full cooldown.

## Voting Power

Staked tokens provide 1.5x voting power:

```
Base Power: 1000 TAGIT = 1000 votes
Staked Power: 1000 TAGIT staked = 1500 votes
```

## Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| Smart Contract | Bug in staking contract | Audited, bug bounty |
| Price | Token price volatility | Long-term staking |
| Slashing | None currently | N/A |

## Related

- [TAGITStaking Contract](../contracts/tagit-staking.md)
- [Governance](./governance.md)
- [Tokenomics](./tokenomics.md)
