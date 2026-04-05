---
name: screenshot-pages
description: Takes full-page screenshots of every view on the live site AND the local Next.js project, saves them to .claude/context/screenshots/ with timestamped names. Produces a side-by-side index file for visual comparison. Run this before compare-local-live for visual evidence.
trigger: /screenshot-pages
---

You are executing the **screenshot-pages** skill. Take screenshots of every view on both the live site and the local project.

## Prerequisites Check

Before starting:
1. Confirm Chrome extension is connected via `tabs_context_mcp`.
2. Confirm local dev server is running: try `curl http://localhost:3000` — if it fails, remind the user to run `npm run dev` in `frontend/`.
3. Create output dir: ensure `.claude/context/screenshots/` exists (create it with Bash if not).

## Screenshot Naming

All files saved to: `F:\Test Practics\nexus\.claude\context\screenshots\`
Format: `<YYYY-MM-DD>-<source>-<view>.png`
- source: `live` or `local`
- view: `landing`, `chathub`, `marketplace`, `agents`, `discover`, `signin`, `onboarding`

## Live Site Screenshots

### Landing Page
1. Navigate tab to `https://nexusai-db.netlify.app/`
2. Wait 4s for JS to load
3. Screenshot → save as `<date>-live-landing.png`
4. Scroll down 800px
5. Screenshot → save as `<date>-live-landing-scroll1.png`
6. Scroll down another 800px
7. Screenshot → save as `<date>-live-landing-scroll2.png`
8. Scroll to bottom
9. Screenshot → save as `<date>-live-landing-footer.png`

### Chat Hub
1. Click `#tab-chat` via JS: `document.getElementById('tab-chat').click()`
2. Wait 1s
3. Screenshot → save as `<date>-live-chathub.png`

### Marketplace
1. `document.getElementById('tab-marketplace').click()`
2. Wait 1s
3. Screenshot → save as `<date>-live-marketplace.png`
4. Scroll down to see model grid
5. Screenshot → save as `<date>-live-marketplace-grid.png`

### Agents
1. `document.getElementById('tab-agents').click()`
2. Wait 1s
3. Screenshot → save as `<date>-live-agents.png`
4. Click toggle agents button if visible: `document.getElementById('toggle-agents-btn') && document.getElementById('toggle-agents-btn').click()`
5. Wait 500ms
6. Screenshot → save as `<date>-live-agents-list.png`

### Discover
1. `document.getElementById('tab-research').click()`
2. Wait 1s
3. Screenshot → save as `<date>-live-discover.png`
4. Click first research card: `document.getElementById('rfc-r1') && document.getElementById('rfc-r1').click()`
5. Wait 500ms
6. Screenshot → save as `<date>-live-discover-detail.png`

### Onboarding
1. Navigate to `https://nexusai-db.netlify.app/` in a fresh tab (or reload)
2. If onboarding overlay appears, screenshot immediately → `<date>-live-onboarding.png`

## Local Project Screenshots

### Landing
1. Navigate to `http://localhost:3000`
2. Wait 3s
3. Screenshot → save as `<date>-local-landing.png`
4. Scroll down 800px → screenshot → `<date>-local-landing-scroll1.png`

### Sign In
1. Navigate to `http://localhost:3000/signin`
2. Wait 2s
3. Screenshot → save as `<date>-local-signin.png`
4. Click "Create Account" tab
5. Screenshot → save as `<date>-local-signup.png`

### Chat Hub (requires auth — skip if not logged in)
1. Navigate to `http://localhost:3000/chathub`
2. Wait 3s
3. If redirected to signin, note "AUTH REQUIRED — not captured"
4. Otherwise screenshot → `<date>-local-chathub.png`

### Marketplace
1. Navigate to `http://localhost:3000/marketplace`
2. Wait 3s
3. Screenshot → `<date>-local-marketplace.png`

### Agents
1. Navigate to `http://localhost:3000/agents`
2. Screenshot → `<date>-local-agents.png`

### Discover
1. Navigate to `http://localhost:3000/discover`
2. Screenshot → `<date>-local-discover.png`

## Output: Screenshot Index

Save `.claude/context/reports/<date>-screenshot-index.md`:

```markdown
# Screenshot Index — <date>

## Live Site (nexusai-db.netlify.app)
| View | File | Notes |
|---|---|---|
| Landing (top) | <date>-live-landing.png | |
| Landing (scroll 1) | <date>-live-landing-scroll1.png | |
| Landing (scroll 2) | <date>-live-landing-scroll2.png | |
| Landing (footer) | <date>-live-landing-footer.png | |
| Chat Hub | <date>-live-chathub.png | |
| Marketplace | <date>-live-marketplace.png | |
| Marketplace Grid | <date>-live-marketplace-grid.png | |
| Agents | <date>-live-agents.png | |
| Agents List | <date>-live-agents-list.png | |
| Discover | <date>-live-discover.png | |
| Discover Detail | <date>-live-discover-detail.png | |

## Local Project (localhost:3000)
| View | File | Notes |
|---|---|---|
| Landing | <date>-local-landing.png | |
| Sign In | <date>-local-signin.png | |
| Sign Up | <date>-local-signup.png | |
| Chat Hub | <date>-local-chathub.png | AUTH REQUIRED or captured |
| Marketplace | <date>-local-marketplace.png | |
| Agents | <date>-local-agents.png | |
| Discover | <date>-local-discover.png | |

## Visual Gaps Noted
<list any obvious visual differences spotted>
```

## If Screenshots Fail

If `computer screenshot` times out or detaches:
1. Try opening a fresh tab with `tabs_create_mcp`
2. Navigate there and retry once
3. If still failing, note the failure in the index and continue with remaining views
4. Document renderer freeze issues under "Visual Gaps Noted"
