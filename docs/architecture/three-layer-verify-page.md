---
title: Three-Layer Verify Page Pattern
description: Architectural pattern for chip-verify pages that progressively unlock value — trustless read, paid AI brief, wallet action.
---

# Three-Layer Verify Page Pattern

A pattern for `verify.tagit.network/<chipId>` pages that progressively layer functionality based on how much the visitor is willing to commit. Originated in the [`tagit-tap-to-buy`](https://github.com/TAG-IT-NETWORK/tagit-tap-to-buy) hackathon (EasyA Consensus Miami, May 2026, archived). Documented here for future revival.

## Why three layers

A single verify page has to serve three audiences with different intent and tolerance for friction:

- **Casual tapper** — just wants to know if a product is real. Won't connect a wallet, won't pay a cent, won't sign in.
- **Curious researcher** — willing to pay a trivial amount (cents) for richer info: history, custody chain, AI-generated brief.
- **Active buyer / owner** — ready to transact: make an offer, accept a sale, claim provenance.

Each layer unlocks the next. No layer blocks the previous.

## The layers

| Layer | Trust | Cost | What loads | Stack |
|---|---|---|---|---|
| **L1 — Trustless read** | None | $0, no wallet | Lifecycle state, owner address, last-verified timestamp, AUTHENTIC/FLAGGED badge | Direct RPC read of `TAGITCore.getAsset(tokenId)` on the chip's home chain |
| **L2 — Paid AI brief** | Pay-per-use | ~$0.01 USDC via x402 | Photo, custody history, scan count, recall flags, LLM-generated 3-sentence brief | x402 paywall → backend (Lambda/Fargate) → metadata store + LLM (e.g. Bedrock Claude Haiku) |
| **L3 — Wallet action** | Full custody | Gas + escrow funds | Connect wallet, sign EIP-712 offer, fund [`OfferEscrow`](../contracts/offer-escrow.md), accept on sale, claim on tap-on-receive | wagmi + Coinbase Smart Wallet (or any ERC-4337 wallet), `OfferEscrow` on the settlement chain |

## Layout

```
[NFC Chip] ─tap─► verify.tagit.network/<chipId>  (PWA / Next.js)
                       │
   ┌───────────────────┼───────────────────┐
   ▼                   ▼                   ▼
  L1                  L2                  L3
Trustless           Paid brief         Wallet action
on-chain read       (x402, USDC)       (EIP-712 + escrow)
   │                   │                   │
TAGITCore            tagit-services       OfferEscrow
.getAsset()         x402 middleware       .fundOffer/
                    + LLM brief           .acceptOffer*
```

## Why this composition works

- **L1 is the universal entry point.** Anyone with a phone can tap and verify, even with no wallet, no account, and no network history with TAG IT. Authenticity is a public good — never gate it.
- **L2 monetizes curiosity.** x402 lets the page charge a cent without sign-up flows or accounts. The buyer pays, the AI assembles a brief from registry metadata + history, and the response includes a 60-second cache hit for follow-up taps. Pricing belongs in [`src/x402/config.ts`](../../tagit-services/src/x402/config.ts) (per-skill USDC quotes).
- **L3 captures intent.** Once a visitor wants to actually transact, smart-wallet onboarding (passkey, no seed phrase) makes wallet creation a single tap. The first thing they sign is the EIP-712 offer that funds escrow — no separate "connect wallet" step before commitment.

## When to use

- ✅ Any public verify page where a chip ID resolves to an on-chain asset.
- ✅ Pages where you want to incrementally monetize without gating the core value (authenticity).
- ✅ Demos that need to show on-chain reads, AI orchestration, and atomic settlement in one flow.
- ❌ Internal/operational pages — use a single authenticated view; the layers add complexity without benefit.
- ❌ Bulk verification flows (warehouse, customs) — those want a single batch endpoint, not per-chip pages.

## Implementation references

- **L1 read pattern** — see `verify.tagit.network` production code (any chain SDK with `getAsset`).
- **L2 x402 middleware** — `tagit-services/src/x402/middleware.ts` (stub; will use `@x402/express` when SDK stabilizes). Hackathon reference implementation that parses on-chain `USDC.transfer` proofs directly: [`tagit-tap-to-buy/api/middleware/x402.ts`](https://github.com/TAG-IT-NETWORK/tagit-tap-to-buy/blob/main/api/middleware/x402.ts) (archived).
- **L3 offer/settle contract** — `tagit-contracts/src/escrow/OfferEscrow.sol` ([PR #26](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/26)). Buyer signs EIP-712 offer naming the seller and (optionally) the chip authorized for tap-on-receive; settlement transfers NFT and USDC atomically. Smart-wallet signatures verified via EIP-1271.

## Open questions

- **Spam control on L2.** x402's tx-hash-uniqueness prevents replay but doesn't prevent flood from many small payments. The hackathon code adds a per-wallet rate limit (10 req/min) as a stopgap — production likely wants this in the indexer/CDN layer.
- **L3 wallet UX for unfamiliar buyers.** Coinbase Smart Wallet's passkey onboarding works but assumes the visitor has a passkey-capable device. Fallback connector (injected MetaMask) is needed for desktop scans.
- **Chip-to-seller binding for tap-on-receive.** `OfferEscrow.acceptOfferByTap` requires the offer to commit to a specific chip pubkey. Production needs a registry that maps chip pubkeys to current asset owners so the buyer's UI can populate the field automatically.
