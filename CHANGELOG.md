# Changelog

All notable changes to TAG IT Network documentation are recorded here.

---

## [Unreleased]

### Added
- `docs/token/wtag.mdx` — Full developer reference for `wTAG` (Wrapped TAG): ERC20Votes governance token wrapping TAGIT 1:1 for TAGITGovernor Token House voting. Covers `wrap()`, `unwrap()`, `mint()`, `grantMinter()` / `revokeMinter()` function signatures, ERC20Votes delegation API, event schemas, custom errors, UUPS upgrade wiring, mermaid integration diagram. Phase 3 (OP Sepolia). Covers task [3314e3e9] ([tagit-contracts PR #4](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/4)).
- `docs/token/voucher.mdx` — Full developer reference for `Voucher` (vTAG): non-transferable ERC-20 reward tokens issued by TAGITCore on qualifying lifecycle actions (activation, claiming). Covers `issue()`, `burnFrom()`, `redeem()` (vTAG → wTAG at configurable basis-point rate), `setRedemptionRate()`, `setRedemptionPaused()`, redemption formula, non-transferable `_update` override, VoucherProposal governance flow, event schemas, custom errors. Phase 3 (OP Sepolia). Covers task [3314e3e9] ([tagit-contracts PR #4](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/4)).
- `docs/contracts/base-sepolia-agent-suite.mdx` — Base Sepolia deployment reference for the ERC-8004 Agent Suite: live contract addresses (`TAGITAgentIdentity`, `TAGITAgentReputation`, `TAGITAgentValidation`), Basescan verification links, block number, wiring configuration, and post-deploy checklist. All 97 agent tests pass; contracts verified on Basescan. Covers task [3314e3e9] ([tagit-contracts PR #2](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/2)).
- `docs/guides/deploy-agent-suite.mdx` — Foundry deployment guide for the ERC-8004 Agent Suite (`TAGITAgentIdentity`, `TAGITAgentReputation`, `TAGITAgentValidation`): single-broadcast suite script (`DeployAgentSuite.s.sol`) and three standalone scripts with env var reference, post-deploy checklist, and all function signatures. Covers task [3314e3e9] ([tagit-contracts PR #1](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/1)).
- `docs/api/endpoints/metrics.mdx` — Full REST API reference for the PRD-017 KPI tracking service: 5 endpoints (`GET /metrics/kpis`, `GET /metrics/kpis/summary`, `GET /metrics/kpis/:name`, `POST /metrics/kpis/invalidate`, `GET /api/v1/metrics/prd017`), 6 KPI definitions, caching behaviour, Drizzle schema, and environment variable guide. Covers task [3314e3e9] ([tagit-services PR #3](https://github.com/TAG-IT-NETWORK/tagit-services/pull/3)).
- `docs/security/prd-017-slither-scan.mdx` — Slither 0.11.5 static analysis report for all PRD-017 contracts: 51 files, 163 contracts, 252 raw findings triaged to 4 High / 8 Medium / 12 Low / Informational. Includes pre-mainnet remediation action items and EVMbench score (850/1000). Covers task [3314e3e9] ([tagit-security PR #1](https://github.com/TAG-IT-NETWORK/tagit-security/pull/1)).
- `docs/indexer/wtag-voucher-subgraph.mdx` — Developer reference for the wTAG (`TAGITToken`) and Voucher (`VerificationEscrow`) subgraph schema: 10 new GraphQL entities, 10 event handler signatures, lifecycle states diagram (mermaid), sample queries, and Goldsky deployment guide. Covers task [3314e3e9] ([tagit-indexer PR #1](https://github.com/TAG-IT-NETWORK/tagit-indexer/pull/1)).
- `docs/contracts/ccip-bridge-adapter.mdx` — Full developer reference for `CCIPBridgeAdapter` and `WrappedTAGIT` (wTAG): dual-mode bridge (LOCK_UNLOCK / BURN_MINT), function signatures, event schemas, mermaid transfer-flow diagram, deployment guide, and testnet chain selectors. Covers task [3314e3e9] ([tagit-bridge PR #1](https://github.com/TAG-IT-NETWORK/tagit-bridge/pull/1)).
- `docs/sdk/typescript-sdk-agents.mdx` — Full developer reference for `@tagit/sdk` v0.1.0 TypeScript SDK: typed wrappers for wTAG (`wrap`/`unwrap`/ERC20Votes delegation), Voucher (`issue`/`redeem`/`burnFrom`), and all three ERC-8004 Agent contracts (`TAGITAgentIdentity`, `TAGITAgentReputation`, `TAGITAgentValidation`). Covers `createAgentClient()` factory, all read/write function signatures, event schemas, A2A JSON-RPC 2.0 client (`A2AClient`, `A2AClientPool`), CLI reference, per-chain address registry, zod validation schemas, and mermaid architecture diagram. Node.js ≥ 20, OP Sepolia (chain ID 11155420). Covers task [3314e3e9] ([tagit-sdk PR #3](https://github.com/TAG-IT-NETWORK/tagit-sdk/pull/3)).

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
