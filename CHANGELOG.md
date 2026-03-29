# Changelog

All notable changes to TAG IT Network documentation are recorded here.

---

## [Unreleased]

### Added
- `docs/api/endpoints/metrics.mdx` — Full REST API reference for the PRD-017 KPI tracking service: 5 endpoints (`GET /metrics/kpis`, `GET /metrics/kpis/summary`, `GET /metrics/kpis/:name`, `POST /metrics/kpis/invalidate`, `GET /api/v1/metrics/prd017`), 6 KPI definitions, caching behaviour, Drizzle schema, and environment variable guide. Covers task [3314e3e9] ([tagit-services PR #3](https://github.com/TAG-IT-NETWORK/tagit-services/pull/3)).
- `docs/security/prd-017-slither-scan.mdx` — Slither 0.11.5 static analysis report for all PRD-017 contracts: 51 files, 163 contracts, 252 raw findings triaged to 4 High / 8 Medium / 12 Low / Informational. Includes pre-mainnet remediation action items and EVMbench score (850/1000). Covers task [3314e3e9] ([tagit-security PR #1](https://github.com/TAG-IT-NETWORK/tagit-security/pull/1)).
- `docs/indexer/wtag-voucher-subgraph.mdx` — Developer reference for the wTAG (`TAGITToken`) and Voucher (`VerificationEscrow`) subgraph schema: 10 new GraphQL entities, 10 event handler signatures, lifecycle states diagram (mermaid), sample queries, and Goldsky deployment guide. Covers task [3314e3e9] ([tagit-indexer PR #1](https://github.com/TAG-IT-NETWORK/tagit-indexer/pull/1)).
- `docs/contracts/ccip-bridge-adapter.mdx` — Full developer reference for `CCIPBridgeAdapter` and `WrappedTAGIT` (wTAG): dual-mode bridge (LOCK_UNLOCK / BURN_MINT), function signatures, event schemas, mermaid transfer-flow diagram, deployment guide, and testnet chain selectors. Covers task [3314e3e9] ([tagit-bridge PR #1](https://github.com/TAG-IT-NETWORK/tagit-bridge/pull/1)).

---

## [3.1.0] — 2026-02-05

### Changed
- Contract addresses updated for all 12 live OP Sepolia contracts in `docs/contracts/index.md`.

## [3.0.0] — 2026-01-02

### Changed
- Federated multi-repo edition; expanded to 15-contract architecture.

## [1.0.0] — 2025-12-11

### Added
- Initial `CLAUDE.md` for `tagit-docs`.
