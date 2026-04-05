---
name: audit-features
description: Full functional walkthrough of every interactive feature on both the live site and local project. Clicks every button, fills every form, navigates every view, and checks for errors. Produces a PASS/FAIL audit report. Use after major changes to verify nothing regressed.
trigger: /audit-features
---

You are executing the **audit-features** skill. Walk through every feature of both the live site and local project, testing each one works correctly.

## Audit Scope

### Live Site: https://nexusai-db.netlify.app/
### Local Project: http://localhost:3000 + http://localhost:3001 (API)

---

## Part A — Live Site Audit

### A1. Page Load
- [ ] Page title = "NexusAI Dashboard"
- [ ] No console errors on load
- [ ] Fonts load (Syne, Instrument Sans)
- [ ] CSS variables applied (warm beige background)
- [ ] Nav renders with logo, language selector, auth buttons

**How to check:**
```js
document.title
```
```
read_console_messages → expect 0 errors
```

### A2. Language Selector
1. Click `#lang-btn`
2. Verify `#lang-menu` opens with 15 language options
3. Click "🇫🇷 Français"
4. Verify label changes to "FR"
5. Click again to close
- [ ] Dropdown opens
- [ ] Option selection works
- [ ] Label updates
- [ ] Closes on second click

### A3. Hero Search (Landing)
1. Click `#hsc` (hero search card)
2. Verify it expands (`#hsb-body` opens)
3. Type in `#landing-input`: "Help me build a chatbot"
4. Verify text appears
5. Click mic button `#hero-mic-btn`
6. Verify mic activates (or shows permission prompt)
- [ ] Search card expands on click
- [ ] Text input accepts typing
- [ ] Mic button responds

### A4. Onboarding Flow
1. Click "Get Started →" in nav
2. Verify `#ob-overlay` appears (fullscreen)
3. Verify welcome screen `#ob-welcome-screen` is visible
4. Click first option in `#ob-opt-list`
5. Verify progress dot advances in `#ob-dots-row`
6. Continue through all steps
7. Verify done screen appears
- [ ] Overlay opens
- [ ] Options are clickable
- [ ] Progress advances
- [ ] Completion state reached
- [ ] No console errors

### A5. Action Grid Tiles
1. Click each of 6 action tiles (Write, Create, Build, Automate, Analyse, Explore)
2. Verify each opens relevant UI (search expands with pre-filled context, or navigates)
- [ ] All 6 tiles respond to click
- [ ] Correct prompt/action triggered

### A6. Suggested Question Chips
1. Click each suggested question link
2. Verify text populates search or navigates
- [ ] Questions are clickable
- [ ] Action triggered

### A7. Featured Model Cards — Landing
1. Click "Try →" on first 3 model cards
2. Verify detail modal or navigation occurs
3. Check for JS errors
- [ ] Cards clickable
- [ ] Action triggered without errors

### A8. App Tab Navigation
For each tab:
```js
document.getElementById('tab-chat').click()
// verify chat-view visible
document.getElementById('tab-marketplace').click()
// verify marketplace-view visible
document.getElementById('tab-agents').click()
// verify agents-view visible
document.getElementById('tab-research').click()
// verify research-view visible
```
- [ ] Chat Hub tab → #chat-view visible
- [ ] Marketplace tab → #marketplace-view visible
- [ ] Agents tab → #agents-view visible
- [ ] Discover tab → #research-view visible
- [ ] Active tab styling updates

### A9. Chat Hub
1. Navigate to Chat Hub tab
2. Click first model in sidebar (`#sb-model-list`)
3. Verify `#active-model-label` updates
4. Verify `#rpanel` shows model details
5. Click in `#chat-input` and type "Hello"
6. Press Enter or click send
7. Verify message appears in `#chat-area`
8. Click `#hub-mic-btn` — verify voice UI activates
9. Click `#hub-vtype-btn` — verify voice-type activates
10. Click file upload icon — verify file dialog opens
- [ ] Model selection works
- [ ] Right panel updates with model info
- [ ] Message sends
- [ ] Mic activates
- [ ] Voice type activates
- [ ] File dialog opens

### A10. Marketplace
1. Navigate to Marketplace tab
2. Verify `#mkt-grid` shows model cards
3. Type in search bar — verify filtering
4. Click a lab pill in `#lab-pills-container`
5. Verify `#lab-active-banner` shows selected lab
6. Verify grid filters to that lab's models
7. Click "How to Use →" on a model card
8. Verify detail modal/view opens
- [ ] Model grid renders
- [ ] Search filters results
- [ ] Lab filter works
- [ ] Model detail opens

### A11. Agents
1. Navigate to Agents tab
2. Verify use-case panel visible (`#uc-detail-panel`)
3. Click `#toggle-agents-btn`
4. Verify inline agents list appears (`#inline-agents-view`)
5. Click an agent in the grid
6. Verify conversation panel (`#conv-panel`) activates
7. Type in `#conv-input` and click `#conv-send-btn`
8. Add a task in `#task-input` and press Enter
9. Verify task appears in `#task-list`
10. Click Computer Agent tab
11. Verify `#agent-computer-panel` shows
- [ ] Use-case panel loads
- [ ] Agent list toggles
- [ ] Agent selection opens conv panel
- [ ] Messages send in conv panel
- [ ] Task management works
- [ ] Computer agent panel loads

### A12. Discover / Research
1. Navigate to Discover tab
2. Verify `#research-feed` shows 6 cards
3. Click card `#rfc-r1`
4. Verify `#rf-detail-content` populates
5. Verify `#rd-title`, `#rd-org-row`, `#rd-body` have content
6. Click `#rd-discuss-btn`
7. Click remaining cards `#rfc-r2` through `#rfc-r6`
8. Verify each card switches detail pane correctly
- [ ] Feed has 6 cards
- [ ] Card click updates detail
- [ ] Discuss button responds
- [ ] All 6 cards work

---

## Part B — Local Project Audit

### B1. Backend Health Check (Bash)
```bash
curl -s http://localhost:3001/api/docs-json | head -c 100
# Should return OpenAPI JSON
```
- [ ] Backend reachable on port 3001
- [ ] Swagger docs accessible

### B2. Frontend Load
1. Navigate to `http://localhost:3000`
2. Wait 3s for AuthInit to complete
- [ ] Page renders
- [ ] No build errors in console
- [ ] Auth init completes (isInitializing → false)

### B3. Sign Up Flow
1. Navigate to `http://localhost:3000/signin`
2. Click "Create Account" tab
3. Fill: Full name, Email, Password (8+ chars), Confirm password
4. Submit
5. Verify redirect to `/chathub`
6. Verify user name appears in nav
- [ ] Form validates
- [ ] API call succeeds (201)
- [ ] Redirect happens
- [ ] Auth state populated

### B4. Sign In Flow
1. Sign out (if logged in)
2. Navigate to `/signin`
3. Enter credentials from B3
4. Submit
5. Verify redirect to `/chathub`
- [ ] Login works with registered credentials
- [ ] accessToken set in Zustand
- [ ] refresh_token cookie set

### B5. Session Persistence on Refresh
1. While logged in on `/chathub`
2. Press F5 (hard refresh)
3. Wait 3s
4. Verify still on `/chathub` (not redirected to `/signin`)
5. Verify user name still shows in nav
- [ ] AuthInit restores session from cookie
- [ ] No flash redirect to /signin
- [ ] User data repopulated

### B6. Profile Update
1. Click user avatar in nav
2. Click "Profile"
3. Verify modal opens with current user data
4. Change Full Name
5. Click "Save changes"
6. Verify success toast appears
7. Verify nav shows updated name
- [ ] Modal opens
- [ ] PATCH /users/:id called
- [ ] Store updated on success
- [ ] Toast shows

### B7. Logout
1. Click user menu → "Sign out"
2. Verify redirect to `/`
3. Try navigating to `/chathub`
4. Verify redirect to `/signin`
- [ ] clearAuth() called
- [ ] refresh_token cookie cleared
- [ ] Protected route redirects

### B8. Rate Limiting
```bash
# Hit login 11 times in 1 second
for i in {1..11}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d '{"email":"x","password":"y"}'; done
# Last response should be 429
```
- [ ] 429 on 11th request within 1s

---

## Output Report

Save to `.claude/context/reports/<date>-audit-features.md`:

```markdown
# Feature Audit Report — <date>

## Summary
| | Live Site | Local Project |
|---|---|---|
| Tests Run | <n> | <n> |
| ✅ PASS | <n> | <n> |
| ❌ FAIL | <n> | <n> |
| ⏭ SKIP | <n> | <n> |

## Live Site Results (A1–A12)
[checkbox list with PASS/FAIL/SKIP + notes]

## Local Project Results (B1–B8)
[checkbox list with PASS/FAIL/SKIP + notes]

## Failures Requiring Fixes
| # | Location | Feature | Error | Severity |
|---|---|---|---|---|

## Regressions (passed before, failing now)
<list if any>

## Console Errors Captured
<all JS errors from both sites>
```
