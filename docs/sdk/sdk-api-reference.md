---
title: SDK API Reference
description: Complete API reference for the @tagit/sdk source package, which is not published to npm
---

# SDK API Reference

Complete reference for `@tagit/sdk` v0.1.0 — a package that is not published to npm and must be built from source. All exported functions, classes, types, errors, and constants.

> **Version:** 0.1.0 · **Runtime:** Node.js ≥ 20 · **Default network:** OP Sepolia (11155420)

> **This package is not published.** `npm install @tagit/sdk` does not work — the registry
> returns 404, and the `@tagit` npm scope is owned by an unrelated third party. Build from
> source instead: `git clone https://github.com/TAG-IT-NETWORK/tagit-sdk.git && npm install
> && npm run build`. See [JavaScript SDK](./javascript.md).

> **The default chain is deprecated.** `createAgentClient()` defaults to OP Sepolia
> (11155420), which was deprecated on 2026-06-27 in favour of Base Sepolia (84532). Pass
> `chain` explicitly or you will silently read from the deprecated deployment.

> **Scope:** this is an ERC-8004 agent identity/reputation/validation client. It does not
> do product registration, asset verification, or ownership transfer.

---

## Table of Contents

- [Client Factory](#client-factory)
- [Identity API](#identity-api)
- [Reputation API](#reputation-api)
- [Validation API](#validation-api)
- [Event Watchers](#event-watchers)
- [A2A Client](#a2a-client)
- [A2A Client Pool](#a2a-client-pool)
- [Error Classes](#error-classes)
- [Types and Enums](#types-and-enums)
- [Contract Addresses](#contract-addresses)
- [Validation Schemas](#validation-schemas)

---

## Client Factory

### createAgentClient

Creates a configured SDK client with access to identity, reputation, validation, and event APIs.

```typescript
function createAgentClient(config?: AgentClientConfig): TagitAgentClient;
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `config.chain` | `Chain` | No | Viem chain definition (default: OP Sepolia) |
| `config.rpcUrl` | `string` | No | RPC endpoint URL |
| `config.privateKey` | `` `0x${string}` `` | No | Private key for write operations |
| `config.publicClient` | `PublicClient` | No | Custom viem public client |
| `config.walletClient` | `WalletClient` | No | Custom viem wallet client |

#### Returns

```typescript
interface TagitAgentClient {
  identity: IdentityReadMethods & Partial<IdentityWriteMethods>;
  reputation: ReputationReadMethods & Partial<ReputationWriteMethods>;
  validation: ValidationReadMethods & Partial<ValidationWriteMethods>;
  staking: StakingReadMethods & Partial<StakingWriteMethods>;
  events: EventMethods;
  publicClient: PublicClient;
  walletClient?: WalletClient;
}
```

> **Note:** Write methods are only available when `privateKey` or `walletClient` is provided. Attempting to call a write method on a read-only client will throw at runtime.

#### Example

```typescript
import { createAgentClient } from "@tagit/sdk"; // not published — build from source
import { baseSepolia } from "viem/chains";

// Read-only. Always pass `chain` — the default is the deprecated OP Sepolia deployment.
const reader = createAgentClient({
  chain: baseSepolia,
  rpcUrl: "https://sepolia.base.org",
});

// Read + write
const writer = createAgentClient({
  chain: baseSepolia,
  rpcUrl: "https://sepolia.base.org",
  privateKey: process.env.PRIVATE_KEY as `0x${string}`,
});
```

---

## Identity API

Methods for managing ERC-8004 agent identities. Access via `client.identity`.

### Read Methods

#### getAgent

```typescript
getAgent(agentId: bigint): Promise<AgentInfo>
```

Returns agent registration details.

| Field | Type | Description |
|-------|------|-------------|
| `registrant` | `Address` | Address that registered the agent |
| `wallet` | `Address` | Agent's operational wallet |
| `registeredAt` | `bigint` | Registration block timestamp |
| `active` | `boolean` | Whether agent is currently active |

#### getAgentStatus

```typescript
getAgentStatus(agentId: bigint): Promise<number>
```

Returns numeric status code: `0` = Registered, `1` = Active, `2` = Suspended, `3` = Decommissioned.

#### getAgentByWallet

```typescript
getAgentByWallet(wallet: Address): Promise<bigint>
```

Look up agent ID by operational wallet address. Returns `0n` if no agent found.

#### getAgentsByRegistrant

```typescript
getAgentsByRegistrant(registrant: Address): Promise<readonly bigint[]>
```

Get all agent IDs registered by a given address.

#### getMetadata

```typescript
getMetadata(agentId: bigint, key: string): Promise<string>
```

Retrieve a metadata value by key. Returns empty string if key not set.

#### isActiveAgent

```typescript
isActiveAgent(agentId: bigint): Promise<boolean>
```

Quick check whether an agent is in Active status.

#### totalAgents

```typescript
totalAgents(): Promise<bigint>
```

Get total count of registered agents.

#### registrationFee

```typescript
registrationFee(): Promise<bigint>
```

Get the current registration fee in wei.

#### tokenURI

```typescript
tokenURI(agentId: bigint): Promise<string>
```

Get the ERC-721 metadata URI for an agent.

---

### Write Methods

> **Requires** `privateKey` or `walletClient` in client config.

#### register

```typescript
register(
  wallet: Address,
  uri: string,
  value?: bigint
): Promise<`0x${string}`>
```

Register a new agent. Returns transaction hash.

| Parameter | Type | Description |
|-----------|------|-------------|
| `wallet` | `Address` | Agent's operational wallet address |
| `uri` | `string` | Metadata URI (typically IPFS) |
| `value` | `bigint` | Registration fee (optional, auto-calculated) |

#### setAgentURI

```typescript
setAgentURI(agentId: bigint, uri: string): Promise<`0x${string}`>
```

Update an agent's metadata URI.

#### setMetadata

```typescript
setMetadata(
  agentId: bigint,
  key: string,
  value: string
): Promise<`0x${string}`>
```

Set a custom metadata key-value pair on an agent.

#### suspendAgent

```typescript
suspendAgent(agentId: bigint): Promise<`0x${string}`>
```

Suspend an agent (pauses operations).

#### reactivateAgent

```typescript
reactivateAgent(agentId: bigint): Promise<`0x${string}`>
```

Reactivate a previously suspended agent.

#### decommissionAgent

```typescript
decommissionAgent(agentId: bigint): Promise<`0x${string}`>
```

Permanently decommission an agent. This is irreversible.

---

## Reputation API

Methods for agent feedback and reputation scoring. Access via `client.reputation`.

### Read Methods

#### getSummary

```typescript
getSummary(agentId: bigint): Promise<ReputationSummary>
```

| Field | Type | Description |
|-------|------|-------------|
| `totalFeedback` | `bigint` | Total feedback entries (including revoked) |
| `activeFeedback` | `bigint` | Active (non-revoked) feedback count |
| `averageRating` | `bigint` | Average rating (scaled integer) |
| `weightedScore` | `bigint` | Weighted reputation score |
| `lastFeedbackAt` | `bigint` | Timestamp of most recent feedback |

#### getFeedback

```typescript
getFeedback(feedbackId: bigint): Promise<Feedback>
```

| Field | Type | Description |
|-------|------|-------------|
| `reviewer` | `Address` | Address that submitted feedback |
| `agentId` | `bigint` | Target agent |
| `rating` | `number` | Rating (1-5) |
| `comment` | `string` | Feedback text |
| `response` | `string` | Agent's response (empty if none) |
| `timestamp` | `bigint` | Submission timestamp |
| `revoked` | `boolean` | Whether feedback was retracted |

#### readAllFeedback

```typescript
readAllFeedback(agentId: bigint): Promise<readonly Feedback[]>
```

Get all feedback entries for an agent (active and revoked).

#### getAgentFeedbackIds

```typescript
getAgentFeedbackIds(agentId: bigint): Promise<readonly bigint[]>
```

Get list of all feedback IDs for an agent.

#### getReviewerFeedback

```typescript
getReviewerFeedback(
  reviewer: Address,
  agentId: bigint
): Promise<bigint>
```

Get a reviewer's feedback ID for a specific agent. Returns `0n` if none.

### Write Methods

#### giveFeedback

```typescript
giveFeedback(
  agentId: bigint,
  rating: number,
  comment: string
): Promise<`0x${string}`>
```

Submit feedback on an agent. Rating must be 1-5.

#### revokeFeedback

```typescript
revokeFeedback(feedbackId: bigint): Promise<`0x${string}`>
```

Retract previously submitted feedback.

#### appendResponse

```typescript
appendResponse(
  feedbackId: bigint,
  responseText: string
): Promise<`0x${string}`>
```

Agent responds to feedback.

---

## Validation API

Methods for multi-validator agent validation. Access via `client.validation`.

### Read Methods

#### getRequest

```typescript
getRequest(requestId: bigint): Promise<ValidationRequest>
```

| Field | Type | Description |
|-------|------|-------------|
| `agentId` | `bigint` | Agent being validated |
| `requester` | `Address` | Who requested validation |
| `quorum` | `number` | Required validator count |
| `responseCount` | `number` | Current response count |
| `createdAt` | `bigint` | Request timestamp |
| `status` | `RequestStatus` | 0=Pending, 1=Passed, 2=Failed, 3=Expired |
| `isDefense` | `boolean` | Whether defense-level validation |

#### getSummary (Validation)

```typescript
getSummary(agentId: bigint): Promise<ValidationSummary>
```

| Field | Type | Description |
|-------|------|-------------|
| `totalRequests` | `bigint` | Total validation requests |
| `passedCount` | `bigint` | Passed validations |
| `failedCount` | `bigint` | Failed validations |
| `latestScore` | `bigint` | Most recent validation score |
| `lastValidatedAt` | `bigint` | Last validation timestamp |
| `isValidated` | `boolean` | Whether agent is currently validated |

#### getValidationStatus

```typescript
getValidationStatus(agentId: bigint): Promise<ValidationStatus>
```

Quick check for current validation state.

| Field | Type | Description |
|-------|------|-------------|
| `isValidated` | `boolean` | Whether validated |
| `latestScore` | `bigint` | Last score |
| `lastValidatedAt` | `bigint` | Last validation time |

#### getResponses

```typescript
getResponses(requestId: bigint): Promise<readonly ValidatorResponse[]>
```

| Field | Type | Description |
|-------|------|-------------|
| `validator` | `Address` | Validator address |
| `score` | `number` | Validation score |
| `justification` | `string` | Reasoning text |
| `timestamp` | `bigint` | Response timestamp |

#### getAgentRequests

```typescript
getAgentRequests(agentId: bigint): Promise<readonly bigint[]>
```

Get all validation request IDs for an agent.

#### getValidatorStats

```typescript
getValidatorStats(validator: Address): Promise<ValidatorStats>
```

| Field | Type | Description |
|-------|------|-------------|
| `totalResponses` | `bigint` | Total responses submitted |
| `accurateResponses` | `bigint` | Accurate response count |
| `lastResponseAt` | `bigint` | Last response timestamp |

#### hasValidatorResponded

```typescript
hasValidatorResponded(
  requestId: bigint,
  validator: Address
): Promise<boolean>
```

Check if a validator has already responded to a request.

### Write Methods

#### validationRequest

```typescript
validationRequest(
  agentId: bigint,
  isDefense: boolean
): Promise<`0x${string}`>
```

Request validation for an agent. Set `isDefense: true` for higher-scrutiny defense validation.

#### validationResponse

```typescript
validationResponse(
  requestId: bigint,
  score: number,
  justification: string
): Promise<`0x${string}`>
```

Submit a validation response as a validator.

---

## Event Watchers

All event watchers return an unsubscribe function: `() => void`. Access via `client.events`.

### Identity Events

#### watchAgentRegistered

```typescript
watchAgentRegistered(onLogs: (logs) => void): () => void
```

Log args: `{ agentId: bigint; registrant: Address; wallet: Address; uri: string }`

#### watchAgentStatusChanged

```typescript
watchAgentStatusChanged(onLogs: (logs) => void): () => void
```

Log args: `{ agentId: bigint; oldStatus: number; newStatus: number }`

### Reputation Events

#### watchFeedbackGiven

```typescript
watchFeedbackGiven(onLogs: (logs) => void): () => void
```

Log args: `{ feedbackId: bigint; agentId: bigint; reviewer: Address; rating: number }`

#### watchFeedbackRevoked

```typescript
watchFeedbackRevoked(onLogs: (logs) => void): () => void
```

Log args: `{ feedbackId: bigint; agentId: bigint }`

### Validation Events

#### watchValidationRequested

```typescript
watchValidationRequested(onLogs: (logs) => void): () => void
```

Log args: `{ requestId: bigint; agentId: bigint; requester: Address; isDefense: boolean }`

#### watchValidationFinalized

```typescript
watchValidationFinalized(onLogs: (logs) => void): () => void
```

Log args: `{ requestId: bigint; agentId: bigint; passed: boolean; finalScore: bigint }`

---

## A2A Client

Standalone Agent-to-Agent client for autonomous agent orchestration. Importable separately via the `@tagit/sdk/a2a` subpath (no viem dependency). The package is not published — build from source.

### Constructor

```typescript
import { A2AClient } from "@tagit/sdk/a2a"; // not published — build from source

const a2a = new A2AClient({
  baseUrl: "https://agent.example.com",
  authToken: "Bearer ...",     // Optional
  timeout: 30000,              // Default: 30s
  maxRetries: 3,               // Default: 3
  fetch: globalThis.fetch,     // Custom fetch (for testing)
});
```

### connect

```typescript
async connect(opts?: { force?: boolean }): Promise<AgentCard>
```

Fetches and caches the agent card from `/.well-known/agent.json`. Pass `{ force: true }` to bypass cache.

#### AgentCard Type

```typescript
interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
  };
  skills: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
    inputSchema: Record<string, unknown>;
  }>;
  defaultInputModes: string[];
  defaultOutputModes: string[];
}
```

### sendTask

```typescript
async sendTask(params: SendTaskParams): Promise<A2ATask>
```

Send a task to the agent.

| Parameter | Type | Description |
|-----------|------|-------------|
| `params.skill` | `string` | Skill ID to invoke |
| `params.input` | `Record<string, unknown>` | Task input data |

### getTask

```typescript
async getTask(params: { id: string }): Promise<A2ATask>
```

Retrieve task status and result by ID.

### cancelTask

```typescript
async cancelTask(params: { id: string }): Promise<A2ATask>
```

Cancel a running task.

### subscribe

```typescript
async *subscribe(params: SendTaskParams): AsyncGenerator<SSEEvent, A2ATask | undefined>
```

Stream task updates via Server-Sent Events. Falls back to JSON polling if SSE is unsupported.

```typescript
for await (const event of a2a.subscribe({
  skill: "verify",
  input: { tokenId: 42 },
})) {
  console.log("Event:", event.event, event.data);
}
```

### A2ATask Type

```typescript
interface A2ATask {
  id: string;
  status: "submitted" | "working" | "input-required"
    | "completed" | "canceled" | "failed";
  skill: string;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## A2A Client Pool

Connection pool for managing multiple A2A clients.

```typescript
import { A2AClientPool } from "@tagit/sdk/a2a"; // not published — build from source

const pool = new A2AClientPool({
  authToken: "Bearer ...",
  timeout: 15000,
});
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `get(baseUrl: string, overrides?): A2AClient` | Get or create client (singleton per URL) |
| `has` | `has(baseUrl: string): boolean` | Check if URL has cached client |
| `remove` | `remove(baseUrl: string): boolean` | Remove client from pool |
| `clear` | `clear(): void` | Clear all cached clients |
| `size` | `get size(): number` | Number of cached clients |
| `urls` | `urls(): string[]` | List all cached URLs |

---

## Standalone Functions

### fetchAgentCard

```typescript
import { fetchAgentCard } from "@tagit/sdk/a2a"; // not published — build from source

const card = await fetchAgentCard("https://agent.example.com", {
  authToken: "Bearer ...",
  timeout: 10000,
});
```

### parseSSEStream

```typescript
import { parseSSEStream } from "@tagit/sdk/a2a"; // not published — build from source

for await (const event of parseSSEStream(response.body)) {
  console.log(event.event, event.data);
}
```

---

## Error Classes

All SDK errors extend `SdkError`, which extends `Error`.

| Class | Extends | Key Properties | Thrown When |
|-------|---------|----------------|------------|
| `SdkError` | `Error` | `message` | Base error class |
| `ContractError` | `SdkError` | `contractName`, `functionName` | Contract call fails |
| `ValidationError` | `SdkError` | `field` | Input validation fails |
| `A2AError` | `SdkError` | — | A2A protocol error (base) |
| `A2ATimeoutError` | `A2AError` | `url`, `timeoutMs` | Request timeout |
| `A2AConnectionError` | `A2AError` | `url` | Connection failure |
| `A2AProtocolError` | `A2AError` | `code`, `data` | JSON-RPC error response |

### RPC Error Codes

```typescript
const RPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  TASK_NOT_FOUND: -32001,
  SKILL_NOT_FOUND: -32002,
};
```

---

## Types and Enums

### AgentStatus

```typescript
enum AgentStatus {
  Registered = 0,
  Active = 1,
  Suspended = 2,
  Decommissioned = 3,
}
```

### RequestStatus

```typescript
enum RequestStatus {
  Pending = 0,
  Passed = 1,
  Failed = 2,
  Expired = 3,
}
```

### Exported Types

From `@tagit/sdk` (not published — build from source):

| Type | Description |
|------|-------------|
| `Agent` | Agent registration data |
| `Feedback` | Feedback entry |
| `ReputationSummary` | Aggregated reputation metrics |
| `ValidationRequest` | Validation request details |
| `ValidatorResponse` | Validator's response |
| `ValidationSummary` | Aggregated validation stats |
| `ValidationStatus` | Quick validation check |
| `ValidatorStats` | Validator performance |
| `AgentClientConfig` | Client configuration |
| `TagitAgentClient` | Main client interface |
| `IdentityReadMethods` | Identity read API |
| `IdentityWriteMethods` | Identity write API |
| `ReputationReadMethods` | Reputation read API |
| `ReputationWriteMethods` | Reputation write API |
| `ValidationReadMethods` | Validation read API |
| `ValidationWriteMethods` | Validation write API |
| `EventMethods` | Event watcher API |

From the `@tagit/sdk/a2a` subpath (not published — build from source):

| Type | Description |
|------|-------------|
| `AgentCard` | Agent discovery card |
| `AgentCapabilities` | Agent capability flags |
| `AgentCardSkill` | Skill definition |
| `A2ATask` | Task state |
| `TaskStatus` | Task status union type |
| `A2AClientConfig` | A2A client config |
| `SendTaskParams` | Task send parameters |
| `GetTaskParams` | Task get parameters |
| `CancelTaskParams` | Task cancel parameters |
| `SSEEvent` | Server-sent event |
| `JsonRpcRequest` | JSON-RPC 2.0 request |
| `JsonRpcResponse` | JSON-RPC 2.0 response |
| `JsonRpcError` | JSON-RPC 2.0 error |

---

## Contract Addresses

Retrieve these at runtime with `getAddresses(chainId)` rather than hardcoding them.

### Base Sepolia (Chain ID: 84532) — current

| Contract | Address |
|----------|---------|
| TAGITCore | `0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D` |
| TAGITAgentIdentity | `0x0611FE60f6E37230bDaf04c5F2Ac2dc9012130a9` |
| TAGITAgentReputation | `0x32be6C82A57d5bCe897538d7dA4109eA0eeB0aA1` |
| TAGITAgentValidation | `0x34766dBa7040C2c8817f1Ee1e448209826DD607e` |
| VerificationEscrow | `0x4c9aACfcb64169E3BC187c227c4C0e0a5CFDA1cF` |
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

### OP Sepolia (Chain ID: 11155420) — deprecated 2026-06-27

| Contract | Address |
|----------|---------|
| TAGITAgentIdentity | `0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D` |
| TAGITAgentReputation | `0x57CCa1974DFE29593FBD24fdAEE1cD614Bfd6E4a` |
| TAGITAgentValidation | `0x9806919185F98Bd07a64F7BC7F264e91939e86b7` |

> **`ReputationStaking` is not deployed.** `getAddresses()` returns the zero address
> `0x0000000000000000000000000000000000000000` for it on every registered chain, so the
> `staking` methods cannot work against a live deployment.

---

## Validation Schemas

Zod schemas exported from `@tagit/sdk` (not published — build from source) for input validation:

| Schema | Validates | Constraints |
|--------|-----------|-------------|
| `addressSchema` | Ethereum address | `0x` + 40 hex chars |
| `agentIdSchema` | Agent token ID | `bigint > 0` |
| `ratingSchema` | Feedback rating | Integer 1-5 |
| `scoreSchema` | Validation score | Numeric |
| `uriSchema` | Metadata URI | Non-empty string |
| `commentSchema` | Feedback comment | Non-empty string |
| `justificationSchema` | Validator justification | Non-empty string |
| `feedbackIdSchema` | Feedback ID | `bigint > 0` |
| `requestIdSchema` | Validation request ID | `bigint > 0` |
