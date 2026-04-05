---
name: component-gen
description: Generates React components following NexusAI conventions
---

# Component Generator Skill

- TypeScript `interface` for props at top of every component file
- Default export as named function (not arrow function)
- Tailwind only — no CSS modules or inline styles
- `aria-label` on all interactive elements
- Use design tokens via CSS variables: `var(--accent)`, `var(--bg)` etc.
- Import order: React → Next → third-party → internal (@/components → @/lib → @/types)
- Named exports for sub-components within same file
- Skeleton loading states for all data-driven components
- Error boundaries on page-level components
