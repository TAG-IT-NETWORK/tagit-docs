---
title: Installation
description: What you need to install to work with TAG IT Network — which is usually nothing
---

# Installation

There is nothing to install to read TAG IT data. No TAG IT client library is published to
npm, Maven Central, or the Swift Package Index. The supported path is a direct contract
call over a public RPC, which works from any language.

## Nothing to install: read the contract directly

`TAGITCore` on Base Sepolia (chain ID 84532):
`0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D`

With [Foundry](https://book.getfoundry.sh/getting-started/installation) installed:

```bash
cast call 0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D \
  "getAsset(uint256)(address,uint64,uint8,uint8,uint16)" 1 \
  --rpc-url https://sepolia.base.org
```

Or with any standard Ethereum library — the only dependency is the library itself:

```bash
npm install viem     # JavaScript / TypeScript
```

```bash
pip install web3     # Python
```

Android and iOS have no TAG IT SDK. Use a general-purpose Ethereum client
([web3j](https://github.com/hyperledger-web3j/web3j) on Android,
[web3.swift](https://github.com/argentlabs/web3.swift) on iOS) and call `getAsset` the same
way.

A complete, runnable viem example is in the [SDK Overview](../sdk/overview.md).

## The JavaScript client (optional, unpublished)

> **`npm install @tagit/sdk` does not work.** The package is not published — the registry
> returns 404 — and the `@tagit` npm scope belongs to an unrelated third party. Do not
> install from that scope.

If you need the ERC-8004 agent identity/reputation/validation client specifically, build it
from source:

```bash
git clone https://github.com/TAG-IT-NETWORK/tagit-sdk.git
cd tagit-sdk
npm install
npm run build
```

Requires Node.js ≥ 20. Note that this client covers the **agent layer only** — it does not
do product registration, verification, or transfer. See
[JavaScript SDK](../sdk/javascript.md), including the deprecated default-chain warning.

## Configuration

There are no TAG IT API keys, and no `TAGIT_API_KEY` environment variable. Public contract
reads need no credentials at all.

The only value you may want to configure is an RPC endpoint. The public default works for
light use; a dedicated endpoint is advisable under load.

```bash
# Optional — any Base Sepolia RPC endpoint
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

For write operations you supply your own funded key. Keep it in the environment; never
commit it.

```bash
PRIVATE_KEY=0x...
```

## Verify your setup

If this returns an address and a state, everything works:

```bash
cast call 0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D \
  "totalSupply()(uint256)" --rpc-url https://sepolia.base.org
```

> **Note:** the contracts are deployed to Base Sepolia testnet and are **unaudited**.

## Next Steps

- [Quickstart Guide](./quickstart.md) — Get started quickly
- [First Verification](./first-verification.md) — Verify your first asset
- [SDK Overview](../sdk/overview.md) — Client options and the live HTTP endpoints
