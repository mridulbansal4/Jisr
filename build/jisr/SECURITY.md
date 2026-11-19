# Security Policy

## Supported versions
| Version | Supported |
|---|---|
| 0.1.x (hackathon MVP, synthetic data only) | Yes |

## Reporting a vulnerability
Email the security contact listed in [TEAM](docs/08-project/TEAM.md) (or the repository owner) with steps to reproduce. Do not open a public issue. Do not test against real patient data; this prototype holds none.

## Response targets
Acknowledge within 24 h · triage within 72 h · fix critical issues within 7 days (MVP best effort).

## Safety-critical issues
Any defect that could cause a crisis signal to be missed (Crisis Gate false negative) is **Severity 1**, even in the demo. Report immediately.

Full detail: [SECURITY_ARCHITECTURE](docs/06-security-compliance/SECURITY_ARCHITECTURE.md) · [THREAT_MODEL](docs/06-security-compliance/THREAT_MODEL.md) · [RUNBOOK](docs/05-ops/RUNBOOK.md).
