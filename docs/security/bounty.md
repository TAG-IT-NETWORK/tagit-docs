---
title: Vulnerability Disclosure
description: How to report a security vulnerability in TAG IT Network
---

# Vulnerability Disclosure

How to report a security vulnerability in TAG IT Network, and what we do with it.

> **There is no bug bounty programme. We do not pay for reports today.**
>
> Revisions of this page before 2026-08-24 advertised paid tiers — up to $50,000 for
> Critical, and a "Bounty Payment, 14 days after fix" — and asked reporters for an
> Ethereum address. **No such programme has ever existed and none of those figures were
> ever funded.** That was our error, it was public, and we are correcting it here rather
> than deleting the page. If you sent us a report while that text was up, say so and we
> will talk to you directly.
>
> `tagit-contracts/SECURITY.md` is the authoritative policy and has always said the same
> thing this page now says. Where the two ever disagree, SECURITY.md wins.
>
> If a paid programme is launched before mainnet, it will be announced in SECURITY.md
> first.

## Scope

### In Scope

| Asset | Description |
|-------|-------------|
| Smart Contracts | Deployed contracts on Base Sepolia (chain 84532) — see [contract index](../contracts/index.md) |
| API | `api.tagit.network` — `/health` and `/verify` |
| Verification service | `verify.tagit.network` — `/api/verify`, `/api/dpp/*`, and the public asset/tag pages |
| SDK source | [tagit-sdk](https://github.com/TAG-IT-NETWORK/tagit-sdk) — source only; not published to any registry |

> **Not in scope because they do not exist.** Earlier revisions of this page listed all
> three as bounty targets:
>
> - `dashboard.tagit.network` does not exist — the host does not resolve.
> - The Kotlin coordinate `network.tagit:sdk` does not exist — nothing is published to
>   Maven Central under that group.
> - The Swift packages `TAGITKit` and `TagItSDK` do not exist, and no `tagit-swift`
>   repository exists under any TAG IT org.
>
> Do not spend time probing them.

### Out of Scope

| Asset | Reason |
|-------|--------|
| Third-party services | Report to respective vendors |
| Social engineering | Not technical vulnerability |
| DoS via rate limiting | By design |
| Testnet issues | Limited impact |

## Severity Levels

We use these to prioritise our own work and to tell you how we assessed your report.
They carry no payment.

### Critical

- Direct theft of user funds
- Permanent loss of assets
- Smart contract upgrade compromise
- Private key exposure

**Examples:**
- Bypassing access control to drain treasury
- Manipulating asset ownership without authorization
- Breaking cryptographic primitives

### High

- Theft requiring user interaction
- Temporary DoS of critical services
- Privilege escalation
- Data breach of sensitive information

**Examples:**
- XSS leading to wallet compromise
- SQL injection exposing user data
- Unauthorized role assignment

### Medium

- Limited information disclosure
- Temporary service disruption
- Minor privilege escalation

**Examples:**
- Leaking non-sensitive user metadata
- Bypassing rate limits
- Session fixation

### Low

- Minor issues with limited impact
- Best practice violations

**Examples:**
- Missing security headers
- Verbose error messages
- Minor information leakage

## Submission Process

### 1. Report

Submit via: **info@tagit.network**

Include:
- Detailed description
- Steps to reproduce
- Proof of concept (if applicable)
- Impact assessment
- How you want to be credited — name, handle, organisation, or not at all

### 2. Review

| Stage | Target |
|-------|--------|
| Acknowledgement | 72 hours — a human confirms receipt and gives you a tracking reference |
| Initial triage | 7 calendar days — we reproduce it or tell you we could not, with our severity assessment and reasoning |
| Fix or plan | 30 days for Critical/High; 90 days for Medium/Low |
| Public disclosure | by mutual agreement, default 90 days after triage |

These are commitments, not measurements. If we miss one we will tell you we missed it
rather than go quiet. The full version, including safe harbour, is in
[SECURITY.md](https://github.com/TAG-IT-NETWORK/tagit-contracts/blob/main/SECURITY.md).

### 3. Disclosure

- Coordinated disclosure after fix
- Credit in security advisory (if desired)
- No public disclosure before fix

## Rules

### Eligibility

✅ **Allowed:**
- Testing on testnet
- Local testing environments
- Reviewing public source code

❌ **Not Allowed:**
- Testing on mainnet with real funds
- Social engineering
- Physical attacks
- Accessing others' data
- DoS attacks

### Safe Harbor

Researchers acting in good faith are protected from legal action when:
- Following responsible disclosure
- Not accessing others' data
- Not disrupting services
- Reporting promptly

## Credit

We cannot pay, so we are careful about the one thing we can give.

Confirmed reports are added to
[KNOWN-ISSUES.md](https://github.com/TAG-IT-NETWORK/tagit-contracts/blob/main/KNOWN-ISSUES.md)
with attribution, in the same public document where we disclose the defects we found
ourselves. Tell us how you want to be credited — name, handle, organisation, or not at
all. If you would rather not be named, say so and we will write it up without you.

| Researcher | Finding | Severity | Date |
|------------|---------|----------|------|
| *None yet* | - | - | - |

## Contact

- **Email:** info@tagit.network — monitored, and the address to use.
- **`security@tagit.network` is not currently reliable.** It was published here and in
  every repo SECURITY.md, and we have confirmed reports of it bouncing. Use
  `info@tagit.network` instead. `disclosure@` and `emergency@` have appeared in older
  documentation and have never existed at all.
- **PGP Key:** not yet published. There is no `security.txt` — every
  `.well-known/security.txt` under the tagit.network domains returns 404 as of
  2026-07-27. Request the key by email.
- **Response time:** 72 hours to acknowledge.

## Related

- [Threat Model](./threat-model.md)
- [Security Checklist](./checklist.md)
