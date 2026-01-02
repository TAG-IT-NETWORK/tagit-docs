---
title: Bug Bounty
description: Vulnerability disclosure and bug bounty program
---

# Bug Bounty Program

TAG IT Network's vulnerability disclosure and bounty program.

## Scope

### In Scope

| Asset | Description |
|-------|-------------|
| Smart Contracts | All deployed contracts on OP Sepolia/Mainnet |
| API | api.tagit.network |
| Web Apps | dashboard.tagit.network, verify.tagit.network |
| Mobile SDKs | @tagit/sdk, network.tagit:sdk, TAGITKit |

### Out of Scope

| Asset | Reason |
|-------|--------|
| Third-party services | Report to respective vendors |
| Social engineering | Not technical vulnerability |
| DoS via rate limiting | By design |
| Testnet issues | Limited impact |

## Severity Levels

### Critical (Up to $50,000)

- Direct theft of user funds
- Permanent loss of assets
- Smart contract upgrade compromise
- Private key exposure

**Examples:**
- Bypassing access control to drain treasury
- Manipulating asset ownership without authorization
- Breaking cryptographic primitives

### High ($10,000 - $25,000)

- Theft requiring user interaction
- Temporary DoS of critical services
- Privilege escalation
- Data breach of sensitive information

**Examples:**
- XSS leading to wallet compromise
- SQL injection exposing user data
- Unauthorized role assignment

### Medium ($2,500 - $10,000)

- Limited information disclosure
- Temporary service disruption
- Minor privilege escalation

**Examples:**
- Leaking non-sensitive user metadata
- Bypassing rate limits
- Session fixation

### Low ($500 - $2,500)

- Minor issues with limited impact
- Best practice violations

**Examples:**
- Missing security headers
- Verbose error messages
- Minor information leakage

## Submission Process

### 1. Report

Submit via: **security@tagit.network**

Include:
- Detailed description
- Steps to reproduce
- Proof of concept (if applicable)
- Impact assessment
- Your Ethereum address (for payment)

### 2. Review

| Stage | Timeline |
|-------|----------|
| Acknowledgment | 24 hours |
| Initial Assessment | 72 hours |
| Fix Development | Varies |
| Bounty Payment | 14 days after fix |

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

## Hall of Fame

| Researcher | Finding | Severity | Date |
|------------|---------|----------|------|
| *Coming soon* | - | - | - |

## Contact

- **Email:** security@tagit.network
- **PGP Key:** [Download](https://tagit.network/.well-known/security.txt)
- **Response Time:** 24 hours

## Related

- [Threat Model](./threat-model.md)
- [Security Checklist](./checklist.md)
