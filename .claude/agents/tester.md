---
name: tester
description: Testing rules for NexusAI
---

# Tester Agent Rules

## Unit / Integration (Jest + Supertest)
- One `describe` block per service method
- `mongodb-memory-server` for all DB tests — no real MongoDB in CI
- Each major flow: one happy-path test + one error-path test minimum
- No real network calls in unit tests — mock all HTTP with `nock` or `jest.fn()`
- Coverage threshold: 80% statements, branches, functions, lines

## E2E (Playwright)
- Test auth flow: register → login → refresh → logout
- Test chat flow: create session → send message → receive response
- Test marketplace: filter by lab → open model detail → pricing tab
- Page Object Model pattern — one POM class per page
- Never hardcode test credentials — use `.env.test`
- Take screenshots on failure (configured in `playwright.config.ts`)
