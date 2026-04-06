# current-task.md

This file is written by the **Jira Agent** at the start of each pipeline run.
It is the single source of truth for the current ticket being worked on.
All downstream agents (Orchestrator, FE, BE, Tester) read this before doing anything.

---

## Active Ticket

```
Ticket:              —
Type:                —
Priority:            —
Status:              —
Summary:             —
Reporter:            —
Epic / Labels:       —
```

## Description

_No active ticket. Run `/jira-start NEX-<id>` to populate this file._

## Acceptance Criteria

- [ ] —

## Affected Modules

| Layer    | Path | Notes |
|----------|------|-------|
| Backend  | —    | —     |
| Frontend | —    | —     |

## Implementation Notes

_Added by Orchestrator after plan approval._

## Done Signal

- [ ] FE Agent: tsc ✓ lint ✓ build ✓
- [ ] BE Agent: tsc ✓ lint ✓ tests ✓
- [ ] Test Agent: coverage gates met
- [ ] Integrator: PR opened, ticket → Done
