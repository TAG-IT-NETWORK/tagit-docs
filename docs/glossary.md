---
title: Glossary
description: Key terminology and definitions for TAG IT Network
---

# Glossary

Comprehensive definitions of key terms used in TAG IT Network documentation.

---

## A

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

### Digital Twin

A cryptographic NFT representing a physical asset's identity, state, and history. The on-chain counterpart to a physical product.

**Properties**:
- Unique token ID
- Bound to physical NFC chip
- Contains metadata (origin, authenticity, ownership history)
- Lifecycle state tracking

---

## E

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

## R

### Recycled

Terminal asset lifecycle state. Asset is permanently deactivated and cannot be recovered.

---

## T

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

*Last updated: 2025-12-12*
