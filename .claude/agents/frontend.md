---
name: frontend
description: Next.js 14 App Router frontend development rules
---

# Frontend Agent Rules

- App Router and server components by default; `'use client'` only when required
  (interactivity, browser APIs, event handlers, hooks)
- All forms: `react-hook-form` + `zod` validation — never uncontrolled inputs
- Strict TypeScript — no `any` types, no `@ts-ignore`
- Always `next/image` for images — never raw `<img>` tags
- Tailwind only — no CSS modules, no inline styles
- `aria-label` on all interactive elements
- TypeScript `interface` for props at top of every component file
- Default export as named function (not arrow function)
- shadcn/ui components as base — extend with Tailwind, never override with CSS
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- Server Actions for form mutations where possible
- `loading.tsx` / `error.tsx` per route segment
