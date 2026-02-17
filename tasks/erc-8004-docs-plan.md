# ERC-8004 Agent Infrastructure — Documentation Plan

> **Created:** 2026-02-16
> **Phase:** Technosphere Phase 1
> **Status:** Planning
> **Contracts Repo:** `tagit-contracts` (deployed on OP Sepolia)

---

## Overview

Three new ERC-8004 smart contracts have been deployed to OP Sepolia as part of the Technosphere initiative. This plan covers all documentation required to integrate them into the existing docs site.

### Deployed Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| TAGITAgentIdentity | `0xA7f34FD595eBc397Fe04DcE012dbcf0fbbD2A78D` | ERC-721 soulbound agent registry |
| TAGITAgentReputation | `0x57CCa1974DFE29593FBD24fdAEE1cD614Bfd6E4a` | Feedback & time-weighted scoring |
| TAGITAgentValidation | `0x9806919185F98Bd07a64F7BC7F264e91939e86b7` | Multi-party proof verification (3-of-5) |

### Sage Agent #1

| Property | Value |
|----------|-------|
| Agent ID | 1 |
| Wallet | `0xDb8ACD440Ef32a4D23AD685Dd64aC386b0d3d63F` |
| Model | claude-opus-4-6 |
| Type | analysis |
| Status | Active |

---

## Documentation Deliverables

### DOC-01: Technosphere Architecture Page

**File:** `docs/architecture/technosphere.md`
**Priority:** High
**Estimated Size:** ~200 lines

**Content:**
- Technosphere vision — AI agents as first-class on-chain citizens
- ERC-8004 standard overview (identity, reputation, validation)
- How agents integrate with existing BIDGES access control
- Agent lifecycle state diagram (ACTIVE → SUSPENDED → DECOMMISSIONED)
- Validation flow diagram (request → responses → consensus → finalize)
- Reputation scoring explainer (time-weighted decay formula)
- Defense-grade vs standard validation (3-of-5 vs 1-of-1)
- Mermaid diagrams: agent registration flow, validation consensus, reputation scoring

**Dependencies:** None

---

### DOC-02: TAGITAgentIdentity Contract Reference

**File:** `docs/contracts/agent-identity.md`
**Priority:** High
**Estimated Size:** ~300 lines

**Content:**
- Contract overview, addresses, status table
- Contract details table (standard, inherits, license, solidity version)
- Agent lifecycle state diagram (AgentStatus enum)
- Soulbound enforcement explanation
- EIP-712 wallet verification flow
- Defense guard (GOV_MIL blocking)
- Full function reference:
  - `register()` — parameters, access control, events, SDK example
  - `setAgentURI()` — parameters, access control, events
  - `setMetadata()` — key-value metadata system
  - `setAgentWallet()` — EIP-712 signature verification
  - `suspendAgent()` / `reactivateAgent()` / `decommissionAgent()`
  - All view functions: `getAgent()`, `getAgentStatus()`, `getMetadata()`, etc.
- Events reference table
- Custom errors reference table
- Access control matrix
- Gas estimates table

**Dependencies:** None

---

### DOC-03: TAGITAgentReputation Contract Reference

**File:** `docs/contracts/agent-reputation.md`
**Priority:** High
**Estimated Size:** ~250 lines

**Content:**
- Contract overview, addresses, status table
- Contract details table
- Scoring algorithm deep-dive:
  - Time-weighted formula: `weight = DECAY_PERIOD / (DECAY_PERIOD + age)`
  - Scaling (×100 for precision)
  - 90-day decay period
- Anti-self-review mechanism
- Full function reference:
  - `giveFeedback()` — 1-5 rating, comment, KYC requirement
  - `revokeFeedback()` — reviewer-only revocation
  - `appendResponse()` — agent registrant responses
  - `getSummary()` — computed reputation summary
  - All view functions
- Events reference table
- Custom errors reference table
- Access control matrix

**Dependencies:** DOC-02 (references AgentIdentity)

---

### DOC-04: TAGITAgentValidation Contract Reference

**File:** `docs/contracts/agent-validation.md`
**Priority:** High
**Estimated Size:** ~280 lines

**Content:**
- Contract overview, addresses, status table
- Contract details table
- Validation flow diagram (request → response → consensus → finalize)
- Multi-party consensus explanation:
  - Standard mode (1-of-1)
  - Defense mode (3-of-5)
  - PASSING_THRESHOLD = 60
  - Request expiry (30 days)
- Validator reputation tracking (accuracy scoring)
- Full function reference:
  - `validationRequest()` — create request, defense flag
  - `validationResponse()` — submit score (0-100) + justification
  - `_finalize()` — auto-finalization logic
  - `getSummary()` / `getValidationStatus()` / `getValidatorStats()`
  - All view functions
- Events reference table
- Custom errors reference table
- Access control matrix

**Dependencies:** DOC-02 (references AgentIdentity)

---

### DOC-05: Update Contracts Index

**File:** `docs/contracts/index.md` (existing — update)
**Priority:** High
**Estimated Size:** ~30 lines added

**Changes:**
- Add "Agent Infrastructure (3)" section to Mermaid flowchart
- Add Agent contracts table with links to DOC-02/03/04
- Add OP Sepolia deployment addresses for all 3 agent contracts
- Update total contract count from 15 to 18

**Dependencies:** DOC-02, DOC-03, DOC-04

---

### DOC-06: Agent Registration Example

**File:** `examples/register-agent/README.md` + `examples/register-agent/index.ts`
**Priority:** Medium
**Estimated Size:** ~100 lines (README) + ~80 lines (TypeScript)

**Content:**
- Step-by-step agent registration example
- Prerequisites (KYC_L1 badge, funded wallet)
- TypeScript code: connect to contract, call register(), set metadata
- Verify registration with getAgent()
- Error handling for common failures (MissingKYCIdentity, DefenseGuardBlocked)

**Dependencies:** DOC-02

---

### DOC-07: Agent Validation Example

**File:** `examples/validate-agent/README.md` + `examples/validate-agent/index.ts`
**Priority:** Medium
**Estimated Size:** ~100 lines (README) + ~80 lines (TypeScript)

**Content:**
- Create a validation request (standard + defense mode)
- Submit validator responses with scores and justification
- Check finalization result
- Query validator stats

**Dependencies:** DOC-04

---

### DOC-08: Update Glossary

**File:** `docs/glossary.md` (existing — update)
**Priority:** Low
**Estimated Size:** ~40 lines added

**New Terms:**
- **ERC-8004** — Ethereum standard for Trustless Agent infrastructure
- **Sage** — TAG IT primary analysis agent (Agent #1)
- **Technosphere** — TAG IT's AI agent infrastructure layer
- **Soulbound Token** — Non-transferable NFT (ERC-5192 compliant)
- **Time-Weighted Scoring** — Reputation decay algorithm
- **Defense-Grade Validation** — 3-of-5 multi-party consensus
- **Agent Wallet** — Operational wallet bound to agent identity via EIP-712

**Dependencies:** None

---

### DOC-09: Update Architecture Overview

**File:** `docs/architecture/overview.md` (existing — update)
**Priority:** Medium
**Estimated Size:** ~20 lines added

**Changes:**
- Add Technosphere / Agent layer to system architecture diagram
- Reference to `technosphere.md` for full details
- Update ORACULS stack description to include AI agent capabilities

**Dependencies:** DOC-01

---

## Execution Order

```
Phase A (Foundation — can be parallel):
  DOC-01: Technosphere Architecture
  DOC-02: AgentIdentity Reference
  DOC-08: Glossary Updates

Phase B (Depends on Phase A):
  DOC-03: AgentReputation Reference
  DOC-04: AgentValidation Reference
  DOC-09: Architecture Overview Update

Phase C (Depends on Phase B):
  DOC-05: Contracts Index Update
  DOC-06: Registration Example
  DOC-07: Validation Example
```

## Verification

- [ ] `npm run lint` — No markdown linting errors
- [ ] `npm run links` — No broken internal links
- [ ] `npm run spell` — No spelling issues
- [ ] `npm run build` — Docusaurus builds successfully
- [ ] All Mermaid diagrams render correctly
- [ ] Contract addresses match deployed values
- [ ] Cross-references between new pages work
- [ ] Existing pages not broken by updates

## Notes

- Follow existing doc style: frontmatter with title/description, H2 sections, tables for parameters, Mermaid for diagrams
- All contract function docs should include: Parameters table, Returns, Access Control, Solidity signature, SDK example
- Use `@custom:security` annotations pattern from contracts NatSpec
- Keep deployment addresses up-to-date if redeployed
