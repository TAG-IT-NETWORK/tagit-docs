---
title: Glossary
description: Key terminology and definitions for TAG IT Network
---

# Glossary

Comprehensive definitions of key terms used in TAG IT Network documentation.

---

## A

### Agent Wallet

The operational wallet address bound to an AI agent's on-chain identity. Verified via EIP-712 typed data signatures to prevent unauthorized binding.

**See also**: [TAGITAgentIdentity](./contracts/agent-identity.md), [Technosphere](./architecture/technosphere.md)

---

### AIRP

**Asset Identity Recovery Protocol**

The protocol for handling lost, stolen, or disputed assets. Includes quarantine, investigation, and resolution phases.

**See also**: [TAGITRecovery](./contracts/tagit-recovery.md)

---

### Activation

The process of verifying an NFC chip for the first time after binding, transitioning the asset from `BOUND` to `ACTIVATED` state.

---

## B

### BIDGES

**Badge-based Identity for Decentralized Governance and Enterprise Security**

The role-based access control system using ERC-1155 badge NFTs to represent permissions.

**See also**: [TAGITAccess](./contracts/tagit-access.md)

---

### Binding

The cryptographic process of linking a physical NFC chip to an on-chain Digital Twin NFT, creating an immutable association.

**Example**: A luxury watch manufacturer binds each watch's embedded NFC chip to its corresponding Digital Twin on the blockchain.

---

### Binding Ceremony

The complete process of establishing a cryptographic link between a physical asset's NFC chip and its on-chain Digital Twin.

---

## C

### CCIP

**Cross-Chain Interoperability Protocol**

Chainlink's protocol for secure cross-chain messaging and token transfers. Used by TAG IT for cross-chain verification.

---

### Challenge-Response

A cryptographic authentication protocol where:
1. Verifier sends a random challenge
2. Chip computes response using secret key
3. Verifier validates response

---

### Claimed

Asset lifecycle state indicating ownership has been transferred to an end user/consumer.

---

## D

### Defense-Grade Validation

A multi-party validation mode requiring **3-of-5** independent validator consensus. Used for military, government, and critical infrastructure agents where a single validator is insufficient.

**See also**: [TAGITAgentValidation](./contracts/agent-validation.md), [Technosphere](./architecture/technosphere.md)

---

### Digital Twin

A cryptographic NFT representing a physical asset's identity, state, and history. The on-chain counterpart to a physical product.

**Properties**:
- Unique token ID
- Bound to physical NFC chip
- Contains metadata (origin, authenticity, ownership history)
- Lifecycle state tracking

---

## E

### ERC-8004

**Trustless Agent Infrastructure Standard**

An Ethereum standard defining on-chain identity, reputation, and validation for AI agents. Implemented by TAG IT's Technosphere layer using soulbound ERC-721 identity, time-weighted feedback scoring, and multi-party proof verification.

**See also**: [Technosphere](./architecture/technosphere.md)

---

### EigenDA

**EigenLayer Data Availability**

The data availability layer used by TAGIT L2 for cost-effective, secure transaction data storage.

---

## F

### Flagged

Asset lifecycle state indicating the asset is frozen due to fraud, dispute, or recall. Flagged assets cannot be transferred or verified.

---

## M

### Minted

Initial asset lifecycle state. NFT exists on-chain but is not yet linked to a physical item.

---

## N

### NFC

**Near-Field Communication**

Short-range wireless technology used in TAG IT for physical asset authentication. Each asset contains a secure NFC chip.

---

## O

### OP Stack

**Optimism Stack**

The modular rollup framework used to build TAGIT L2. Provides Ethereum-equivalent security with lower costs.

---

### ORACULS

**Oracle-Augmented Chain for Universal Logistics Security**

The complete technology stack powering TAG IT Network, including L2, data availability, settlement, and interoperability layers.

---

### ORACULAR

The mobile scanner application for verifying assets via NFC. Available for iOS and Android.

---

## P

### PQC

**Post-Quantum Cryptography**

Cryptographic algorithms resistant to quantum computer attacks. Part of TAG IT's future-proofing roadmap.

---

## S

### Sage

TAG IT's primary analysis agent — the first AI agent registered in the Technosphere (Agent #1). Powered by Claude Opus 4.6, it provides blockchain intelligence and asset verification services.

**See also**: [Technosphere](./architecture/technosphere.md)

---

### Soulbound Token

A non-transferable NFT (following ERC-5192 principles) that permanently binds to the minting address. Used by TAGITAgentIdentity to ensure agent identities cannot be sold, traded, or duplicated.

**See also**: [TAGITAgentIdentity](./contracts/agent-identity.md)

---

## R

### Recycled

Terminal asset lifecycle state. Asset is permanently deactivated and cannot be recovered.

---

## T

### Technosphere

TAG IT's AI agent infrastructure layer built on the ERC-8004 standard. Enables AI agents to operate as first-class on-chain citizens with verifiable identity, trackable reputation, and multi-party validation.

**See also**: [Technosphere Architecture](./architecture/technosphere.md)

---

### Time-Weighted Scoring

A reputation algorithm where recent feedback carries more weight than older feedback. Uses the formula `weight = DECAY_PERIOD / (DECAY_PERIOD + age)` with a 90-day decay period. At 90 days, feedback contributes 50% weight; at 180 days, ~33%.

**See also**: [TAGITAgentReputation](./contracts/agent-reputation.md)

---

### TAGIT L2

The Layer 2 blockchain built on OP Stack where TAG IT smart contracts are deployed. Settles to Ethereum for security.

---

## V

### Verification

The process of authenticating an asset by:
1. Scanning NFC chip
2. Performing challenge-response
3. Validating on-chain binding
4. Returning authenticity proof

---

*Last updated: 2026-02-16*
