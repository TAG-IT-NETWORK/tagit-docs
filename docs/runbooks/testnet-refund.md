---
title: "Runbook: Manual Testnet Refund"
description: Operator procedure for refunding USDC on failed testnet sales
---

# Runbook: Manual Testnet Refund

> **TESTNET-ONLY.** This is a manual, operator-driven procedure for Base Sepolia (84532) test USDC. It is **superseded at mainnet by escrow-based atomic settlement** (REQ-S-24 is a hard gate): on mainnet, buyer funds are never held in a treasury pending a manual refund — settle and payment are atomic, so this runbook must never be used against mainnet funds.

## When to run

A sale reaches `status = 'refund_due'` when the buyer's USDC payment to the sale treasury was verified on-chain but the subsequent `claim()` could not complete (e.g. claim tx reverted, token no longer claimable, relayer failure after payment verification). The buyer has paid; the asset was not delivered. The operator returns the funds manually.

> **Implementation note (as of 2026-08):** `refund_due` and `refunded` exist in the `sale_status` enum (`tagit-services/src/sale/schema.ts`), and the `sales` table has `refund_tx_hash`, but no code path yet writes `status='refund_due'` automatically — flagging a sale for refund is currently itself a manual step after triaging a failed settle.

## Prerequisites

- Read/write access to the `tagit-services` database (`sales` table).
- Operator wallet holding the `SALE_TREASURY` key (defaults to the relayer/deployer wallet when `SALE_TREASURY` is unset).
- Base Sepolia USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (6 decimals).

## Procedure

### 1. Query sales due for refund

```sql
SELECT id, token_id, buyer_wallet, payment_tx_hash, amount_usdc6, created_at
FROM sales
WHERE status = 'refund_due'
ORDER BY created_at;
```

For each row, confirm before sending anything:

- `payment_tx_hash` is a successful tx containing a USDC `Transfer` from `buyer_wallet` to the treasury for at least `amount_usdc6` (this is what settle verified).
- No `claim_tx_hash` succeeded for this sale (the buyer did not receive the asset).
- `refund_tx_hash` is NULL (not already refunded).

### 2. Send the refund

From the `SALE_TREASURY` wallet, send `amount_usdc6` (micro-USDC, 6 decimals) of Base Sepolia USDC back to `buyer_wallet`. Example with `cast`:

```bash
cast send 0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  "transfer(address,uint256)" <buyer_wallet> <amount_usdc6> \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $SALE_TREASURY_KEY
```

Wait for the receipt and record the tx hash.

### 3. Record the refund

```sql
UPDATE sales
SET refund_tx_hash = '<0xrefund_tx>',
    status = 'refunded'
WHERE id = <sale_id>
  AND status = 'refund_due'
  AND refund_tx_hash IS NULL;
```

The `AND status = 'refund_due' AND refund_tx_hash IS NULL` guard makes the update a no-op if another operator already processed the row — check the affected-row count is 1.

### 4. Verify

- Re-run the step 1 query: the row must no longer appear.
- Confirm the refund tx on the Base Sepolia explorer: USDC `Transfer` treasury → buyer for the exact `amount_usdc6`.

## Why this goes away at mainnet

The testnet flow verifies a direct buyer→treasury USDC transfer and then calls `claim()` as a separate transaction — a window exists where payment has landed but delivery fails. Mainnet settlement is escrow-based and atomic (REQ-S-24): payment and claim succeed or fail together, so a `refund_due` state cannot arise and manual treasury sends are prohibited.

## Related

- [Data Flow](../architecture/data-flow.md)
- [TAGITCore Contract](../contracts/tagit-core.md)
