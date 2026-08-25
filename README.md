# Northshore Studio — Admin Dashboard

A premium, production-quality admin dashboard frontend for a digital creative agency / corporate portfolio platform. **Frontend phase only** — all data flows through mock repositories designed so a Laravel 12/13 + Supabase backend can be connected later without refactoring the UI.

## Stack

- **Nuxt 4** + **Vue 3** + strict **TypeScript**
- **Nuxt UI v4** (accessible component foundation, incl. dashboard shell primitives)
- **Tailwind CSS v4** (layout, typography, design tokens)
- **Pinia** (strict global state: app/user, UI chrome, notifications, dashboard layout)
- **VueUse** (composable utilities)
- **Lucide** icons · **@nuxtjs/color-mode** (light / dark / system, via Nuxt UI)
- Hand-rolled, theme-aware **SVG charts** (no chart library) with a CVD-validated palette

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000 → redirects to /admin
pnpm build      # production build
pnpm typecheck  # vue-tsc
```

> npm 10 currently hits an arborist bug resolving this tree — use **pnpm** (or bun).

## Architecture

```
Component → Composable → Repository interface → Mock repository → Mock data
                                    ↑ future: Laravel API repository → Supabase/PostgreSQL/Redis
```

- `app/types/` — entity and shared types (Project, Lead, CaseStudy, …)
- `app/mock-data/` — deterministic, realistic seed datasets (never imported by components)
- `app/repositories/` — CRUD factory with simulated latency, pagination/filter/sort/search, and error simulation; one repository per domain
- `app/composables/` — `useCollection` / `useResource` (loading/empty/error state machines), `useMutation` (saving + toasts), `useConfirm` (accessible confirm dialogs), mock realtime feed
- `app/stores/` — Pinia stores for the signed-in admin + permission snapshot, UI chrome, notifications, dashboard personalisation
- `app/components/` — shell (sidebar, command palette, notification center), one reusable DataTable system, one editor framework (EditorShell + Publish/SEO/Revisions panels), charts, domain components
- `app/pages/admin/**` — ~40 thin routes across Content, Media, CRM, Workflow, Marketing, Analytics, Access, System and Security

## Highlights

- Command palette (⌘K) with navigation, actions and content search
- Customisable dashboard (add/remove/reorder/collapse widgets, persisted)
- Projects with table / grid / editorial views and a full editor with publishing workflow (draft → review → approved → scheduled → published → archived)
- Case-study block editor with drag & drop, undo/redo, autosave and responsive preview
- Visual page builder with block library, inspector, lock/hide/duplicate
- CRM with lead scoring, activity timelines and a drag & drop pipeline (optimistic updates with rollback)
- Media library (grid/list, folders, favourites, bulk actions, usage tracking)
- Analytics (overview, website, content, leads, conversion funnel) with accessible, dark-mode-aware charts
- Roles & permissions matrix — **UX simulation only**; real authorization is enforced by the backend later
- Settings → Advanced exposes the mock layer: tune latency, arm simulated errors, preview a read-only role

## Notes

- Permission checks in the frontend shape UX only. Never treat them as security.
- Mock realtime pushes live notifications every 45s (`● Live` indicator) and is shaped for a drop-in Supabase Realtime replacement.
