# SMKN 2 Godean Graduation Announcement System

## Overview

This is a full-stack web application for announcing student graduation results at SMKN 2 Godean, an Indonesian vocational school. The app has two main parts:

1. **Public-facing site** — Students/parents enter their NIS (student ID) and birth date to check graduation status. Includes a countdown timer to the announcement date, confetti animation for passing students, and a modern glassmorphism UI in Indonesian language.

2. **Admin panel** — Authenticated administrators can manage student records (CRUD), configure announcement settings (date/time, open/close announcements), and view a dashboard.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight client-side router)
- **State/Data fetching**: TanStack React Query for server state management
- **Forms**: `react-hook-form` with `zod` validation via `@hookform/resolvers`
- **UI Components**: shadcn/ui component library (Radix UI primitives + Tailwind CSS)
- **Styling**: Tailwind CSS with CSS variables for theming, custom fonts (Plus Jakarta Sans, Outfit), glassmorphism effects
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Special effects**: `react-confetti` for graduation celebration
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, executed via `tsx` in dev mode
- **API style**: REST API under `/api/` prefix, with route definitions shared between client and server in `shared/routes.ts`
- **Authentication**: Passport.js with `passport-local` strategy, using `express-session` with `memorystore` for session storage. Passwords are hashed with Node's native `scrypt`.
- **Session**: Cookie-based sessions (not JWT)
- **Build**: Custom build script using esbuild for server bundling and Vite for client. Production output goes to `dist/` (server as `dist/index.cjs`, client as `dist/public/`)

### Shared Code (`shared/`)
- **`schema.ts`**: Drizzle ORM table definitions and Zod insert schemas for `admins`, `students`, and `settings` tables. This is the single source of truth for types.
- **`routes.ts`**: API route definitions with paths, methods, input/output Zod schemas. Used by both frontend hooks and backend route handlers for type safety.

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Driver**: `pg` (node-postgres) with connection pooling
- **Schema push**: `npm run db:push` uses `drizzle-kit push` (no migration files needed)
- **Tables**:
  - `admins` — id, email (unique), password (hashed)
  - `students` — id, nis (unique), name, major, birthDate (YYYY-MM-DD), status ("LULUS"/"TIDAK LULUS"), notes
  - `settings` — id, announcementDate (timestamp), isOpen (boolean)
- **Storage layer**: `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class wrapping Drizzle queries

### Dev vs Production
- **Development**: Vite dev server runs as middleware on the Express server with HMR. Run with `npm run dev`.
- **Production**: Client is pre-built to static files in `dist/public/`, server is bundled to `dist/index.cjs`. Express serves static files via `server/static.ts`. Run with `npm run build && npm start`.

### Key Design Decisions
- **Shared schema and routes**: The `shared/` directory ensures type safety across the full stack. Zod schemas validate both client inputs and server responses.
- **No ORM migrations**: Uses `drizzle-kit push` for schema synchronization, which is simpler but means no rollback capability.
- **Memory session store**: Uses `memorystore` instead of `connect-pg-simple` for simplicity. This means sessions are lost on server restart. For production at scale, switch to a persistent store.
- **Rate limiting**: The project includes `express-rate-limit` as a dependency for brute-force protection on the graduation check endpoint.

## External Dependencies

### Database
- **PostgreSQL** — Required. Connection string provided via `DATABASE_URL` environment variable.

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Secret for session encryption (falls back to a default in dev)
- `PORT` — Server port (defaults to 5000)

### Key npm Packages
- **Server**: express, drizzle-orm, pg, passport, passport-local, express-session, memorystore, express-rate-limit, zod
- **Client**: react, react-dom, @tanstack/react-query, wouter, react-hook-form, framer-motion, react-confetti, date-fns, lucide-react
- **UI**: Full shadcn/ui component set (Radix UI primitives), tailwindcss, class-variance-authority
- **Build**: vite, esbuild, tsx, drizzle-kit, typescript

### Replit-specific
- `@replit/vite-plugin-runtime-error-modal` — Shows runtime errors in dev
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` — Dev-only Replit integrations