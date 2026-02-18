# Register Agent Example

This example demonstrates how to register an AI agent on the Technosphere using TAGITAgentIdentity.

## Overview

The agent registration flow creates a soulbound ERC-721 identity for an AI agent:

1. **Register** — Mint a soulbound agent NFT with wallet and metadata URI
2. **Set Metadata** — Add key-value metadata (name, model, version, etc.)
3. **Verify** — Confirm the agent is active and queryable on-chain

## Prerequisites

- Node.js 18+
- An Ethereum wallet with **KYC_L1** identity badge (via BIDGES)
- The wallet must **not** hold a GOV_MIL capability badge (defense guard)
- OP Sepolia ETH for gas fees
- A separate wallet for the agent's operational use

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
PRIVATE_KEY=your_deployer_private_key
OP_SEPOLIA_RPC_URL=https://sepolia.optimism.io
AGENT_WALLET=0x_your_agent_operational_wallet
AGENT_URI=ipfs://QmYourAgentMetadata
```

## Running the Example

```bash
npx ts-node index.ts
```

## Code Walkthrough

### 1. Connect to Contract

```typescript
const agentIdentity = new ethers.Contract(
  AGENT_IDENTITY_ADDRESS,
  AgentIdentityABI,
  signer
);
```

### 2. Register Agent

```typescript
const tx = await agentIdentity.register(agentWallet, agentURI);
const receipt = await tx.wait();
// Agent ID is emitted in the AgentRegistered event
```

### 3. Set Metadata

```typescript
await agentIdentity.setMetadata(agentId, "name", "My Agent");
await agentIdentity.setMetadata(agentId, "model", "claude-opus-4-6");
await agentIdentity.setMetadata(agentId, "version", "1.0.0");
```

### 4. Verify Registration

```typescript
const [registrant, wallet, registeredAt, active] =
  await agentIdentity.getAgent(agentId);
```

## Expected Output

```
TAG IT Agent Registration Example

Step 1: Registering agent...
  Transaction: 0xabc...
  Agent ID: 1
  Status: ACTIVE

Step 2: Setting metadata...
  name = My Agent
  model = claude-opus-4-6
  version = 1.0.0

Step 3: Verifying registration...
  Agent ID: 1
  Registrant: 0x458B...
  Wallet: 0xDb8A...
  Active: true
  Token URI: ipfs://QmYourAgentMetadata

Done! Agent is registered and ready for feedback and validation.
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `MissingKYCIdentity` | Caller lacks KYC_L1 badge | Get identity badge via TAGITAccess |
| `DefenseGuardBlocked` | Caller holds GOV_MIL capability | Use a non-military wallet |
| `WalletAlreadyRegistered` | Agent wallet already in use | Use a different wallet or decommission the existing agent |
| `InvalidURI` | Empty URI string | Provide a valid IPFS URI |

## Next Steps

- [Validate Agent Example](../validate-agent/) — Submit agent for validation
- [TAGITAgentIdentity Docs](../../docs/contracts/agent-identity.md) — Full contract reference
- [Technosphere Architecture](../../docs/architecture/technosphere.md) — System overview
