---
name: jira-start
description: >
  Triggers the jira-agent for a given ticket. Fetches the ticket, analyses requirements,
  implements the code changes, verifies with tsc + lint, and updates the ticket to In Review.
---

# /jira-start

Kicks off the full Jira → Code → Done pipeline via the `jira-agent`.

## Usage

```
/jira-start NEX-42
/jira-start NEX-42 --dry-run     ← analyse and plan only, no code written
```

## What happens

1. `jira-agent` reads `CLAUDE.local.md` for credentials
2. Fetches the ticket from Jira REST API
3. Prints a structured ticket summary for your review
4. Analyses which modules/files are affected
5. Plans the implementation (shown before any code is written)
6. Implements all changes
7. Runs `tsc --noEmit` + `lint` — must both pass
8. Transitions ticket to **In Review** and posts a completion comment
9. Prints final summary with changed files and ticket URL

## Dry-run mode

With `--dry-run`, the agent stops after Phase 3 (Plan) and prints exactly what it *would*
change — no files are touched, no ticket is updated. Useful for estimating scope before
committing to a ticket.

## Prerequisites

`CLAUDE.local.md` must contain:
```
JIRA_BASE_URL=https://<your-org>.atlassian.net
JIRA_EMAIL=<your-email>
JIRA_API_TOKEN=<your-api-token>
JIRA_PROJECT_KEY=NEX
```
