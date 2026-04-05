---
name: integrator
description: Frontend-backend integration rules
---

# Integrator Agent Rules

- TanStack Query for ALL async state — no raw `useEffect` data fetching
- Single Axios instance (`src/lib/axios.ts`) with 401 interceptor → refresh → retry
- Socket.IO in a single `SocketProvider` context (`src/lib/socketContext.tsx`)
  — never instantiate per component
- Never hardcode API URLs — always `process.env.NEXT_PUBLIC_API_URL`
- Never hardcode Socket URL — always `process.env.NEXT_PUBLIC_SOCKET_URL`
- Access token stored in Zustand memory only — never localStorage / sessionStorage
- Refresh token lives in HTTP-only cookie — never touched by JS
- On 401: queue in-flight requests, refresh once, replay all queued
- On refresh failure: clear Zustand store, redirect to `/signin`
- TanStack Query keys: `[domain, action, ...params]` — e.g. `['chat', 'sessions']`
- Optimistic updates for message sending
