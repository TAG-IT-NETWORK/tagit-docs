---
title: Compliance
description: Security compliance frameworks and certifications
---

# Compliance

TAG IT Network compliance with security frameworks and regulations.

## Framework Mapping

### NIST Cybersecurity Framework

| Function | TAG IT Implementation |
|----------|----------------------|
| **Identify** | Asset inventory, risk assessments |
| **Protect** | BIDGES access control, encryption |
| **Detect** | Event monitoring, anomaly detection |
| **Respond** | Incident response, emergency pause |
| **Recover** | AIRP protocol, backup systems |

### CMMC (Cyber Maturity Model Certification)

For defense/government deployments (Tier 1: Sovereign):

| Level | Status | Requirements |
|-------|--------|--------------|
| Level 1 | ✅ Complete | Basic cyber hygiene |
| Level 2 | ✅ Complete | Intermediate cyber hygiene |
| Level 3 | 🔄 In Progress | Good cyber hygiene |
| Level 4 | 📋 Planned | Proactive |
| Level 5 | 📋 Planned | Advanced |

### FedRAMP

| Authorization | Status |
|---------------|--------|
| FedRAMP Ready | 📋 Planned 2026 |
| FedRAMP Moderate | 📋 Planned 2027 |
| FedRAMP High | Under evaluation |

## Data Protection

### GDPR Compliance

| Requirement | Implementation |
|-------------|----------------|
| Data Minimization | Only necessary data collected |
| Right to Access | Export functionality |
| Right to Erasure | Off-chain data deletion |
| Data Portability | Standard export formats |
| Consent | Explicit opt-in required |

### CCPA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Notice | Privacy policy disclosure |
| Access | Data export available |
| Deletion | Off-chain data removal |
| Opt-Out | No data selling |

## Certifications

### Current

| Certification | Scope | Status |
|--------------|-------|--------|
| SOC 2 Type I | Cloud services | ✅ Complete |
| ISO 27001 | ISMS | 🔄 In Progress |
| PCI DSS | Payment processing | N/A (no payment data) |

### Planned

| Certification | Scope | Timeline |
|--------------|-------|----------|
| SOC 2 Type II | Cloud services | 2025 Q2 |
| ISO 27001 | ISMS | 2025 Q3 |
| Common Criteria | Tier 1 chips | 2025 Q4 |

## Hosting Requirements

### U.S. Sovereign Cloud

For Tier 1 (Sovereign) deployments:

| Requirement | Implementation |
|-------------|----------------|
| Data Residency | U.S. only |
| Personnel | U.S. persons only |
| Provider | AWS GovCloud / Azure Gov |
| Encryption | FIPS 140-2 validated |

### Standard Deployments

| Requirement | Implementation |
|-------------|----------------|
| Data Residency | User selectable |
| Encryption | AES-256 at rest, TLS 1.3 in transit |
| Provider | Multi-cloud |

## Audit Reports

### Smart Contract Audits

| Auditor | Scope | Date | Report |
|---------|-------|------|--------|
| [TBD] | Core contracts | 2025 Q1 | Link TBD |
| [TBD] | Token contracts | 2025 Q1 | Link TBD |

### Infrastructure Audits

| Auditor | Scope | Date | Report |
|---------|-------|------|--------|
| [TBD] | Cloud infrastructure | 2025 Q2 | Link TBD |
| [TBD] | Penetration testing | 2025 Q2 | Link TBD |

## Related

- [Threat Model](./threat-model.md)
- [Bug Bounty](./bounty.md)
- [Security Checklist](./checklist.md)
