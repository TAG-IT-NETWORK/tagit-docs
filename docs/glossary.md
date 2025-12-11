# Glossary

Key terminology used throughout TAG IT Network documentation.

---

## A

### AIRP

**Definition**: Asset Identity Recovery Protocol — the process for handling lost, stolen, or disputed assets.

**Category**: Protocol

**See also**: [TAGITRecovery](./contracts/tagit-recovery.md), [FLAGGED State](#flagged)

---

## B

### BIDGES

**Definition**: Badge-based Identity for Decentralized Governance and Enterprise Security — the role and permission system used across TAG IT.

**Category**: Protocol

**See also**: [TAGITAccess](./contracts/tagit-access.md)

### Binding

**Definition**: The cryptographic process of linking a physical NFC chip to an on-chain Digital Twin NFT.

**Category**: Technical

**Example**: When a manufacturer binds a chip to a product, they call `bind(tokenId, chipId, signature)`.

**See also**: [Digital Twin](#digital-twin), [TAGITCore](./contracts/tagit-core.md)

---

## D

### Digital Twin

**Definition**: An NFT (ERC-721) that represents a physical asset's on-chain identity, state, and history.

**Category**: Technical

**See also**: [Binding](#binding), [Asset Lifecycle](#asset-lifecycle)

---

## F

### FLAGGED

**Definition**: An asset state indicating the item is frozen due to fraud, dispute, or recall.

**Category**: Protocol

**See also**: [Asset Lifecycle](#asset-lifecycle), [AIRP](#airp)

---

## O

### ORACULS

**Definition**: Oracle-Augmented Chain for Universal Logistics Security — the full technology stack name for TAG IT Network.

**Category**: Technical

### ORACULAR

**Definition**: The mobile scanner application used to verify assets via NFC.

**Category**: Product

**See also**: [Verification](#verification)

---

## P

### PQC

**Definition**: Post-Quantum Cryptography — future cryptographic algorithms designed to resist quantum computer attacks.

**Category**: Technical

---

## V

### Verification

**Definition**: A challenge-response proof that confirms a physical NFC chip matches its on-chain Digital Twin record.

**Category**: Technical

**See also**: [ORACULAR](#oracular), [TAGITCore](./contracts/tagit-core.md)
