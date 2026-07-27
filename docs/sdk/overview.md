---
title: SDK Overview
description: What client tooling exists for TAG IT Network today, and what does not
---

# SDK Overview

**Status, in one line:** there is no installable TAG IT SDK for any language today. The
supported way to read TAG IT data is a direct contract call over a public RPC, which works
from any language without a package, a key, or a signup.

## What exists

| Platform | Package | Status |
|----------|---------|--------|
| Direct contract read (any language) | none needed | **Works today.** See below. |
| JavaScript / TypeScript | `@tagit/sdk` | **Not published** to npm — build from source. See [JavaScript](./javascript.md). |
| Kotlin (Android) | — | **Does not exist.** No such SDK has ever been built or released. |
| Swift (iOS) | — | **Does not exist.** No such SDK has ever been built or released. |

> **Do not run `npm install @tagit/sdk`.** The package is not published (the registry returns
> 404), and the `@tagit` npm scope is owned by an unrelated third party. Installing from that
> scope would pull a stranger's code, not ours.

There is no Kotlin artifact and no Swift package:

- The Gradle coordinate `network.tagit:sdk` does not exist — nothing is published to Maven
  Central under that group.
- The Swift module `TagItSDK` does not exist, and neither does the CocoaPods pod of the
  same name.
- The repository `tagit-swift` does not exist under any TAG IT org — the GitHub API
  returns 404.

If you have seen any of those referenced, they were describing products that have never
been built. For mobile, call the contract directly with a native Ethereum library (web3j on
Android, web3.swift on iOS) or use the HTTP endpoints listed below.

## Start here: read an asset with no SDK

Every asset's owner and lifecycle state is public on Base Sepolia. This needs no package,
no API key, and no account.

`TAGITCore` on Base Sepolia (chain ID 84532):
`0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D`

### With `cast` (Foundry)

```bash
cast call 0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D \
  "getAsset(uint256)(address,uint64,uint8,uint8,uint16)" 1 \
  --rpc-url https://sepolia.base.org
```

### With viem

```typescript
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const client = createPublicClient({ chain: baseSepolia, transport: http() });

const abi = [{
  type: "function", name: "getAsset", stateMutability: "view",
  inputs: [{ name: "tokenId", type: "uint256" }],
  outputs: [
    { name: "assetOwner", type: "address" },
    { name: "timestamp", type: "uint64" },
    { name: "state", type: "uint8" },
    { name: "flags", type: "uint8" },
    { name: "reserved", type: "uint16" },
  ],
}] as const;

const [assetOwner, timestamp, state] = await client.readContract({
  address: "0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D",
  abi,
  functionName: "getAsset",
  args: [1n],
});

const STATES = ["NONE", "MINTED", "BOUND", "ACTIVATED", "CLAIMED", "FLAGGED", "RECYCLED"];
console.log("owner:", assetOwner);
console.log("state:", STATES[state], `(${state})`);
console.log("updated:", new Date(Number(timestamp) * 1000).toISOString());
```

Both samples above were run against the live contract and returned:

```
owner: 0x458B4d0c3a55006965Fd13D6af7B8509De51Cb3D
state: RECYCLED (6)
updated: 2026-05-26T16:19:34.000Z
```

### Lifecycle states

`getAsset` returns `state` as a `uint8`:

| Value | State |
|-------|-------|
| 0 | `NONE` — asset does not exist |
| 1 | `MINTED` — NFT created, no tag bound |
| 2 | `BOUND` — NFC tag cryptographically linked |
| 3 | `ACTIVATED` — QA passed, ready for distribution |
| 4 | `CLAIMED` — owned by an end consumer |
| 5 | `FLAGGED` — lost/stolen/recall initiated |
| 6 | `RECYCLED` — end of life, permanently retired |

> **Note:** the contracts are deployed to Base Sepolia testnet and are **unaudited**. Do not
> rely on them for production or custody decisions.

## HTTP endpoints

These are the complete set of live, callable HTTP endpoints. There is no `/v1` REST API.

| Endpoint | Notes |
|----------|-------|
| `GET https://api.tagit.network/health` | Returns `200` with a JSON status object. |
| `POST https://api.tagit.network/verify` | Returns `402` with an [x402](https://x402.org) payment envelope. Payment required; no API-key auth. |
| `GET https://verify.tagit.network/api/verify` | Requires `picc` and `cmac` query parameters from a real NTAG 424 DNA tap. |
| `GET https://verify.tagit.network/api/dpp/{tokenId}` | Same tap-gated parameters; returns a W3C Verifiable Credential digital product passport. |

Human-readable pages: `verify.tagit.network/asset/{tokenId}`, `/tag/{uid}`,
`/01/{gtin}/21/{serial}`, and `/sun`.

The `picc` and `cmac` values are produced by the chip's SUN (Secure Unique NFC) message
during a physical tap. They cannot be constructed by hand, so a verdict of `verified: true`
cannot be obtained without hardware. The endpoint itself is live and answers — invented
parameters are parsed and rejected on their merits:

```console
$ curl -s "https://verify.tagit.network/api/verify?picc=00000000000000000000000000000000&cmac=0000000000000000"
{"verified":false,"reason":"unexpected PICC tag 0xba","chain":{"id":84532,"name":"Base Sepolia"}}
```

Omitting the parameters returns `400 {"verified":false,"error":"missing picc or cmac query
params"}`. A route that genuinely does not exist returns a `404` HTML page instead — that is
how to tell the two apart.

## Next steps

- [JavaScript SDK](./javascript.md) — building the unpublished TypeScript client from source
- [SDK API Reference](./sdk-api-reference.md) — full method list for that client
- [Contracts](../contracts/index.md) — the contracts you can call directly
