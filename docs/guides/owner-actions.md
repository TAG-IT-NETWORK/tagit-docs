---
title: Manage a Product from the TAG IT App
description: How an owner flags, lists, delists, or recycles their asset from the mobile app
---

# Manage a Product from the TAG IT App

Introduced September 2026. If you hold the wallet that owns an asset's token,
the app's product page shows a **Manage** section with actions that used to
require an API key or a support ticket. No gas, no separate on-chain
transaction from you — your wallet signs a short message, and a TAG IT relayer
carries out the change once it has checked that signature against the current
on-chain owner.

## What you can do

| Action | What it does |
|--------|--------------|
| Report lost or stolen | Flags the asset `FLAGGED` on-chain immediately |
| List for sale | Creates a marketplace listing with you as the seller |
| Remove from sale | Cancels an active listing |
| Recycle | Schedules the asset for permanent deactivation |
| Cancel recycling | Cancels a recycle that is still in its grace period |

## Walkthrough

1. Open the asset in the app and go to its **Manage** section.
2. Pick an action (for example, "Report lost or stolen") and, where asked,
   enter a reason or a resale price.
3. Confirm. The app prompts for your device's biometric or passcode check,
   then your wallet signs a message — never a transaction, and never anything
   outside this specific action shape.
4. The app sends the signed message to TAG IT services, which verifies the
   signature, confirms you are still the on-chain owner, and either executes
   the action immediately or schedules it.

## Recycling has a grace period

Recycling is permanent, so it is never instant from the app. Requesting it
schedules the recycle 24 hours out by default. Anytime before then, open the
same asset and choose **Cancel recycling** to stop it — the app shows the
scheduled time on the asset page. When the window elapses, a background job
re-checks that you still own the asset and then recycles it; if ownership
changed in the meantime (for example, you sold it), the scheduled recycle is
cancelled automatically instead of running.

## If something looks wrong

- **A flag you didn't request** — contact support. A wrongful flag is cleared
  through the admin console's resolve flow, not from the app.
- **An action was rejected** — the most common reason is that the app's
  wallet is not the asset's current on-chain owner (for example, the asset was
  since sold). The app surfaces the rejection reason it received.

## Under the hood

For the exact request/response shape, signed-message format, and error codes,
see [API Overview — Owner Actions](../api/overview.md). For the sequence
across the app, services, the relayer, and the chain, see
[Data Flow](../architecture/data-flow.md). For how a wrongful flag or a stolen
device is contained, see [Threat Model](../security/threat-model.md).
