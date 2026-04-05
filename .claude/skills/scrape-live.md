---
name: scrape-live
description: Full crawl of https://nexusai-db.netlify.app/ — extracts all text, links, buttons, IDs, headings, and network requests from every view (Landing, Chat Hub, Marketplace, Agents, Discover). Saves a timestamped report to .claude/context/reports/. Use this skill to refresh the live site snapshot or before running compare-local-live.
trigger: /scrape-live
---

You are executing the **scrape-live** skill. Perform a complete crawl of the NexusAI live site and save the results.

## Step 1 — Setup

Load context:
1. Read `.claude/context/live-site-snapshot.md` to know the baseline.
2. Get today's date for the report filename.

Get browser tab:
```
Use tabs_context_mcp to get available tabs.
If no tab is on nexusai-db.netlify.app, navigate a tab there.
Wait 5 seconds for the JS SPA to fully initialize.
```

Start network capture immediately after navigation:
```
Call read_network_requests (this starts tracking).
```

## Step 2 — Landing Page Extraction

Run these JS snippets one at a time (not combined — avoid BLOCKED errors):

```js
// 2a: Links
[...document.querySelectorAll('a')].map(a => a.innerText.trim().slice(0,60) + ' => ' + a.getAttribute('href')).join('\n')
```

```js
// 2b: Nav buttons
[...document.querySelectorAll('nav button')].map(b => b.innerText.trim().slice(0,60)).join(' | ')
```

```js
// 2c: All headings
[...document.querySelectorAll('h1,h2,h3,h4')].map(h => h.tagName+': '+h.innerText.trim().slice(0,100)).join('\n')
```

```js
// 2d: Stats bar
document.querySelector('[class*="stats"], .stats-bar, [class*="hero-stats"]') ? document.querySelector('[class*="stats"], .stats-bar, [class*="hero-stats"]').innerText.slice(0,200) : 'stats not found'
```

```js
// 2e: Models grid (first 300 chars)
document.getElementById('landing-models') ? document.getElementById('landing-models').innerText.slice(0,300) : 'not found'
```

```js
// 2f: Comparison table
document.getElementById('comparison-table-body') ? document.getElementById('comparison-table-body').innerText.slice(0,500) : 'not found'
```

```js
// 2g: Count all interactive elements
document.querySelectorAll('button').length + ' buttons | ' + document.querySelectorAll('a').length + ' links | ' + document.querySelectorAll('input,textarea,select').length + ' inputs'
```

Use `get_page_text` for the complete text dump.

## Step 3 — Navigate to Each App View

For each tab, click it, wait 1s, then extract:

### Chat Hub
```js
document.getElementById('tab-chat').click()
```
Wait 1s, then:
```js
document.getElementById('chat-view') ? document.getElementById('chat-view').innerText.slice(0,400) : 'hidden'
```
```js
[...document.querySelectorAll('#sb-model-list button')].slice(0,10).map(b => b.innerText.trim().slice(0,40)).join('\n')
```

### Marketplace
```js
document.getElementById('tab-marketplace').click()
```
Wait 1s, then:
```js
document.getElementById('mkt-grid') ? document.getElementById('mkt-grid').innerText.slice(0,400) : 'hidden'
```
```js
document.getElementById('lab-pills-container') ? document.getElementById('lab-pills-container').innerText.slice(0,200) : ''
```

### Agents
```js
document.getElementById('tab-agents').click()
```
Wait 1s, then:
```js
document.getElementById('agents-view') ? document.getElementById('agents-view').innerText.slice(0,400) : 'hidden'
```
```js
document.getElementById('inline-al-grid') ? document.getElementById('inline-al-grid').innerText.slice(0,300) : ''
```

### Discover / Research
```js
document.getElementById('tab-research').click()
```
Wait 1s, then:
```js
document.getElementById('research-feed') ? document.getElementById('research-feed').innerText.slice(0,500) : 'hidden'
```
```js
document.getElementById('rf-detail-content') ? document.getElementById('rf-detail-content').innerText.slice(0,300) : ''
```

## Step 4 — Read Network Requests
```
Call read_network_requests with urlPattern: '' (all) limit: 100
Note any external API calls, CDN assets, or analytics endpoints.
```

## Step 5 — Read Console Messages
```
Call read_console_messages to capture any JS errors or warnings.
```

## Step 6 — Save Report

Save to `.claude/context/reports/<YYYY-MM-DD>-scrape-live.md`:

```markdown
# Live Site Scrape Report — <date>

## Summary
- Views crawled: Landing, Chat Hub, Marketplace, Agents, Discover
- Total buttons: <n>
- Total links: <n>
- Total inputs: <n>
- Console errors: <n>
- External network requests: <n>

## Landing Page
### Links
<extracted links>

### Headings
<extracted headings>

### Stats
<stats>

### Featured Models (sample)
<first 3 models>

### Comparison Table (sample)
<first 4 rows>

## Chat Hub
<extracted content>

## Marketplace
<extracted content>

## Agents
<extracted content>

## Discover
<extracted content>

## Network Requests
<list of unique domains/paths>

## Console Errors
<list or "None">

## Diff vs Baseline (live-site-snapshot.md)
<note any changes since the baseline snapshot>
```

## Step 7 — Update Baseline (if significant changes found)

If the scrape reveals content changes vs `live-site-snapshot.md`, note them clearly in the report under "Diff vs Baseline" and ask the user if the snapshot should be updated.
