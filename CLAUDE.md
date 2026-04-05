# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Monorepo with two independent workspaces:
- `backend/` — NestJS 11 API server (port 3001)
- `frontend/` — Next.js 16 (React 19) client (port 3000)

## Environment Setup

### Backend — `backend/.env` (copy from `.env.example`)
```
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...   # min 32 chars
JWT_REFRESH_SECRET=...  # min 32 chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend — `frontend/.env.local` (copy from `.env.example`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Commands

### Backend (`cd backend`)
```bash
npm run start:dev      # dev server with watch mode
npm run build          # compile TypeScript
npm run start:prod     # run compiled output
npm run test           # unit tests (Jest, rootDir: src, *.spec.ts)
npm run test:e2e       # e2e tests (test/jest-e2e.json)
npm run test:cov       # coverage
npm run lint           # ESLint --fix
npm run format         # Prettier
```

Run a single test file:
```bash
npx jest src/auth/auth.service.spec.ts
```

### Frontend (`cd frontend`)
```bash
npm run dev            # Next.js dev server (port 3000)
npm run build          # production build
npm run start          # production server
npm run lint           # ESLint
```

## Backend Architecture

NestJS modular architecture. Entry: `src/main.ts`. Root module: `src/app.module.ts`.

**Modules:**
- `auth/` — JWT + Passport authentication, bcryptjs password hashing, cookie-based tokens
- `users/` — User management
- `agents/` — AI agent definitions and management; `POST /agents/seed` seeds 6 sample agents for the authenticated user (idempotent)
- `chat/` — Real-time messaging via Socket.io (`@nestjs/websockets`, `@nestjs/platform-socket.io`)
- `marketplace/` — AI model marketplace; auto-seeds DB on startup via `OnModuleInit` (idempotent); `POST /marketplace/seed` triggers manually
- `discover/` — Research paper discovery; serves data from in-memory static array (no DB reads); `GET /discover?category=X` filters server-side
- `models/` — AI model catalog; serves data from in-memory static array; `GET /models?search=&type=&provider=&tier=`; `@Public()` (no auth required)
- `common/` — Shared guards, decorators, pipes, filters
- `config/` — Configuration via `@nestjs/config`

**Key libraries:** Mongoose (MongoDB), `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/swagger`, `@nestjs/throttler`, `helmet`, `cookie-parser`

**Testing:** Jest with `mongodb-memory-server` for in-memory MongoDB in tests. Unit test files live alongside source as `*.spec.ts`.

### Auth Flow

- **Access token**: 15 min JWT, returned in response body, stored in Zustand memory (never persisted)
- **Refresh token**: 7-day JWT, stored hashed in MongoDB, delivered as `HttpOnly SameSite=lax` cookie named `refresh_token`
- `JwtAuthGuard` is the global default; routes opt out with `@Public()` decorator
- `JwtRefreshGuard` extracts the refresh cookie; used only on `POST /auth/refresh`
- `@CurrentUser()` decorator injects the Passport-populated `request.user`

### Response Shape

All responses go through `TransformInterceptor`, wrapping them as:
```json
{ "data": <payload>, "statusCode": 200, "timestamp": "..." }
```
Frontend must access `res.data.data` (not `res.data`) when reading API responses.

### Rate Limiting

Two throttler profiles applied globally:
- `short`: 10 requests / 1 000 ms
- `long`: 100 requests / 60 000 ms

### WebSocket (Chat)

Gateway namespace `/chat`. On connect, extracts JWT from `socket.handshake.auth.token` and validates it. Real-time events: `join_session`, `send_message` (emits `new_message` to the room), `leave_session`. REST endpoints exist for the same operations — WebSocket is the real-time overlay, not a replacement.

### DNS Override

`main.ts` sets `dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])` at the very top (before all other imports) to fix `querySrv ECONNREFUSED` errors when the host's default DNS refuses SRV lookups required by `mongodb+srv://` connection strings. Do not move or remove this.

### Static-Data Modules

`models/` and `discover/` return data from in-memory arrays inside their service files — no DB queries on read paths. This allows them to work without DB connectivity and makes it easy to swap in third-party API calls later by replacing the array with a fetch.

## Frontend Architecture

Next.js 16 App Router. Entry: `src/app/`.

> **IMPORTANT:** Next.js 16.2.2 may have breaking changes vs. training data. Before writing Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

**Directory layout under `src/`:**
- `app/` — App Router pages and layouts
- `components/` — Reusable UI components (Radix UI primitives + Tailwind CSS v4)
- `hooks/` — Custom React hooks
- `store/` — Zustand global state
- `lib/` — Utilities, API client (axios), socket.io-client setup
- `types/` — Shared TypeScript types
- `data/` — Static/seed data (local fallbacks while API loads)

**Key libraries:** TailwindCSS v4 (PostCSS plugin), Zustand 5, TanStack React Query v5, React Hook Form + Zod v4, Socket.io-client, Radix UI, lucide-react, axios

### Providers Stack

```
<QueryClientProvider>       ← TanStack Query cache
  <SocketProvider>          ← socket.io-client context (auto-connects when accessToken exists)
    {children}
    <Toast />               ← driven by uiStore
  </SocketProvider>
</QueryClientProvider>
```

### State Management

| Store | Contents |
|---|---|
| `authStore` | `user`, `accessToken`, `isAuthenticated`; `setAuth`, `setAccessToken`, `clearAuth` |
| `chatStore` | `sessions[]`, `activeSessionId`; `setSessions`, `setActiveSession`, `addMessage`, `addSession`, `updateSession` |
| `uiStore` | `toasts[]` (auto-dismiss 4 s), `modelDetailModal`; `addToast`, `openModelDetail` |

### API Client (`src/lib/axios.ts`)

- Base URL: `process.env.NEXT_PUBLIC_API_URL` (must be set in `.env.local`)
- Attaches `Authorization: Bearer <accessToken>` from `authStore` on every request
- On 401: queues in-flight requests, POSTs `/auth/refresh` (cookie carries the refresh token), retries the queue with the new token. On refresh failure: calls `clearAuth()` and redirects to `/signin`

### WebSocket Client (`src/lib/socketContext.tsx`)

URL from `NEXT_PUBLIC_SOCKET_URL`. Consumed via `useSocket()` hook. Connects only when `accessToken` is present; disconnects when it clears.

### Data-Fetching Hooks

- `src/hooks/useAuth.ts` — `useLogin`, `useRegister`, `useLogout`, `useGetMe`
- `src/hooks/useChat.ts` — `useSessions`, `useMessages(sessionId)`, `useCreateSession`, `useSendMessage`, `useDeleteSession`
- `src/hooks/useAgents.ts` — `useAgents`, `useCreateAgent`, `useUpdateAgent`, `useDeleteAgent`, `useSeedAgents`
- `src/hooks/useMarketplace.ts` — `useMarketplace` (maps `MarketplaceItem` → `ModelData`), `useSeedMarketplace`
- `src/hooks/useModels.ts` — `useModels(params?)` — model catalog with search/filter params
- `src/hooks/useDiscover.ts` — `useDiscoverPapers(category?)` — research papers feed

**`useSendMessage` signature:** takes `{ sessionId, role, content }` in the mutation payload (not as a hook parameter) so it works when creating a session and sending the first message in the same handler.

### Fallback Pattern

Pages use local static data while the API loads:
```ts
const { data: apiModels } = useMarketplace();
const allModels = apiModels ?? MODELS; // MODELS from src/data/models.ts
```

### Marketplace Type Adapter

`useMarketplace` maps backend `MarketplaceItem` (with `_id`, numeric `contextWindow`, no `emoji`) to frontend `ModelData` format. Backend types `llm/multimodal/embedding/tool` map to frontend type `language`; `image/audio/code/vision` map directly. Do not pass raw `MarketplaceItem` to `ModelCard` — use the hook.

### Styling

Tailwind v4 via PostCSS (`postcss.config.mjs`). Color tokens live as CSS variables (`--bg`, `--text`, `--accent`, `--border`, etc.) defined in `globals.css`. Components use inline `style={{ color: 'var(--accent)' }}` for dynamic theming alongside Tailwind utility classes.

### `'use client'` Requirement

Any component that uses event handlers (`onClick`, `onMouseEnter`, `onChange`, etc.), React hooks, or browser APIs **must** have `'use client'` as its very first line. Server Components cannot pass event handler props — missing this directive causes a build-time error.

### AppNav Positioning

`AppNav` is `position: fixed; top: 0; z-50; height: h-16 (64px)`. Every page root container must have `pt-16` to avoid content being hidden under the nav.
