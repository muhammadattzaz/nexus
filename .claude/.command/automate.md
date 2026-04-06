# Automated Development Pipeline

This file defines the end-to-end agentic workflow for the NexusAI project.
Each layer is triggered by the previous one. No layer starts until the one above it signals done.

---

```
                        ┌─────────────────────────┐
     User / PM Input ──▶│       Jira Agent         │  Layer 0 — Input
                        │                          │
                        │  • Reads ticket(s) via   │
                        │    Jira REST API / MCP   │
                        │  • Parses summary, AC,   │
                        │    type, priority, epic  │
                        │  • Writes current-task.md│
                        └────────────┬─────────────┘
                                     │
                          Layer 1 — Ticket Ingestion
                                     │
                                     ▼
                        ┌─────────────────────────────────────────────┐
                        │               Orchestrator                   │  Layer 2 — Orchestration
                        │                                              │
                        │  Reads: CLAUDE.md + CLAUDE.local.md          │
                        │         + current-task.md                    │
                        │                                              │
                        │  ┌────────────────┐  ┌──────────────────┐  │
                        │  │ Reads scope    │  │ Decides subtasks │  │
                        │  │ + contract     │  │ FE + BE + tests  │  │
                        │  └────────────────┘  └──────────────────┘  │
                        │                                              │
                        │  ┌──────────────────────────────────────┐  │
                        │  │   ⏸ Waits for your plan approval     │  │
                        │  └──────────────────────────────────────┘  │
                        └───────────────────┬─────────────────────────┘
                                            │
                             Layer 3 — Contract + Parallel Execution
                                            │
                                            ▼
                        ┌─────────────────────────────────┐
                        │          api-contract.md         │
                        │                                  │
                        │  Source of truth:                │
                        │  • Endpoint paths + methods      │
                        │  • Request / response shapes     │
                        │  • Error codes + status codes    │
                        │                                  │
                        │  Both FE + BE agents read this   │
                        │  before writing any code         │
                        └──────────┬──────────────┬────────┘
                                   │              │
                          parallel │              │ parallel
                                   ▼              ▼
               ┌──────────────────────┐  ┌──────────────────────┐
               │       FE Agent       │  │       BE Agent        │
               │                      │  │                       │
               │  Next.js · TypeScript│  │  NestJS · Mongoose    │
               │  Tailwind · Radix UI │  │  MongoDB · JWT        │
               │  Filesystem · Git    │  │  Filesystem · Git     │
               │  npm · MSW           │  │  npm · mongo shell    │
               │                      │  │                       │
               │  Done signal:        │  │  Done signal:         │
               │  tsc    ✓            │  │  tsc    ✓             │
               │  lint   ✓            │  │  lint   ✓             │
               │  tests  ✓            │  │  tests  ✓             │
               │  build  ✓            │  │  schema migration ✓   │
               └──────────┬───────────┘  └────────────┬──────────┘
                          │                            │
                          └────────────┬───────────────┘
                                       │
                          Both done signal · Layer 4
                                       │
                                       ▼
                        ┌──────────────────────────────────┐
                        │           Test Agent              │  Layer 4 — QA
                        │                                   │
                        │  • READ access only               │
                        │  • Writes ONLY test files         │
                        │                                   │
                        │  Test types:                      │
                        │  • Unit      (FE + BE)            │
                        │  • Integration                    │
                        │  • E2E       (Playwright)         │
                        │                                   │
                        │  Coverage gates:                  │
                        │  Services     ≥ 90 %              │
                        │  Controllers  ≥ 80 %              │
                        │  Components   ≥ 70 %              │
                        └──────────────┬────────────────────┘
                                       │
                          Layer 5 — Integration Signal
                                       │
                                       ▼
                        ┌──────────────────────────────────┐
                        │         Integrator Agent          │  Layer 5 — Ship
                        │                                   │
                        │  • Merges FE + BE branches        │
                        │  • Resolves conflicts             │
                        │  • Runs full build                │
                        │  • Opens PR with summary          │
                        │  • Updates Jira ticket → Done     │
                        │  • Posts completion comment       │
                        └──────────────────────────────────┘
```

---

## Layer Responsibilities

### Layer 0 — Input
User or PM provides a Jira ticket key (e.g. `NEX-42`).

### Layer 1 — Jira Agent (`jira-agent`)
- Fetches ticket via Jira REST API using credentials from `CLAUDE.local.md`
- Extracts: summary, description, acceptance criteria, type, priority, labels
- Writes structured output to `.claude/context/current-task.md`
- Stops if ticket is already `Done` or credentials are missing

### Layer 2 — Orchestrator
- Reads `CLAUDE.md` (team rules), `CLAUDE.local.md` (local config), `current-task.md`
- Reads `api-contract.md` to understand existing contract
- Decides which agents to spawn: FE only / BE only / both
- Produces a human-readable plan and **waits for approval** before proceeding
- After approval: spawns FE Agent and BE Agent in parallel

### Layer 3 — api-contract.md (Source of Truth)
- All agents read this before writing code
- If a ticket requires a new endpoint, the Orchestrator updates this file first
- Any mismatch between implementation and contract → agent stops and reports to Orchestrator

### Layer 3 — FE Agent (`frontend`)
Stack: Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zustand · TanStack Query

Done criteria (all must pass):
```bash
cd frontend && npx tsc --noEmit   # zero errors
cd frontend && npm run lint        # zero warnings
cd frontend && npm run build       # clean production build
```

### Layer 3 — BE Agent (`backend`)
Stack: NestJS 11 · TypeScript · Mongoose · MongoDB · JWT · Swagger

Done criteria (all must pass):
```bash
cd backend && npx tsc --noEmit
cd backend && npm run lint
cd backend && npm run test         # all unit tests green
cd backend && npm run build
```

### Layer 4 — Test Agent (`tester`)
- Spawned only after BOTH FE and BE agents signal done
- Read-only access to source files; writes only `*.spec.ts` and `*.test.ts` files
- Writes unit tests, integration tests, and E2E Playwright specs
- Coverage gates enforced before signalling done

### Layer 5 — Integrator Agent (`integrator`)
- Merges feature branches
- Runs the full stack build one final time
- Opens a GitHub PR with a structured summary
- Transitions Jira ticket to **Done** and posts a completion comment

---

## File Artifacts

| File                              | Written by       | Read by                     |
|-----------------------------------|------------------|-----------------------------|
| `.claude/context/current-task.md` | Jira Agent       | Orchestrator, FE, BE, Tester|
| `api-contract.md`                 | Orchestrator     | FE Agent, BE Agent          |
| `CLAUDE.md`                       | Team (manual)    | All agents                  |
| `CLAUDE.local.md`                 | Developer (local)| Jira Agent, Orchestrator    |

---

## Trigger

```
/jira-start NEX-<id>          ← full pipeline (requires plan approval at Layer 2)
/jira-start NEX-<id> --dry-run ← Layers 1–2 only, no code written
```
