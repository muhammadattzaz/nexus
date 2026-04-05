# Live Site Snapshot — nexusai-db.netlify.app

**Captured:** 2026-04-06
**URL:** https://nexusai-db.netlify.app/
**Architecture:** Vanilla JS SPA — single HTML file, all JS inline, no framework, no server-side routing
**Local counterpart:** `F:\Test Practics\nexus\frontend` (Next.js 16 App Router)

---

## Architecture Differences: Live vs Local

| Aspect | Live (Netlify) | Local (Next.js) |
|---|---|---|
| Framework | Vanilla HTML/CSS/JS SPA | Next.js 16 App Router (React 19) |
| Routing | JS class toggling (`.page.active`) | File-based App Router |
| Styling | Plain CSS with CSS variables | Tailwind v4 + CSS variables |
| State | Vanilla JS DOM manipulation | Zustand + TanStack Query |
| Auth | Sign in / Get Started buttons (SPA modal) | JWT + HttpOnly cookie, `/signin` route |
| Real-time | None observed | Socket.io WebSocket |
| Backend | None (pure frontend demo) | NestJS API on port 3001 |

---

## Routes / Views (SPA — all rendered from single page)

The live site uses `#landing-page` + `#app-page` toggling. No real URL routes.

| View ID | Tab Label | Shown When |
|---|---|---|
| `#landing-page` | — | Default landing |
| `#app-page` + `#chat-view` | 💬 Chat Hub | `#tab-chat` active |
| `#app-page` + `#marketplace-view` | 🛍 Marketplace | `#tab-marketplace` active |
| `#app-page` + `#agents-view` | 🤖 Agents | `#tab-agents` active |
| `#app-page` + `#research-view` | 🔬 Discover New | `#tab-research` active |

---

## Landing Page Sections (top → bottom)

### 1. Navigation
- **Logo:** NexusAI (SVG diamond + wordmark)
- **Language selector:** 15 languages (EN, AR, FR, DE, ES, PT, ZH, JA, KO, HI, UR, TR, RU, IT, NL)
- **Auth buttons:** `Sign in` | `Get Started →`
- **No links** — nav uses JS click handlers, hrefs are null

### 2. Hero Section
- **Eyebrow:** `✦ Live`
- **H1:** "Find your perfect AI model with guided discovery"
- **Hero search card** (`#hsc`):
  - Expandable textarea (`#landing-input`)
  - Buttons: mic (`#hero-mic-btn`), voice type (`#hero-vtype-btn`), Computer Agent chip
  - Body expands to: Welcome phase → Questions phase → Building phase

### 3. Action Grid (`#hero-action-grid` equivalent)
- ✍️ Write content (Emails, posts, stories)
- 🎨 Create images (Art, photos, designs)
- 🛠️ Build something (Apps, tools, websites)
- ⚡ Automate work (Save hours every week)
- 📊 Analyse data (PDFs, sheets, reports)
- 🔍 Just exploring (Show me what's possible)
- "Or type anything below — there are no wrong answers ↓"

### 4. Suggested Questions
- "Help me find the best AI model for my project"
- "I want to build an AI chatbot for my website"
- "Generate realistic images for my marketing campaign"
- "Analyse documents and extract key information"
- "Create AI agents for workflow automation"
- "Add voice and speech recognition to my app"
- CTAs: Help me choose | Show me popular models | What can AI do for me? | I want to build a chatbot | Skip to marketplace

### 5. Stats Bar
- **525+** AI Models
- **82K** Builders
- **28** AI Labs
- **4.8⭐** Avg Rating

### 6. Featured Models Grid (`#landing-models`)
Cards include: name, org, badge (Hot/New), description, tags (3), star rating, review count, price/1M tk, "Try →" button
Sample models:
- 🧠 GPT-5 · OpenAI · Hot · $7.50/1M · 4.9 (4,210)
- 🧠 GPT-5.2 · OpenAI · New · $4/1M · 4.8 (2,180)
- ⚡ GPT-5 Turbo · OpenAI · Hot · $2.50/1M · 4.8 (3,560)
- 🔮 GPT-4.5 · OpenAI · $3/1M · 4.7 (1,980)

### 7. Feature Cards (H4 headings)
- Guided Discovery Chat
- Prompt Engineering Guide
- Agent Builder
- Flexible Pricing
- User Reviews & Ratings
- Research Feed

### 8. Labs Browser (`#labs-bar`)
- H2: "Browse by AI Lab"
- Lab filter pills in `#lab-pills-container`
- Active lab banner: `#lab-active-banner`

### 9. Flagship Model Comparison Table
H2: "Flagship Model Comparison"

| Model | Org | Context | Input | Output | Vision | Speed | Best For |
|---|---|---|---|---|---|---|---|
| 🧠 GPT-5.4 | OpenAI | 1.05M | $2.50 | $15 | ✅ | 🟢 Fast | High-precision professional tasks |
| 👑 Claude Opus 4.6 | Anthropic | 200K/1M β | $5 | $25 | ✅ | 🟠 Moderate | Agents, advanced coding |
| ⚡ Claude Sonnet 4.6 | Anthropic | 200K/1M β | $3 | $15 | ✅ | 🟢 Fast | Code, data, content at scale |
| 🚀 Claude Haiku 4.5 | Anthropic | 200K | $1 | $5 | ✅ | ⚡ Fastest | Real-time, high-volume |
| 🔬 Gemini 3.1 Pro | Google | 2M–5M | $2 | $12 | ✅ | 🟠 Moderate | Deep reasoning, long context |
| ⚡ Gemini 3 Flash | Google | 1M | $2 | $12 | ✅ | 🟠 Moderate | High-volume chat & coding |

### 10. Trending This Week
H2: "🔥 Trending This Week"
- Claude Opus 4.6 & Sonnet 4.6
- Gemini 3.1 Pro — Thought Signatures
- GPT-5.4 — Native agent use
- Grok-4-1 Fast — 4-Agent Architecture
- Llama 4 Maverick — 400B MoE
- Devstral 2 — Fastest Coding Agent

### 11. Find Models by Budget
- Free & Open Source
- Budget — Under $0.50/1M
- Mid-Range — $1–$5/1M
- Premium — $5+/1M

### 12. Quick-Start by Use Case
- Code Generation | Image Generation | AI Agents | Document Analysis | Video Generation | Voice & Audio | Multilingual / Translation | Math & Research

### 13. Newsletter
H2: "New models drop every week. Don't miss a release."

### 14. Footer Links
- Models · Research · API · Privacy · Terms (all `href="#"`)

---

## App Views (inside `#app-page`)

### Chat Hub (`#chat-view`)
- Left sidebar: model list (`#sb-model-list`)
- Center: chat area (`#chat-area`), greet card (`#greet-card-main`), input row
  - Textarea: `#chat-input`
  - Buttons: mic (`#hub-mic-btn` ic-purple), voice type (`#hub-vtype-btn` ic-orange), file upload, image upload
  - Active model label: `#active-model-label`
  - Suggestion chips: `#inp-sugg`
  - Category prompt panel: `#cpanel`
- Right panel (`#rpanel`): model icon, name, org, desc, context, price, rating, usage stats (requests, avg latency, cost), spark chart

### Marketplace (`#marketplace-view`)
- Search bar with mic + file + image buttons (`#mkt-mic-btn`)
- Lab filter pills: `#labs-bar` → `#lab-pills-container`
- Model grid: `#mkt-grid` — same card format as landing
- Active lab banner: `#lab-active-banner`

### Agents (`#agents-view`)
- Use-case detail panel: `#uc-detail-panel` (title, subtitle, apps grid)
- Toggle Agents button: `#toggle-agents-btn`
- Task management: `#task-input-wrap` + `#task-input` + `#task-list`
- Task context menus: `#task-ctx-1/2/3`
- Computer agent panel: `#agent-computer-panel` with search + tabs + shuffle
- Inline agents view: `#inline-agents-view`
  - Sidebar: `#ial-left-sidebar` + `#ial-agent-list`
  - Tabs: `#al-tab-default` (active)
  - Grid: `#inline-al-grid`
  - Conversation panel: `#conv-panel` with messages, typing indicator, input
- Agent Flow Builder overlay: `#agent-flow-overlay` → `#agent-flow-modal` (multi-step with back/next/dots)
- Template flow overlay: `#template-flow-overlay`
- Agent chat view: `#agent-chat-view`

### Discover / Research (`#research-view`)
- Tab bar: `#rf-tabs`
- Feed list: `#research-feed` — 6 cards (`#rfc-r1` through `#rfc-r6`)
  - Each card: date, lab, category badge, title, summary
- Detail column: `#rf-detail-col` with `#rf-detail-content`
  - Banner: org row, title, meta
  - Body: full paper summary
  - Discuss button: `#rd-discuss-btn`
- Sample papers:
  - Mar 26 · Google DeepMind · Reasoning — "Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks"
  - Mar 22 · MIT CSAIL · Multimodal — "Scaling laws for multimodal models: new empirical findings"

---

## Onboarding System
- Full-screen overlay: `#ob-overlay`
- Screens: `#ob-welcome-screen` → `#ob-q-screen` (`#ob-q-inner`, heading, options `#ob-opt-list`, dots `#ob-dots-row`) → `#ob-done-screen`

---

## Interactive Elements Summary
- **Total buttons:** 445
- **Total links:** 9 (all `href="#"` or null — SPA, no real routes)
- **Inputs/textareas:** `#landing-input`, `#chat-input`, `#mkt-search`, `#cap-search-input`, `#acp-search`, `#task-input`, `#conv-input`, `#ac-input`
- **File inputs:** `#hf-file`, `#hf-img`, `#hub-file-in`, `#hub-img-in`, `#mkt-file-in`, `#mkt-img-in`

---

## Scripts & Assets
- **0 external script tags** — all JS inline in HTML
- **Fonts:** Syne (700), Instrument Sans (400–600) — same as local project
- **Color palette:** `#C8622A` accent, `#F4F2EE` bg, `#1C1A16` text — same tokens as local project

---

## What Local Project Has That Live Site Lacks
1. Real backend API (NestJS on port 3001)
2. Real authentication (JWT + HttpOnly cookie)
3. Real chat persistence (MongoDB)
4. WebSocket real-time messaging
5. User profile management (PATCH /users/:id)
6. Real agent CRUD (saved to DB)
7. Proper URL routing (Next.js App Router)
8. TypeScript + build-time type safety

## What Live Site Has That Local Project Lacks / Differs
1. Language selector (15 languages) — local has none
2. Onboarding overlay (multi-step questionnaire)
3. Computer Agent chip/mode
4. Voice input (mic with animated wave)
5. Voice typing mode
6. Task management list in Agents view
7. Agent flow builder (multi-step modal)
8. Conversation panel inside Agents view
9. Right panel (rpanel) with live usage stats/spark chart
10. Category prompt panel (cpanel)
11. "Find Models by Budget" section
12. "Quick-Start by Use Case" section
13. Lab filter pills in Marketplace
14. Research paper detail view (split-pane)
15. Trending feed section on landing
