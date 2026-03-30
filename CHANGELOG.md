# Changelog

All notable changes to TAG IT Network documentation are recorded here.

---

## [Unreleased]

### Added

- `docs/contracts/account-factory-core-tests.mdx` — Foundry unit test reference for `TAGITAccountFactory` (581-line suite: UUPS initialization, email verification PATCH-15, `createAccount`, `createAccountWithOwner`, deterministic addressing via email hash + salt, admin functions `setImplementation`/`setGovernor`/`setProtocolGuardian`/`setEmailVerifier`, fuzz coverage) and `TAGITCoreDemo` (320-line suite: asset minting, full MINTED→BOUND→ACTIVATED→CLAIMED→FLAGGED→RECYCLED lifecycle states, `changeState` transitions including FLAGGED→CLAIMED recovery, view functions, edge cases, fuzz coverage). 901 total test lines. GitHub Wiki: [`wiki/TAGITAccountFactory-Core-Test-Suite`](../wiki/TAGITAccountFactory-Core-Test-Suite). Notion: [Account Factory & Core Demo — Test Suite Overview](https://www.notion.so/3334e3e9a2d381e19b59d3440b762b19). Covers task [3334e3e9-a2d3-81e1-9b59-d3440b762b19] ([tagit-contracts PR #22](https://github.com/TAG-IT-NETWORK/tagit-contracts/pull/22)).

---

## [3.1.0] — 2026-02-05

### Changed

- Contract addresses updated for all 12 live OP Sepolia contracts in `docs/contracts/index.md`.

## [3.0.0] — 2026-01-02

### Changed

- Federated multi-repo edition; expanded to 15-contract architecture.

## [1.0.0] — 2025-12-11

### Added

- Initial documentation for TAG IT Network ORACULS stack.
