# tagit-docs

> Official documentation for TAG IT Network — Web3 supply-chain authentication platform.

[![Docs](https://img.shields.io/badge/docs-live-brightgreen)](https://docs.tagit.network)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/tagit-network/tagit-docs.git
cd tagit-docs

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open http://localhost:3000 to view the docs.

## Documentation Structure

| Section | Description |
|---------|-------------|
| [Getting Started](./docs/getting-started/) | Installation, quickstart, first steps |
| [Architecture](./docs/architecture/) | System design, ORACULS stack, data flows |
| [Smart Contracts](./docs/contracts/) | Contract reference for all 6 modules |
| [API Reference](./docs/api/) | REST API documentation |
| [SDK Guides](./docs/sdk/) | JavaScript, Kotlin, Swift SDKs |
| [Examples](./examples/) | Working code examples |
| [Glossary](./docs/glossary.md) | Key terminology |

## TAG IT Network Repositories

### Core (6)
- `tagit-contracts` — Smart contracts
- `tagit-l2` — OP Stack rollup
- `tagit-bridge` — CCIP adapters
- `tagit-services` — Backend APIs
- `tagit-indexer` — Event indexing
- `tagit-security` — Audits & verification

### Support (6)
- `tagit-dashboard` — Admin console
- `tagit-mobile` — ORACULAR app
- `tagit-sdk` — SDKs & CLI
- `tagit-hardware` — NFC/PQC specs
- **`tagit-docs`** — Documentation (You are here)
- `tagit-governance` — SOPs & policies

## Development

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Lint markdown
npm run links      # Check broken links
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b docs/my-update`)
3. Commit your changes (`git commit -m 'docs: add X documentation'`)
4. Push to the branch (`git push origin docs/my-update`)
5. Open a Pull Request

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

Built with by [TAG IT Network](https://tagit.network)
