# TAG IT Network Documentation

Welcome to the official documentation for TAG IT Network — a Web3 supply-chain authentication platform.

## What is TAG IT?

TAG IT Network creates **Digital Twins** (NFTs) that represent physical assets, enabling:

- **Verifiable Authenticity** — Cryptographic proof that a product is genuine
- **Ownership Tracking** — Complete chain of custody from manufacture to end-user
- **Status Management** — Real-time asset state (active, flagged, recycled)

## Quick Links

- [Quickstart Guide](./getting-started/quickstart.md) — Get started in 5 minutes
- [Architecture Overview](./architecture/overview.md) — Understand the system design
- [Smart Contracts](./contracts/index.md) — Contract reference documentation
- [API Reference](./api/overview.md) — REST API documentation
- [SDK Guides](./sdk/overview.md) — Client library documentation

## The ORACULS Stack

TAG IT is built on the **ORACULS** (Oracle-Augmented Chain for Universal Logistics Security) stack:

| Layer | Component | Purpose |
|-------|-----------|---------|
| Applications | ORACULAR App, Dashboard | User interfaces |
| Gateway | tagit-services | API routing, auth, AI |
| Ledger | TAGIT L2 (OP Stack) | Asset state, transactions |
| Settlement | Ethereum L1 | Finality, escrow |
| Interop | Chainlink CCIP | Cross-chain messaging |

## Getting Help

- [Glossary](./glossary.md) — Key terminology
- [GitHub Issues](https://github.com/tagit-network) — Report bugs
- [Discord](https://discord.gg/tagit) — Community support
