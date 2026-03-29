# PRD-017 KPI Tracking Service

Developer reference for the `tagit-services` metrics module introduced in
[PR #3](https://github.com/TAG-IT-NETWORK/tagit-services/pull/3).

> **See also:**
> [Notion Wiki](https://www.notion.so/3314e3e9a2d38126b53ccc051c3865bb) ·
> [tagit-docs MDX](https://github.com/TAG-IT-NETWORK/tagit-docs/pull/5) ·
> [tagit-services PR #3](https://github.com/TAG-IT-NETWORK/tagit-services/pull/3)

---

## Overview

The metrics service tracks the six success KPIs defined in PRD §Success Metrics.
Data is sourced from the **tagit-indexer** subgraph across two chains (OP Sepolia,
Arbitrum Sepolia) and served through a TTL-cached REST API.

```
tagit-services
└── src/metrics/
    ├── aggregators.ts      — 6 KPI aggregator functions
    ├── cache.ts            — KpiCache<T> (in-process / Redis-ready)
    ├── index.ts            — public module barrel
    ├── prd017Metrics.ts    — legacy on-chain fetchPrd017Metrics()
    ├── router.ts           — Express router factory (createMetricsRouter)
    ├── schema.ts           — Drizzle ORM tables (kpi_snapshots, kpi_targets)
    └── subgraph-client.ts  — typed GraphQL client for both subgraphs
```

---

## KPI Definitions

| # | Name | Description | PRD Target |
|---|------|-------------|------------|
| 1 | `totalTagsRegistered` | Total BIDGES minted on Arbitrum core | 100+ |
| 2 | `uniqueWallets` | Unique addresses with non-zero wTAG balance | — |
| 3 | `totalScanEvents` | Total SUN message verification requests | — |
| 4 | `verificationSuccessRate` | % of SUN message validations that passed | — |
| 5 | `bridgeVolume` | Total escrow volume (USDC) bridged via OP Sepolia | — |
| 6 | `activeTagsRatio` | % of minted BIDGES in `ACTIVATED` / `CLAIMED` lifecycle states | — |

---

## Types

### `TimeWindow`

```ts
export type TimeWindow = "24h" | "7d" | "30d" | "all";
```

### `KpiResult`

```ts
export interface KpiResult {
  name: string;
  value: number;
  window: TimeWindow;
  breakdown?: Record<string, unknown>;
  computedAt: string; // ISO-8601
}
```

### `Prd017Metrics` (legacy endpoint)

```ts
export interface VoucherTierBreakdown {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface Prd017Metrics {
  uniqueAgentInteractions: number;
  wtagDistributedTotal: number;
  voucherNftsMintedByTier: VoucherTierBreakdown;
  chainsDeployedCount: number;
  securityIncidentCount: number;   // hardcoded 0; TODO ticket pending
  voucherConversionRate: number;   // 0–1 float
  computedAt: string;              // ISO-8601
}
```

---

## Aggregator Functions (`aggregators.ts`)

All aggregators are async, accept a `TimeWindow`, and return `KpiResult`.

```ts
export async function totalTagsRegistered(
  window?: TimeWindow
): Promise<KpiResult>

export async function uniqueWallets(
  window?: TimeWindow
): Promise<KpiResult>

export async function totalScanEvents(
  window?: TimeWindow
): Promise<KpiResult>

export async function verificationSuccessRate(
  window?: TimeWindow
): Promise<KpiResult>

export async function bridgeVolume(
  window?: TimeWindow
): Promise<KpiResult>

export async function activeTagsRatio(
  window?: TimeWindow
): Promise<KpiResult>

// Run all 6 aggregators and return array
export async function fetchAllKpis(
  window?: TimeWindow
): Promise<KpiResult[]>

// Named map for single-KPI lookups
export const KPI_AGGREGATORS: Record<
  string,
  (window: TimeWindow) => Promise<KpiResult>
>
```

---

## Subgraph Client (`subgraph-client.ts`)

### Subgraph Endpoints

| Variable | Chain |
|----------|-------|
| `SUBGRAPH_URL_OP_SEPOLIA` | OP Sepolia |
| `SUBGRAPH_URL_ARB_SEPOLIA` | Arbitrum Sepolia |

### GraphQL Query Functions

```ts
export async function querySubgraph<T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T>

export async function fetchProtocol():
  Promise<ProtocolData["protocol"]>

export async function fetchCoreProtocol():
  Promise<CoreProtocolData["coreProtocol"]>

// Paginates all wTAG holders (⚠ no MAX_PAGES guard — known issue, PR #3)
export async function fetchUniqueWalletCount():
  Promise<number>

// Paginates agents active since `sinceTimestamp`
export async function fetchActiveAgentsSince(
  sinceTimestamp: number
): Promise<AgentPage["agents"]>
```

### Response Interfaces

```ts
export interface ProtocolData {
  protocol: {
    id: string;
    totalValidations: string;
    successfulValidations: string;
    totalEscrowVolume: string;
  } | null;
}

export interface CoreProtocolData {
  coreProtocol: {
    id: string;
    totalAssets: string;
    activatedAssets: string;
    claimedAssets: string;
  } | null;
}

export interface WTagAccountPage {
  accounts: Array<{ id: string; balance: string }>;
}

export interface AgentPage {
  agents: Array<{ id: string; lastActiveSince: string }>;
}
```

---

## Cache (`cache.ts`)

```ts
export interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Unix ms
}

export class KpiCache<T = unknown> {
  constructor(ttlMs?: number)       // default 300_000 ms (5 min)
  get(key: string): T | undefined
  set(key: string, value: T): void
  delete(key: string): void
  clear(): void
}

export const kpiCache: KpiCache     // singleton, shared by router
```

Cache key format: `kpi:<name>:<window>` (e.g. `kpi:uniqueWallets:7d`)

---

## REST Endpoints (`router.ts`)

Router is mounted in `src/server.ts` behind auth middleware via `createMetricsRouter()`.

```ts
export function createMetricsRouter(): Router
```

### Endpoint Summary

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/metrics/kpis` | All 6 KPIs for a time window |
| `GET` | `/metrics/kpis/summary` | Dashboard rollup object |
| `GET` | `/metrics/kpis/:name` | Single KPI by name |
| `POST` | `/metrics/kpis/invalidate` | Flush cache (⚠ admin only — pending role guard) |
| `GET` | `/api/v1/metrics/prd017` | Legacy on-chain PRD-017 shape |

### Query Parameters

| Parameter | Type | Default | Valid Values |
|-----------|------|---------|--------------|
| `window` | string | `all` | `24h`, `7d`, `30d`, `all` |

### Response Shapes

**`GET /metrics/kpis`**
```json
{
  "kpis": [KpiResult, ...],
  "cached": false
}
```

**`GET /metrics/kpis/summary`**
```json
{
  "window": "30d",
  "totalTagsRegistered": 312,
  "uniqueWallets": 87,
  "totalScanEvents": 1042,
  "verificationSuccessRate": 0.94,
  "bridgeVolume": 4200.50,
  "activeTagsRatio": 0.71,
  "computedAt": "...",
  "cached": false
}
```

**`GET /metrics/kpis/:name`**
```json
{
  "name": "uniqueWallets",
  "value": 87,
  "window": "all",
  "breakdown": null,
  "computedAt": "...",
  "cached": false
}
```

---

## Database Schema (`schema.ts`)

Managed via **Drizzle ORM**. Run `pnpm drizzle-kit push` to apply migrations.

```ts
export const kpiSnapshots = pgTable("kpi_snapshots", {
  id:          serial("id").primaryKey(),
  name:        text("name").notNull(),
  value:       numeric("value").notNull(),
  window:      text("window").notNull(),
  breakdown:   jsonb("breakdown"),
  computedAt:  timestamp("computed_at", { withTimezone: true })
               .defaultNow().notNull(),
});

export const kpiTargets = pgTable("kpi_targets", {
  name:      text("name").primaryKey(),
  target:    numeric("target").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
             .defaultNow().notNull(),
});

export type KpiSnapshot    = typeof kpiSnapshots.$inferSelect;
export type NewKpiSnapshot = typeof kpiSnapshots.$inferInsert;
export type KpiTarget      = typeof kpiTargets.$inferSelect;
export type NewKpiTarget   = typeof kpiTargets.$inferInsert;
```

---

## Architecture Diagram

```mermaid
graph TD
    subgraph tagit-services
        R[router.ts\ncreateMetricsRouter] -->|cache miss| A[aggregators.ts\nfetchAllKpis]
        R -->|cache hit| C[KpiCache\n300s TTL]
        A --> C
        A --> SC[subgraph-client.ts]
        A --> P[prd017Metrics.ts\nlegacy on-chain]
        R -->|POST /invalidate| C
    end

    subgraph tagit-indexer subgraphs
        SC -->|GraphQL| OS[OP Sepolia\ntagit-bridge / tagit-token]
        SC -->|GraphQL| AS[Arb Sepolia\ntagit-core]
    end

    subgraph Postgres
        R -.->|persist snapshot| DB[(kpi_snapshots\nkpi_targets)]
    end

    API[REST Client / Dashboard] -->|GET /metrics/kpis| R
```

---

## Known Issues / Open Items (from PR #3 review)

| Severity | File | Issue |
|----------|------|-------|
| MEDIUM | `router.ts:156` | `POST /metrics/kpis/invalidate` has no admin-role guard (DoS vector) |
| MEDIUM | `subgraph-client.ts:196` | Unbounded pagination in `fetchUniqueWalletCount()` — add `MAX_PAGES` guard |
| MEDIUM | `tagit-indexer` handlers | `voucher.ts` / `wtag.ts` SubGraph handlers have zero test coverage |
| LOW | `subgraph-client.ts:10` | Production Goldsky URLs hardcoded as fallback; make env-var required |
| LOW | `prd017Metrics.ts:140` | `securityIncidents` hardcoded to `0`; add TODO ticket reference |
| LOW | `router.ts:22` | User-supplied `window` reflected verbatim in error messages |

---

## Test Coverage

```
421 tests passing across 39 files
├── Unit tests (24)
│   ├── test/unit/metrics/aggregators.test.ts
│   ├── test/unit/metrics/cache.test.ts
│   └── test/unit/metrics/prd017Metrics.test.ts
└── Integration tests (10)
    └── test/integration/metrics-flow.test.ts
```

---

## Environment Variables

```env
# Required for subgraph queries
SUBGRAPH_URL_OP_SEPOLIA=https://api.goldsky.com/api/public/<slug>/op-sepolia/gn
SUBGRAPH_URL_ARB_SEPOLIA=https://api.goldsky.com/api/public/<slug>/arb-sepolia/gn

# Required for legacy prd017 endpoint (viem)
ARB_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
TAGIT_CORE_ADDRESS=0x...

# Postgres (Drizzle)
DATABASE_URL=postgres://user:pass@host/tagit
```

---

## Related

- [Notion Wiki — PRD-017 KPI Tracking](https://www.notion.so/3314e3e9a2d38126b53ccc051c3865bb)
- [tagit-docs MDX — metrics.mdx](https://github.com/TAG-IT-NETWORK/tagit-docs/pull/5)
- [tagit-services PR #3](https://github.com/TAG-IT-NETWORK/tagit-services/pull/3)
- [wTAG + Voucher Subgraph (GitHub Wiki)](https://github.com/TAG-IT-NETWORK/tagit-indexer/wiki/wTAG-Voucher-Subgraph)
