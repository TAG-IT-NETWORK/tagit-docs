---
title: JavaScript SDK
description: The unpublished TypeScript client — what it does, and how to build it from source
---

# JavaScript SDK

> **This package is not published.** `npm install @tagit/sdk` does not work: the registry
> returns 404 for `@tagit/sdk`, and the `@tagit` npm scope is owned by an unrelated third
> party. Do not install from that scope — you would be pulling a stranger's code. The only
> supported way to use this client today is to build it from source.

> **It is an agent-layer client only.** It talks to the ERC-8004 agent
> identity/reputation/validation contracts. It does **not** do product registration, asset
> verification, or ownership transfer. For asset reads, call `TAGITCore` directly — see
> [SDK Overview](./overview.md).

## Build from source

```bash
git clone https://github.com/TAG-IT-NETWORK/tagit-sdk.git
cd tagit-sdk
npm install
npm run build
```

Requires Node.js ≥ 20. This produces `dist/`. To consume it from another project on the
same machine, reference it by path (`npm install /path/to/tagit-sdk`) or use `npm link`.
There is no registry install path.

## The default chain is deprecated

`createAgentClient()` defaults to **OP Sepolia (11155420)**. That deployment was
**deprecated on 2026-06-27** in favour of **Base Sepolia (84532)**. If you do not pass a
chain explicitly, you will silently read from the deprecated deployment.

Always pass the chain:

```typescript
import { createAgentClient } from "@tagit/sdk"; // not published — build from source
import { baseSepolia } from "viem/chains";

const client = createAgentClient({
  chain: baseSepolia,
  rpcUrl: "https://sepolia.base.org",
});
```

The bundled CLI commands (`register`, `info`, `feedback`, `validate`) hardcode chain ID
`11155420` and therefore still target the deprecated deployment. Treat the CLI as
deprecated alongside it.

## Configuration

```typescript
createAgentClient(config?: AgentClientConfig)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `chain` | `Chain` | OP Sepolia (deprecated) | Viem chain definition |
| `rpcUrl` | `string` | the chain's default RPC | Custom RPC endpoint |
| `privateKey` | `` `0x${string}` `` | — | Enables write methods |
| `publicClient` | `PublicClient` | — | Pre-built viem public client; overrides `chain`/`rpcUrl` |
| `walletClient` | `WalletClient` | — | Pre-built viem wallet client; overrides `privateKey` |

There is no `apiKey` option. The client is an RPC client and does not authenticate against
a TAG IT server.

## What the client exposes

`createAgentClient()` returns an object with these properties:

| Property | Contract | Purpose |
|----------|----------|---------|
| `identity` | `TAGITAgentIdentity` | Register and query agent identities |
| `reputation` | `TAGITAgentReputation` | Feedback and reputation summaries |
| `validation` | `TAGITAgentValidation` | Validation requests and responses |
| `staking` | `ReputationStaking` | Stake-backed reputation |
| `events` | — | Contract event watchers |
| `publicClient` | — | The underlying viem public client |
| `walletClient` | — | The underlying viem wallet client (only when configured) |

Write methods are typed as `Partial` — they exist at runtime only when a `privateKey` or
`walletClient` is supplied. Reading without one is fine; calling a write method without one
is not.

> **Note:** `staking` points at `ReputationStaking`, whose address is
> `0x0000000000000000000000000000000000000000` on every currently registered chain. No
> staking contract is deployed, so those calls will not work against a real deployment.

## Example: read an agent

```typescript
import { createAgentClient } from "@tagit/sdk"; // not published — build from source
import { baseSepolia } from "viem/chains";

const client = createAgentClient({
  chain: baseSepolia,
  rpcUrl: "https://sepolia.base.org",
});

const agent = await client.identity.getAgent(1n);
console.log("registrant:", agent.registrant);
console.log("wallet:", agent.wallet);
console.log("active:", agent.active);
```

## Example: write

```typescript
const client = createAgentClient({
  chain: baseSepolia,
  rpcUrl: "https://sepolia.base.org",
  privateKey: process.env.PRIVATE_KEY as `0x${string}`,
});

// Write methods are optional at the type level — guard before calling.
if (!client.identity.register) throw new Error("no wallet configured");

const txHash = await client.identity.register(/* see API reference for arguments */);
console.log("tx:", txHash);
```

## Also exported

- **A2A client** — `A2AClient`, `A2AClientPool`, `fetchAgentCard`, `parseSSEStream` for
  agent-to-agent task messaging over JSON-RPC and SSE.
- **Contract readers/writers** — `createWTagReader`, `createWTagWriter`,
  `createVoucherReader`, `createVoucherWriter`, `createAgentReader`, `createAgentWriter`.
- **ABIs** — `agentIdentityAbi`, `agentReputationAbi`, `agentValidationAbi`, `wtagAbi`,
  `voucherAbi`.
- **Addresses** — `getAddresses(chainId)`.
- **Errors** — `SdkError`, `ContractError`, `ValidationError`.
- **Zod schemas** — `addressSchema`, `agentIdSchema`, `ratingSchema`, and others.

Full signatures are in the [SDK API Reference](./sdk-api-reference.md).

## Next steps

- [SDK Overview](./overview.md) — the no-SDK path, and what exists per platform
- [SDK API Reference](./sdk-api-reference.md) — complete method list
