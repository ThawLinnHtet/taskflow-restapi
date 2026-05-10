# AGENTS.md

## Project overview
Express 5 REST API (TypeScript, ESM) with Prisma 7 + PostgreSQL, JWT auth, Zod validation.

## Commands
| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript (`tsc`) to `dist/` |
| `npm start` | Run production build (`node dist/server.js`) |
| `npm run type-check` | Type-check without emitting (`tsc --noEmit`) |
| `npm run db:seed` | Seed database with test data |
| `npm run db:reset` | Reset database (drops and re-runs migrations) |

There are **no lint, test, or format commands** defined.

## Architecture

```
src/
  server.ts          # Entry point — listens on configured port
  app.ts             # Express app setup, middleware, route mounting
  config/
    env.ts           # Typed env config (PORT, NODE_ENV)
    prisma.ts        # Prisma client singleton (pg adapter + Pool)
  common/
    middleware/       # authMiddleware, validate (Zod), rateLimiter, rbac, errorHandler
    utils/           # asyncHandler, jwt helpers, response formatters
    errors/          # AppError class
  modules/
    auth/            # /api/auth — register, login, refresh, logout
    v1/task/         # /api/v1/tasks — CRUD (auth-protected)
  types/
    express.d.ts     # Augments Express Request with req.user
```

Routes: `app.ts` mounts auth at `/api/auth` and tasks at `/api/v1/tasks`. Tasks require `authMiddleware`; auth routes do not.

## ESM module quirks
`package.json` sets `"type": "module"`. All TypeScript imports **must use `.js` extensions**:
```ts
import app from "./app.js";       // correct
import app from "./app";          // WRONG — runtime crash
```
`tsconfig.json` uses `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`.

## Prisma 7 specifics
- Client uses `@prisma/adapter-pg` with a `pg.Pool` (see `src/config/prisma.ts`).
- After editing `prisma/schema.prisma`, run **`npx prisma generate`** then migrate.
- Config lives in `prisma.config.ts` (not the old `schema.prisma` datasource block alone).
- Prisma client output goes to `generated/prisma/` (gitignored).

## Validation convention
The `validate` middleware expects Zod schemas shaped as `z.object({ body, query, params })` — not raw body schemas. See `auth.schema.ts` or `task.schema.ts` for examples.

## Auth
- Access tokens (15m) returned in response body; refresh tokens (7d) set as httpOnly cookies.
- Refresh endpoint reads the token from `req.cookies.refreshToken`.
- JWT secrets required in production; dev falls back to hardcoded values.
- `authMiddleware` extracts the Bearer token and sets `req.user` with `userId` and `role`.

## Response format
All responses use the helpers in `src/common/utils/response.ts`:
- `apiSuccess(res, data)` — 200
- `apiCreated(res, data)` — 201
- `apiNoContent(res)` — 204
- `apiError(res, statusCode, code, message, details?)` — error shape

## Environment
- `.env` is gitignored (contains real secrets). `.env.local` is tracked with placeholder values.
- Required vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- Optional: `PORT` (default 3000), `NODE_ENV` (default "development")
- `dotenv/config` is imported in `src/config/prisma.ts` and `prisma.config.ts`.

## Database
PostgreSQL. Seed credentials: `admin@example.com` / `admin123` and `test@example.com` / `password123`.
