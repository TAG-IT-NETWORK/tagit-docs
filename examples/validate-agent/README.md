# Validate Agent Example

This example demonstrates the full validation flow for an AI agent using TAGITAgentValidation.

## Overview

The validation flow proves an agent meets quality standards through independent review:

1. **Request** — Create a validation request (standard or defense-grade)
2. **Respond** — Validators submit scores (0-100) with justifications
3. **Finalize** — Contract auto-finalizes when quorum is met
4. **Query** — Check the agent's validation status and validator stats

## Prerequisites

- Node.js 18+
- A registered agent on TAGITAgentIdentity (see [Register Agent](../register-agent/))
- **Requester** wallet with KYC_L1 identity badge
- **Validator** wallet(s) with AGENT_VALIDATOR capability badge
- OP Sepolia ETH for gas fees

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
REQUESTER_PRIVATE_KEY=your_requester_private_key
VALIDATOR_PRIVATE_KEY=your_validator_private_key
OP_SEPOLIA_RPC_URL=https://sepolia.optimism.io
AGENT_ID=1
```

## Running the Example

```bash
npx ts-node index.ts
```

## Code Walkthrough

### 1. Create Validation Request

```typescript
// Standard validation (1-of-1 quorum)
const tx = await agentValidation.validationRequest(agentId, false);

// Defense-grade validation (3-of-5 quorum)
const tx = await agentValidation.validationRequest(agentId, true);
```

### 2. Submit Validator Response

```typescript
await agentValidation.validationResponse(
  requestId,
  85,  // score out of 100
  "Agent demonstrates strong analysis accuracy and timely responses."
);
```

### 3. Check Finalization

```typescript
const request = await agentValidation.getRequest(requestId);
// request.status: 2 = VALIDATED, 3 = REJECTED
```

### 4. Query Validation Status

```typescript
const [isValidated, latestScore, lastValidatedAt] =
  await agentValidation.getValidationStatus(agentId);
```

## Expected Output

```
TAG IT Agent Validation Example

Step 1: Creating validation request...
  Transaction: 0xabc...
  Request ID: 1
  Mode: Standard (1-of-1)

Step 2: Submitting validator response...
  Transaction: 0xdef...
  Score: 85/100
  Justification: Agent demonstrates strong analysis accuracy...

Step 3: Checking finalization...
  Status: VALIDATED
  Final Score: 85
  Passed: true

Step 4: Querying agent validation summary...
  Is Validated: true
  Latest Score: 85
  Total Requests: 1
  Passed: 1 | Failed: 0

Step 5: Checking validator stats...
  Total Responses: 1
  Accurate Responses: 1

Done! Agent has been validated.
```

## Validation Modes

| Mode | Quorum | Passing Score | Use Case |
|------|--------|--------------|----------|
| Standard | 1-of-1 | >= 60 | General-purpose agents |
| Defense | 3-of-5 | >= 60 | Military, government, critical infrastructure |

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `NotValidator` | Caller lacks AGENT_VALIDATOR badge | Get capability badge via TAGITAccess |
| `AlreadyResponded` | Validator already responded | Each validator can only respond once per request |
| `RequestExpired` | Request older than 30 days | Create a new validation request |
| `AgentNotActive` | Agent is suspended or decommissioned | Agent must be ACTIVE to validate |

## Next Steps

- [Register Agent Example](../register-agent/) — Register an agent first
- [TAGITAgentValidation Docs](../../docs/contracts/agent-validation.md) — Full contract reference
- [Technosphere Architecture](../../docs/architecture/technosphere.md) — System overview
