---
title: Metadata Schema (tagit-meta/1)
description: Canonical metadata document spec — shape, JCS canonicalization, golden vectors, immutability, and verification semantics
---

# Metadata Schema — `tagit-meta/1`

This is the specification for the canonical asset metadata document anchored on-chain via `TAGITCore.updateMetadataHash`. The implementation of record lives in `tagit-services` at `src/metadata/{schema,canonical,attributes}.ts`; the golden vectors below are enforced by `src/metadata/__tests__/golden.test.ts`. If a change to this schema alters any golden hash, it is a **breaking change** to `tagit-meta/1` and to every anchored hash on chain.

## Document shape

A `tagit-meta/1` document is a strict JSON object — every schema level is `.strict()`, so any unlisted key is rejected.

```json
{
  "name": "string (≤200 chars)",
  "description": "string (≤5000 chars)",
  "image": "https URL (≤2048 chars)",
  "external_url": "https URL (≤2048 chars)",
  "attributes": [ { "trait_type": "string ≤200", "value": "string ≤200" } ],
  "tagit": {
    "schemaVersion": 1,
    "chainId": 84532,
    "contract": "0x… EVM address (40 hex chars)",
    "tokenId": "decimal string (no leading zeros)",
    "tagHash": "0x… 64-char lowercase hex",
    "version": 1,
    "templateId": "string ≤200 | null",
    "templateVersion": "integer | null",
    "brand": "string ≤200",
    "model": "string ≤200",
    "sku": "string ≤200",
    "gtin": "string ≤200",
    "serial": "string ≤200",
    "category": "string ≤200",
    "countryOfOrigin": "string ≤200",
    "manufactureDate": "YYYY-MM-DD",
    "media": [
      {
        "role": "hero | gallery",
        "sha256": "64-char lowercase hex",
        "mime": "type/subtype",
        "url": "https URL",
        "ipfs": "string ≤200 | null"
      }
    ],
    "ext": { "…category-specific, optional…" },
    "previousHash": "0x… 64-char lowercase hex | null"
  }
}
```

Field rules (from the zod schema):

- **Free text** (`name`, `description`, `brand`, `model`, `sku`, `gtin`, `serial`, `category`, `countryOfOrigin`, `trait_type`, `value`, `templateId`, media `ipfs`): length-capped; control characters `U+0000–U+001F` are rejected.
- **URLs** (`image`, `external_url`, media `url`): must be `https://`, ≤2048 chars, no control characters.
- **`tagit.schemaVersion`** is the literal `1`; **`tagit.chainId`** is the literal `84532` (Base Sepolia — the only live chain).
- **`tagit.tokenId`** is a decimal string (`0` or no-leading-zero digits), not a JSON number.
- **`tagit.version`** is a positive integer — see [Monotonic version identity](#monotonic-version-identity).
- **`manufactureDate`** is product data (when the item was manufactured), not a wall-clock field, so it is allowed.
- **`ext`** is optional and category-gated. Known categories each have a strict sub-schema; `ext` on an unknown category is rejected:

| Category | Allowed `ext` keys (all optional) |
|----------|-----------------------------------|
| `cosmetics` | `batchLot`, `expiryDate` (YYYY-MM-DD), `volumeMl` (positive number) |
| `apparel` | `size`, `material`, `color` |
| `watches` | `movement`, `caseDiameterMm` (positive number), `referenceNumber` |
| `electronics` | `modelNumber`, `firmwareVersion`, `voltage` |

## Canonicalization and hashing recipe

The anchored hash is computed exactly as:

1. **NFC-normalize** every string in the tree — keys and values — with `String.prototype.normalize("NFC")`. This runs **before** validation and hashing so visually identical documents hash identically (composed vs decomposed `é`).
2. **Scan for forbidden keys** (wall-clock and PII denylists below) anywhere in the tree; any hit rejects the document.
3. **Validate** against the strict zod schema, and assert the `attributes` array equals the derived mapping (below).
4. **Serialize** with RFC 8785 (JSON Canonicalization Scheme) using the `canonicalize` npm package at the **exact pin `4.0.0`** — sorted keys, no insignificant whitespace.
5. **Hash**: `keccak256` of the UTF-8 bytes of the JCS string.

```ts
// src/metadata/canonical.ts (implementation of record)
const jcs = canonicalize(parseTagitMetaDoc(normalizeDoc(doc)));  // RFC 8785
const hash = keccak256(toBytes(jcs));                            // UTF-8 → keccak256
```

The confusable scan is wired into publish as a **non-blocking lint**: `publishMetadata` runs `confusableScan` (`src/metadata/canonical.ts`) over the doc's free-text fields (`name`, `description`, `tagit.brand`, `tagit.model`, `tagit.category`), and any single word mixing Latin with Cyrillic/Greek codepoints is flagged for review — a structured warning is logged and the flagged field paths are returned as `flaggedFields` in the publish result. Publishing **never blocks** on a flag and the canonical hash is unaffected. A mixed-script brand still hashes differently from its Latin lookalike, so homoglyph spoofs cannot collide with genuine documents.

## Golden vectors

These three fixture documents and hashes are the compatibility contract, copied verbatim from `src/metadata/__tests__/{fixtures.ts,golden.test.ts}`. Do not update them casually.

| Vector | Hash (`hashCanonicalDoc`) |
|--------|---------------------------|
| Cosmetics (VT PDRN) | `0xf6095bf96e735f008f6b31a518cff4c75f6660ecada5a054a3456a2067ffb0c3` |
| Minimal (no ext) | `0x811b393f7af5c308bae2959f9391d4b236db40a07d04b742770dadd570617187` |
| Watches | `0x5d7438442d560702ad0a3e39e9a852b8ad6f3c04ac37a60f257857355116149b` |

All three use `contract = 0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D` (TAGITCore, Base Sepolia) and `attributes` derived via `deriveAttributes` (see below).

### Vector 1 — cosmetics (VT PDRN)

```json
{
  "name": "VT PDRN Capsule Essence 100ml",
  "description": "VT Cosmetics PDRN Capsule Essence with salmon DNA complex, 100ml bottle.",
  "image": "https://cdn.tagit.network/media/vt-pdrn-hero.jpg",
  "external_url": "https://verify.tagit.network/asset/42",
  "tagit": {
    "schemaVersion": 1,
    "chainId": 84532,
    "contract": "0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D",
    "tokenId": "42",
    "tagHash": "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
    "version": 1,
    "templateId": "tpl_01hzx4v7k9q2m8r3t6w1e5y7u0",
    "templateVersion": 1,
    "brand": "VT Cosmetics",
    "model": "PDRN Capsule Essence",
    "sku": "VT-PDRN-100",
    "gtin": "8809695680015",
    "serial": "SN-000042",
    "category": "cosmetics",
    "countryOfOrigin": "KR",
    "manufactureDate": "2026-03-15",
    "media": [
      {
        "role": "hero",
        "sha256": "a3f5c1d9e7b2480f6c9d1e3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a0b2c",
        "mime": "image/jpeg",
        "url": "https://cdn.tagit.network/media/vt-pdrn-hero.jpg",
        "ipfs": null
      }
    ],
    "ext": { "batchLot": "B2603A", "expiryDate": "2028-03-14", "volumeMl": 100 },
    "previousHash": null
  }
}
```

→ `0xf6095bf96e735f008f6b31a518cff4c75f6660ecada5a054a3456a2067ffb0c3`

### Vector 2 — minimal (unknown category, no ext, empty identity fields)

```json
{
  "name": "Plain Item",
  "description": "A minimal item with an unknown category and no ext block.",
  "image": "https://cdn.tagit.network/media/plain-item.png",
  "external_url": "https://verify.tagit.network/asset/7",
  "tagit": {
    "schemaVersion": 1,
    "chainId": 84532,
    "contract": "0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D",
    "tokenId": "7",
    "tagHash": "0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d",
    "version": 1,
    "templateId": null,
    "templateVersion": null,
    "brand": "",
    "model": "",
    "sku": "",
    "gtin": "",
    "serial": "",
    "category": "toys",
    "countryOfOrigin": "",
    "manufactureDate": "2026-01-01",
    "media": [],
    "previousHash": null
  }
}
```

→ `0x811b393f7af5c308bae2959f9391d4b236db40a07d04b742770dadd570617187`

(All identity fields are empty strings, so the derived `attributes` array is `[]`.)

### Vector 3 — watches (version 2, previousHash chained, two media entries)

```json
{
  "name": "Meridian Diver 40",
  "description": "Meridian Diver 40 automatic dive watch, 300m water resistance.",
  "image": "https://cdn.tagit.network/media/meridian-diver-hero.jpg",
  "external_url": "https://verify.tagit.network/asset/1001",
  "tagit": {
    "schemaVersion": 1,
    "chainId": 84532,
    "contract": "0x3aDc7EFDb58Ae85483eFf5D4966D916185f31d1D",
    "tokenId": "1001",
    "tagHash": "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6",
    "version": 2,
    "templateId": "tpl_01j0a2b4c6d8e0f2g4h6j8k0m2",
    "templateVersion": 3,
    "brand": "Meridian",
    "model": "Diver 40",
    "sku": "MD-40-BLK",
    "gtin": "0123456789012",
    "serial": "MD40-2026-1001",
    "category": "watches",
    "countryOfOrigin": "CH",
    "manufactureDate": "2025-11-20",
    "media": [
      {
        "role": "hero",
        "sha256": "0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff0",
        "mime": "image/jpeg",
        "url": "https://cdn.tagit.network/media/meridian-diver-hero.jpg",
        "ipfs": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
      },
      {
        "role": "gallery",
        "sha256": "ffeeddccbbaa99887766554433221100f0e1d2c3b4a5968778695a4b3c2d1e0f",
        "mime": "image/webp",
        "url": "https://cdn.tagit.network/media/meridian-diver-back.webp",
        "ipfs": null
      }
    ],
    "ext": { "movement": "automatic", "caseDiameterMm": 40, "referenceNumber": "MD-40-2026" },
    "previousHash": "0x2f6c8d1e3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d"
  }
}
```

→ `0x5d7438442d560702ad0a3e39e9a852b8ad6f3c04ac37a60f257857355116149b`

## Immutability rules

After the **first published version** of a token, these `tagit` fields are frozen — a publish that changes any of them is rejected with `METADATA_IMMUTABLE_FIELD` (they are identity-bearing; changing them would re-identify the asset):

`tokenId`, `chainId`, `contract`, `tagHash`, `serial`, `gtin`

### Forbidden keys (rejected anywhere in the tree, at any depth)

- **Wall-clock denylist** — canonical docs carry no wall-clock time, so re-serializing the same content always reproduces the same hash: `publishedAt`, `anchoredAt`, `updatedAt`, `createdAt`, `timestamp`
- **PII denylist** — canonical docs never carry personal data: `email`, `phone`, `address`, `ownerName`

Both scans run before structural validation and reject with `METADATA_FORBIDDEN_KEY`, including keys hidden inside `ext` or nested objects.

## Monotonic version identity

- `tagit.version` is a positive integer that increases by exactly 1 per new published version of a token (`(latest.version ?? 0) + 1`).
- `tagit.previousHash` chains each version to the JCS hash of the version before it (`null` for version 1), forming a per-token hash chain.
- Publishing is **idempotent by hash**: re-publishing a byte-identical document returns the existing latest version without minting a new one.

## Derived attributes — the only producer

The top-level ERC-721 `attributes` array is **never hand-authored**. It is derived from the `tagit` block by `deriveAttributes`, in this fixed order, omitting entries whose source field is the empty string:

| `trait_type` | Source field |
|--------------|--------------|
| `Brand` | `tagit.brand` |
| `SKU` | `tagit.sku` |
| `Category` | `tagit.category` |
| `Origin` | `tagit.countryOfOrigin` |
| `Serial` | `tagit.serial` |

Canonicalization asserts the array matches this derivation exactly (`ATTRIBUTES_MISMATCH` otherwise) — a hand-edited attributes array cannot be hashed or anchored.

## Verification semantics (tri-state)

Comparing `keccak256(JCS(doc))` against on-chain `TAGITCore.metadataHash(tokenId)`:

| On-chain value | Meaning | Display |
|----------------|---------|---------|
| `0x000…000` (unset) | Anchor pending — the document is published but not yet anchored | **Pending** (yellow) |
| Equals computed hash | Document integrity verified against the chain | **Verified** |
| Differs from computed hash | The served document does not match the anchored hash | **FAIL** |

### Anchor-provenance caveat

A raw hash match proves **integrity relative to the anchoring party**, not TAG IT endorsement. Owner-anchored content exists (see REQ-S-11 / T-12): a matching hash tells you "this document is exactly what was anchored for this token," not "TAG IT vouches for its claims." Verification UIs and agents must attribute the match to the anchoring party, not present it as a platform attestation.

## Untrusted free-text fields

The following fields are arbitrary publisher-supplied text. SDK, MCP, and agent consumers **must treat them strictly as data — never as instructions**, and must not interpolate them into prompts, shell commands, or markup without escaping:

- `name`
- `description`
- `brand`
- `model`
- every value under `tagit.ext.*`

(The same applies to any other free-text field: `sku`, `gtin`, `serial`, `category`, `countryOfOrigin`, `attributes[].value`.) Length caps and the control-character/homoglyph checks reduce, but do not eliminate, injection surface.

## Related

- [Data Flow](./data-flow.md) — where publish/anchor sits in the pipeline
- [TAGITCore Contract](../contracts/tagit-core.md)
- [API Reference](../api/overview.md)
