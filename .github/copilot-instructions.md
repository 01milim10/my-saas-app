# Copilot / AI Agent Instructions for my-saas-app

Short goal: help make safe, minimal, and idiomatic changes to this Next.js (App Router) TypeScript project. Prefer small, verifiable edits (build & type check) and reference the files below when changing behavior.

Key facts (quick):
- Framework: Next.js (App Router) — project lives under `app/`.
- Auth: Clerk is used. Server-side auth helpers come from `@clerk/nextjs/server`.
- DB: Supabase is used via `lib/supabase.ts` and server actions in `lib/actions/*.ts`.
- AI integration: `@vapi-ai/web` usage in `lib/vapi.sdk.ts` (env: NEXT_PUBLIC_VAPI_WEB_TOKEN).
- Error/monitoring: Sentry configured in `next.config.ts`, `instrumentation.ts`, and `instrumentation-client.ts`.

Why these matter:
- Most business logic runs in server actions (see `lib/actions/companion.actions.ts`) and expects "use server" semantics and access to Clerk `auth()`.
- `createSupabaseClient()` injects Clerk access tokens (see `lib/supabase.ts`) — changing auth or Supabase usage requires updating both that factory and callers.
- The root layout opts out of static rendering (`export const dynamic = 'force-dynamic'`) because Clerk needs request headers. Avoid reintroducing static-only patterns at the root.

Commands / Dev flow:
- Run local dev: `npm run dev` (package.json uses `next dev --turbopack`).
- Build: `npm run build` (uses Turbopack). `npm start` runs the production server.
- Lint: `npm run lint`.

Conventions and patterns to follow (concrete):
- Server actions and server-only helpers use the top-line directive: `"use server"`. Example: `lib/actions/companion.actions.ts`.
- Use Clerk server helpers: `import { auth } from "@clerk/nextjs/server";` then `const { userId } = await auth();` — many actions depend on this pattern.
- Supabase client factory: `createSupabaseClient()` in `lib/supabase.ts` expects env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. It supplies accessToken via Clerk's `auth().getToken()`.
- API route handlers use the App Router `route.ts` pattern under `app/api/*`.
- Feature flags/permissions: the code checks Clerk `has(...)` for plan/feature flags (see `newCompanionPermissions()` in `lib/actions/companion.actions.ts`). Mirror that logic when adding limits.

Integration points / env variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_VAPI_WEB_TOKEN
- (Sentry DSN is embedded in `instrumentation-client.ts` but CI/production may override via env)

Files to reference when making common edits:
- Authentication & server-authorized requests: `lib/supabase.ts`, `lib/actions/companion.actions.ts`
- AI/VAPI usage: `lib/vapi.sdk.ts`
- Monitoring and telemetry: `instrumentation.ts`, `instrumentation-client.ts`, `next.config.ts`
- Middleware that guards routes: `middleware.ts` (uses `clerkMiddleware()` and has a custom `matcher`).
- App layout & rendering rules: `app/layout.tsx` (note `dynamic = 'force-dynamic'`)
- Example API handler: `app/api/sentry-example-api/route.ts`

Editing guidance (do this, not that):
- Do: Make small, targeted changes and run `npm run dev` or `npm run build` to verify the app still compiles. Prefer TypeScript-safe edits.
- Do: When adding server calls to Supabase, use `createSupabaseClient()` so auth tokens are available.
- Do: Respect `"use server"` and the boundary between client and server files. Adding server-only imports into client components will break the build.
- Don't: Replace `dynamic = 'force-dynamic'` at the root layout without validating Clerk behavior — that will break auth.
- Don't: Hardcode sensitive keys. Use environment variables. If you add a new env var, document it here.

Examples to copy/paste (adapt):
- Server action pattern:
  'use server'
  import { createSupabaseClient } from '@/lib/supabase';
  import { auth } from '@clerk/nextjs/server';

  export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();
    // ...
  }

- Supabase token factory (see `lib/supabase.ts`):
  export const createSupabaseClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { async accessToken() { return (await auth()).getToken(); } }
  )

What to run locally (short):
- Development: `npm run dev` and open http://localhost:3000
- Quick typecheck: `npx tsc --noEmit` (if you want a stricter check independent of Next's build)

If you touch monitoring or Sentry:
- Source maps and Sentry options are wired through `next.config.ts` via `withSentryConfig`. Be mindful of `silent: !process.env.CI` and `widenClientFileUpload` settings.

If you touch images or external hosts:
- `next.config.ts` contains `images.remotePatterns` — add hostnames there for external images.

Notes / assumptions discovered:
- No `.github/copilot-instructions.md` existed prior; this is a first version.
- Project uses Next 15 + React 19 and Turbopack flags in scripts; builds may differ from older Next.js examples.

If unclear sections are needed (tests, CI, or deployment), tell me which area to expand and I will update this file.
