# CLAUDE.local.md — Local Developer Overrides

This file is **not committed** to git. It overrides/extends `CLAUDE.md` with local
environment details, personal credentials pointers, and workflow preferences.

---

## Developer Identity

```
DEVELOPER_NAME=Muhammad Attzaz
DEVELOPER_ROLE=Full-Stack Engineer (Owner)
TIMEZONE=PKT (UTC+5)
```

---

## Local Service URLs

| Service   | URL                              |
|-----------|----------------------------------|
| Frontend  | http://localhost:3000            |
| Backend   | http://localhost:3001            |
| MongoDB   | see `backend/.env`               |
| Jira      | https://<your-org>.atlassian.net |

---

## Jira Credentials

> **Never commit this section.** Keep values here only — not in any tracked file.

```
JIRA_BASE_URL=https://<your-org>.atlassian.net
JIRA_PROJECT_KEY=NEX
JIRA_BOARD_ID=1
JIRA_EMAIL=<your-atlassian-email>
JIRA_API_TOKEN=<your-atlassian-api-token>
```

The `jira-agent` reads these values at the start of every run.
Get your API token at: https://id.atlassian.com/manage-profile/security/api-tokens

---

## Jira Workflow

Ticket status flow used by `jira-agent`:
```
To Do → In Progress (21) → In Review (31) → Done (41)
```

Issue type → Git prefix mapping:
| Jira type | Commit prefix |
|-----------|---------------|
| Story     | feat          |
| Bug       | fix           |
| Task      | chore         |

Sprint naming: `NEX Sprint <N>`

---

## Local Shortcuts

```bash
# Start full stack
cd backend  && npm run start:dev &
cd frontend && npm run dev

# Type-check (fast, no emit)
cd frontend && npx tsc --noEmit

# Pick up a Jira ticket and implement it
/jira-start NEX-<id>

# Dry-run: analyse only, no code written
/jira-start NEX-<id> --dry-run
```

---

## Personal Rules (override CLAUDE.md where stated)

- Do not auto-push; always confirm before `git push`
- Branch format: `feat/NEX-<id>-slug` or `fix/NEX-<id>-slug`
- PR title must include ticket key: `[NEX-42] Short description`
- `npx tsc --noEmit` must pass before every commit — no exceptions
- All modules are owned by this developer; no cross-team restrictions apply

---

## Notes

<!-- Scratch space — safe to clear -->
