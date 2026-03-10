# Piegon — Claude Code Guide

## Project Overview
**Piegon** is an open-source, AI-powered email client built with Next.js 16, using Google OAuth (Gmail API) for authentication and email access. It features a three-pane layout (nav / email list / detail view) with AI summaries powered by the Anthropic SDK.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Auth:** NextAuth v4 with Google OAuth + Gmail scopes, Prisma adapter
- **Database:** PostgreSQL via Neon + Prisma ORM v7
- **AI:** `@anthropic-ai/sdk`
- **Styling:** CSS Modules + global CSS
- **Deployment:** Netlify + `@netlify/plugin-nextjs`

## Project Structure
```
src/
  app/
    api/auth/[...nextauth]/route.ts   # NextAuth route handler
    dashboard/
      page.tsx                        # Main email UI (3-pane layout, search bar)
      layout.tsx
      dashboard.css
    layout.tsx
    page.tsx                          # Landing / login page
  components/
    LoginButton.tsx
    Providers.tsx                     # SessionProvider wrapper
  lib/
    auth.ts                           # NextAuth config (Google provider + JWT callbacks)
    prisma.ts                         # Shared PrismaClient singleton
    mockData.ts                       # Mock emails for UI development
prisma/
  schema.prisma                       # User, Account, Session, Preferences models
prisma.config.ts                      # Prisma Studio on port 5555
netlify.toml                          # Netlify build config
.env.example                          # All required env vars documented
```

## Key Commands
```bash
npm run dev               # Start dev server (localhost:3000)
npm run build             # prisma generate && next build
npm run lint              # ESLint
npx prisma studio         # Open DB GUI (port 5555)
npx prisma db push        # Push schema changes to Neon DB
npx prisma generate       # Regenerate Prisma client
```

## Environment Variables
Copy `.env.example` to `.env.local` for local dev. In Netlify, set these under Site Settings > Environment Variables.

```
NETLIFY_DATABASE_URL=           # Neon pooled connection string
NETLIFY_DATABASE_URL_UNPOOLED=  # Neon direct connection (for migrations)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=                # openssl rand -base64 32
NEXTAUTH_URL=                   # https://your-site.netlify.app
ANTHROPIC_API_KEY=
```

## Deployment (Netlify + Neon)
1. Connect GitHub repo to Netlify
2. Add the Neon integration in Netlify (auto-sets `NETLIFY_DATABASE_URL` and `NETLIFY_DATABASE_URL_UNPOOLED`)
3. Set remaining env vars manually in Netlify dashboard
4. Build command is `npm run build` (runs `prisma generate` first automatically)
5. Run `npx prisma db push` once to initialize the schema on Neon

## Gmail OAuth Scopes
The app requests these Gmail scopes on login:
- `gmail.readonly` — read emails
- `gmail.send` — send emails
- `gmail.modify` — label/archive emails

The access token is stored in the JWT and forwarded on session callbacks via `session.accessToken`.

## Data Model Notes
- `User` has one `Preferences` record (theme, layout, AI rules, attachment viewer setting)
- `Account` stores OAuth tokens (linked to User)
- `Session` for session-based flows (JWT strategy is used by default)

## Current State
- Dashboard UI renders with `mockData.ts` — real Gmail API integration is not yet wired up
- Auth flow is functional (Google OAuth → JWT → session)
- AI summary field exists in mock data; Anthropic SDK is installed but integration is pending

## Development Notes
- Use `"use client"` for any component using React state/hooks
- Auth config lives in `src/lib/auth.ts` — import `authOptions` from there
- Shared Prisma singleton is in `src/lib/prisma.ts` — always import from there
- Do not use emojis in UI — use SVG icons or plain text labels instead
