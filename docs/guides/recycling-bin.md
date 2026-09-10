---
title: Recycling Bin Walkthrough (Planned)
description: Design for an unattended NFC recycling bin — not built yet
---

# Recycling Bin Walkthrough (Planned)

> **Planned — not built.** Nothing on this page is deployed. It documents the
> intended design for an unattended drop-off bin so implementation work has a
> clear target. See [Reader Ecosystem — Recycling Bin](../hardware/readers.md)
> for the hardware side and [Data Flow](../architecture/data-flow.md) for how
> this fits next to the app-based owner-actions flow.

## The idea

Today, recycling an asset goes through the TAG IT app: the owner requests it,
and a relayer executes it after a grace period (see
[Manage a Product from the TAG IT App](./owner-actions.md)). A recycling bin
is a second, physical path to the same outcome — for someone who wants to drop
an item off rather than use the app, with no wallet interaction at drop time.

## Planned hardware

- A Raspberry Pi as the bin's controller
- An ACS ACR1252U NFC reader (the same reader already supported on desktop —
  see [Reader Ecosystem](../hardware/readers.md))
- `tagit-nfc-bridge` running headless on the Pi, rather than pointed at an
  admin console in a browser

## Planned drop flow

1. An item is dropped in the bin and its chip passes over the reader.
2. The bin daemon reads the chip's SUN mirror — the same `picc`/`cmac` values
   a desktop tap produces (see [NFC Binding](../hardware/nfc-binding.md)).
3. The bin posts `POST /api/v1/agents/recycling/drop` with
   `{ binId, picc, cmac }`, signed with the bin's own agent key — not an
   owner's wallet, since nobody is expected to unlock a wallet at a physical
   bin.
4. Services verifies the SUN mirror. The rolling counter must have advanced
   since the last read, which is what proves an actual tap happened rather
   than a replayed value — the same guarantee behind every other TAG IT
   verification.
5. Services resolves the tag to its token, then recycles it through the
   relayer — the same on-chain call the app-based grace-period flow makes.
6. The registered owner is notified that their item was recycled.

## Open questions this design does not answer yet

- Whether a drop should have its own grace period / cancellation window,
  given there is no owner confirmation step at drop time.
- How a bin's agent key is provisioned and rotated in the field.
- What happens to an item dropped by someone who is not its owner.

## Related

- [Manage a Product from the TAG IT App](./owner-actions.md) — the live,
  app-based recycle path
- [Reader Ecosystem — Recycling Bin](../hardware/readers.md)
- [Data Flow](../architecture/data-flow.md)
- [Threat Model](../security/threat-model.md)
