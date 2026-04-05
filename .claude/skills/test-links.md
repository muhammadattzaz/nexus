---
name: test-links
description: Tests every link, button navigation, tab switch, and internal SPA transition on the live site. Also tests all local Next.js routes and backend API endpoints. Reports broken links, JS errors on click, 404s, and non-functional interactive elements.
trigger: /test-links
---

You are executing the **test-links** skill. Systematically test every navigable element on both the live site and local project.

## Part 1 — Live Site Link & Navigation Testing

### 1.1 Setup
1. `tabs_context_mcp` → get tab
2. Navigate to `https://nexusai-db.netlify.app/`
3. Wait 4s
4. Start network + console capture:
   - `read_network_requests` (clears and starts tracking)
   - `read_console_messages` (starts tracking)

### 1.2 Extract All Clickable Elements

```js
// Get all anchor tags
[...document.querySelectorAll('a')].map(a => ({
  text: a.innerText.trim().slice(0,50),
  href: a.getAttribute('href'),
  id: a.id
})).map(x => x.text + ' | href=' + x.href + ' | id=' + x.id).join('\n')
```

```js
// Get all nav-level buttons
[...document.querySelectorAll('nav button, .app-tab')].map(b => 'id='+b.id+' text='+b.innerText.trim().slice(0,40)).join('\n')
```

### 1.3 Test Each Anchor Link

For every `href` found:
- If `href="#"` or `href=null` → mark as **EXPECTED (SPA pattern)** — not a bug
- If `href` is a real URL → navigate and check for 404/error
- If `href` is a path like `/signin` → test it (SPA has no real routes so expect 404)

Expected result for this SPA: ALL links are `href="#"` or `null`. If any have real hrefs that return 404, that's a bug.

### 1.4 Test App Tab Navigation

Test each tab switch and verify the correct view becomes visible:

```js
// Test Chat Hub tab
document.getElementById('tab-chat').click();
```
Wait 500ms, then verify:
```js
// Check if chat-view is visible (non-empty, not display:none)
const cv = document.getElementById('chat-view');
cv ? (cv.offsetParent !== null ? 'VISIBLE' : 'HIDDEN') : 'NOT FOUND'
```

Repeat for each tab:

| Tab Button ID | Expected View ID | Check |
|---|---|---|
| `#tab-chat` | `#chat-view` | visible after click |
| `#tab-marketplace` | `#marketplace-view` | visible after click |
| `#tab-agents` | `#agents-view` | visible after click |
| `#tab-research` | `#research-view` | visible after click |

### 1.5 Test Hero CTA Buttons

```js
// Find hero buttons
[...document.querySelectorAll('#hsc button, .hsb-row button, [class*="ob-start"]')].map(b => 'id='+b.id+' cls='+b.className.slice(0,40)+' text='+b.innerText.trim().slice(0,40)).join('\n')
```

For each: click it, wait 500ms, check if expected UI change happened (onboarding opens, search expands, etc.), read console for errors.

### 1.6 Test Onboarding Flow
1. Click "Get Started →" in nav
2. Screenshot onboarding overlay
3. Click each option pill
4. Click next/proceed buttons
5. Verify progress dots advance
6. Check for console errors throughout

### 1.7 Test Model Cards (Marketplace & Landing)
1. Click "How to Use →" on first 3 model cards
2. Verify modal or detail panel opens
3. Check for JS errors

### 1.8 Test Research Feed
1. Go to Discover tab
2. Click each research card (`#rfc-r1` through `#rfc-r6`)
3. Verify detail panel (`#rf-detail-content`) updates
4. Click `#rd-discuss-btn`
5. Check for errors

### 1.9 Read Console Errors
```
Call read_console_messages — collect all errors/warnings
```

## Part 2 — Local Project Route Testing

### 2.1 Next.js Routes
For each route, navigate and verify:

| Route | Expected Behaviour | Auth Required |
|---|---|---|
| `http://localhost:3000/` | Landing page renders | No |
| `http://localhost:3000/signin` | Sign in / Create Account tabs | No |
| `http://localhost:3000/signup` | Redirects to /signin | No |
| `http://localhost:3000/chathub` | Chat UI or redirect to /signin | Yes |
| `http://localhost:3000/marketplace` | Marketplace page | No |
| `http://localhost:3000/agents` | Agents page | No |
| `http://localhost:3000/discover` | Discover page | No |
| `http://localhost:3000/_not-found` | 404 page | No |

For each:
1. Navigate
2. Wait 3s (auth init runs)
3. Check page rendered (not blank/error)
4. Note final URL (check for unexpected redirects)
5. Read console messages for errors

### 2.2 Backend API Endpoint Testing
Test via JS `fetch` from the browser console or via Bash `curl`:

```bash
# Health check
curl -s http://localhost:3001/auth/me -o /dev/null -w "%{http_code}"
# Expected: 401 (no token) — endpoint exists

curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  -o /dev/null -w "%{http_code}"
# Expected: 401

curl -s http://localhost:3001/api/docs-json -o /dev/null -w "%{http_code}"
# Expected: 200 (Swagger)
```

Test every documented endpoint group:
- `POST /auth/register` → 400 (validation, missing fields)
- `POST /auth/login` → 401 (wrong creds)
- `POST /auth/refresh` → 401 (no cookie)
- `GET /auth/me` → 401 (no token)
- `GET /users/:id` → 401 (no token)
- `GET /chat/sessions` → 401 (no token)
- `GET /agents` → 401 (no token)

### 2.3 Test Auth Flow End-to-End
1. Navigate to `http://localhost:3000/signin`
2. Fill sign-in form with valid credentials
3. Submit
4. Verify redirect to `/chathub`
5. Refresh the page
6. Verify user stays logged in (AuthInit restores session)
7. Click user menu → Profile
8. Update profile fields
9. Save and verify success toast
10. Click Sign out
11. Verify redirect to `/`
12. Try to access `/chathub` directly
13. Verify redirect to `/signin`

## Output Report

Save to `.claude/context/reports/<date>-test-links.md`:

```markdown
# Link & Navigation Test Report — <date>

## Summary
- Live site links tested: <n>
- Local routes tested: <n>
- API endpoints tested: <n>
- PASS: <n> | FAIL: <n> | SKIP: <n>

## Live Site Results

### Anchor Links
| Text | href | Status |
| ... | ... | EXPECTED/BROKEN |

### Tab Navigation
| Tab | View Shown | Console Errors | Status |
| Chat Hub | #chat-view | None | ✅ PASS |
| ... |

### Feature Interactions
| Feature | Action | Result | Status |

### Console Errors
<list all JS errors found>

## Local Project Results

### Routes
| Route | Final URL | Status Code | Console Errors | Status |

### API Endpoints
| Endpoint | Method | Expected | Got | Status |

### Auth Flow E2E
| Step | Expected | Got | Status |

## Broken / Failed Items
<numbered list with severity>
```
