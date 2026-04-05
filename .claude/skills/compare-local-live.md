---
name: compare-local-live
description: Side-by-side diff of every feature, section, route, and UI element between the live site (nexusai-db.netlify.app) and the local Next.js project (localhost:3000). Produces a structured gap analysis with severity ratings so you know exactly what to build next. Run scrape-live first to refresh context.
trigger: /compare-local-live
---

You are executing the **compare-local-live** skill. Produce an exhaustive feature gap analysis between the NexusAI live site and the local Next.js project.

## Step 1 — Load Context

Read these files before doing anything else:
1. `.claude/context/live-site-snapshot.md` — authoritative live site data
2. `CLAUDE.md` — local project architecture
3. Any recent scrape report in `.claude/context/reports/` — for fresh data

Also read key local source files to understand current state:
- `frontend/src/app/page.tsx` — landing page components
- `frontend/src/app/chathub/page.tsx` — chat hub
- `frontend/src/app/marketplace/page.tsx` — marketplace (if exists)
- `frontend/src/app/agents/page.tsx` — agents (if exists)
- `frontend/src/app/discover/page.tsx` — discover (if exists)
- `frontend/src/components/` — list all component dirs

## Step 2 — Live Site Refresh (Optional)

If the last scrape report is older than 24h:
1. Navigate Chrome to `https://nexusai-db.netlify.app/`
2. Run quick JS extractions for headings, stats, and model count
3. Note any changes vs snapshot

## Step 3 — Systematic Comparison

Work through each area and fill in the comparison table:

### 3.1 Navigation

| Element | Live Site | Local Project | Gap |
|---|---|---|---|
| Logo | NexusAI SVG + wordmark | Same | ✅ Match |
| Nav tabs | 💬 Chat Hub, 🛍 Marketplace, 🤖 Agents, 🔬 Discover New | Check local | ? |
| Language selector | 15 languages | None | ❌ Missing |
| Auth state — logged out | Sign in + Get Started → | Sign in + Try free → | 🟡 Minor diff |
| Auth state — logged in | User avatar + name + dropdown | Same pattern | ? |

### 3.2 Landing Page Sections

Check each section exists in local `frontend/src/app/page.tsx` and its component:

| Section | Live Site | Local | Status |
|---|---|---|---|
| Hero eyebrow | "✦ Live" | Check | ? |
| Hero H1 | "Find your perfect AI model with guided discovery" | Check | ? |
| Hero search card | Expandable with mic, voice, computer chip | Check | ? |
| Action grid | 6 tiles (write, create, build, automate, analyse, explore) | Check | ? |
| Suggested questions | 6 questions + 4 CTA chips | Check | ? |
| Stats bar | 525+ models, 82K builders, 28 labs, 4.8⭐ | Check | ? |
| Featured models grid | Real model data | Check if real or mock | ? |
| Feature cards | 6 cards | Check | ? |
| Labs browser | Lab filter pills | Check | ? |
| Comparison table | 6-row table with pricing | Check | ? |
| Trending feed | 6 trending models | Check | ? |
| Find by budget | 4 budget tiers | Check | ? |
| Quick-start by use case | 8 use cases | Check | ? |
| Newsletter | Email signup | Check | ? |
| Footer | Models, Research, API, Privacy, Terms | Check | ? |

### 3.3 Chat Hub

| Feature | Live | Local | Status |
|---|---|---|---|
| Model sidebar with list | ✅ | Check | ? |
| Chat area with messages | ✅ | Check | ? |
| Greet card / empty state | ✅ | Check | ? |
| Text input | ✅ | Check | ? |
| Mic button (voice input) | ✅ | ❌ | Missing |
| Voice type button | ✅ | ❌ | Missing |
| File upload | ✅ | Check | ? |
| Image upload | ✅ | Check | ? |
| Computer Agent chip | ✅ | ❌ | Missing |
| Suggestion chips | ✅ | Check | ? |
| Category prompt panel | ✅ | Check | ? |
| Right panel (model stats) | ✅ | Check | ? |
| Real-time WebSocket | ❌ (demo only) | ✅ | Local Advantage |
| DB persistence | ❌ | ✅ | Local Advantage |

### 3.4 Marketplace

| Feature | Live | Local | Status |
|---|---|---|---|
| Lab filter pills | ✅ | Check | ? |
| Model cards grid | ✅ (50+ models) | Check | ? |
| Card: name, org, tags, price, rating | ✅ | Check | ? |
| Search bar | ✅ | Check | ? |
| Mic in search | ✅ | ❌ | Missing |

### 3.5 Agents

| Feature | Live | Local | Status |
|---|---|---|---|
| Use-case panel | ✅ | Check | ? |
| Inline agent list | ✅ | Check | ? |
| Task management list | ✅ | Check | ? |
| Computer agent panel | ✅ | ❌ | Missing |
| Agent flow builder (modal) | ✅ | Check | ? |
| Conversation panel | ✅ | Check | ? |
| Agent chat view | ✅ | Check | ? |

### 3.6 Discover / Research

| Feature | Live | Local | Status |
|---|---|---|---|
| Research feed (6 cards) | ✅ | Check | ? |
| Category filter tabs | ✅ | Check | ? |
| Split-pane detail view | ✅ | Check | ? |
| Discuss button | ✅ | Check | ? |

### 3.7 Auth & Profile

| Feature | Live | Local | Status |
|---|---|---|---|
| Sign in form | ✅ (modal/overlay) | ✅ (/signin route) | 🟡 Different UX |
| Register form | ✅ | ✅ | ? |
| OAuth buttons | UI only | UI only | ✅ Match |
| JWT auth | ❌ (demo) | ✅ Real | Local Advantage |
| Session persistence on refresh | ❌ | ✅ (AuthInit) | Local Advantage |
| Profile edit | ❌ | ✅ | Local Advantage |
| Language preference | ✅ (15 langs) | ✅ (in profile) | 🟡 Different UX |

### 3.8 Onboarding

| Feature | Live | Local | Status |
|---|---|---|---|
| Multi-step questionnaire overlay | ✅ | ❌ | Missing |
| Progress dots | ✅ | ❌ | Missing |
| Welcome screen | ✅ | ❌ | Missing |

## Step 4 — Severity Classification

For every gap, classify:
- **CRITICAL** — Core feature completely absent (blocks user journey)
- **HIGH** — Important feature missing (degrades experience significantly)
- **MEDIUM** — Nice-to-have feature, UX improvement
- **LOW** — Minor cosmetic or content difference

## Step 5 — Save Report

Save to `.claude/context/reports/<date>-compare-local-live.md`:

```markdown
# Local vs Live Comparison Report — <date>

## Executive Summary
- Total features compared: <n>
- ✅ Match / equivalent: <n>
- 🟡 Minor difference: <n>
- ❌ Missing in local: <n>
- ⭐ Local advantage (better than live): <n>

## Feature Gap Table
[Full table from Step 3]

## Prioritized Gap List

### CRITICAL — Build These First
1. <feature> — <why critical>

### HIGH — Build Next
1. <feature>

### MEDIUM — Future Sprint
1. <feature>

### LOW — Polish
1. <feature>

## Local Advantages (Do Not Remove)
1. Real JWT auth with refresh token
2. Session persistence on page reload (AuthInit)
3. Real MongoDB persistence
4. WebSocket real-time chat
5. User profile update
6. TypeScript + build-time safety

## Recommended Build Order
<ordered list of what to implement next to close the gap>
```
