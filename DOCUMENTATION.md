# Omni-Backend — Project Documentation

> Living documentation — updated continuously until the end of the project.
> Last updated: 2026-08-02 (commit `ef5d9f9`)

---

## 1. Project Overview

Omni-Backend is an **omnichannel customer support inbox backend**. It receives incoming customer messages from messaging channels, stores them, and allows support agents to reply back through the same channel.

**Current state:** Facebook Messenger only (text messages). Instagram and WhatsApp (Meta channels) are planned for later.

**Design goals:** production-grade practices (layered architecture, consistent API responses, webhook signature verification, versioned DB migrations), even while built incrementally.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express 5 (native async error handling — no `asyncHandler` wrappers) |
| ORM | Sequelize 6 |
| Database | PostgreSQL (Neon cloud, connection via `DATABASE_URL`) |
| HTTP client | Axios (Facebook Graph API) |
| Validation | Manual checks in controllers (zod was used briefly, removed at owner request — to be re-added later) |
| Migrations | sequelize-cli |
| Dev tooling | nodemon |

---

## 3. Architecture (Layered)

```
routes → controllers → services → repositories → models (Sequelize)
                          ↓
                     providers (external APIs, e.g. Facebook Graph)
```

- **routes/** — path definitions only
- **controllers/** — request handling, manual input validation, response envelope
- **services/** — business logic, orchestration, `AppError` throwing
- **repositories/** — all DB access (models are never touched outside repositories)
- **providers/** — external API integrations (Facebook)
- **models/** — Sequelize model definitions + `defineAssociations.js`
- **middleware/** — global error handler, 404 handler
- **utils/** — `AppError`
- **config/** — `env.js` (env loading), `database.js` (Sequelize instance), `sequelize.config.cjs` (migration CLI config)

---

## 4. Folder Structure

```
omni-backend/
├── migrations/          # sequelize-cli versioned migrations
├── src/
│   ├── config/
│   │     database.js
│   │     env.js
│   │     sequelize.config.cjs
│   ├── models/          # 6 models + defineAssociations.js
│   ├── repositories/    # 5 repositories
│   ├── providers/       # facebook.provider.js
│   ├── services/        # 4 services
│   ├── controllers/     # 4 controllers
│   ├── routes/          # webhook, channel, conversation, message + index
│   ├── middleware/      # errorHandler.js, notFound.js
│   ├── utils/           # AppError.js
│   ├── app.js           # Express app assembly (importable, no listen)
│   └── server.js        # entry point: DB authenticate + listen + graceful shutdown
├── package.json
├── .env                 # gitignored
└── .gitignore
```

---

## 5. Database Schema

### Tables & relationships

```
Channel 1───∞ CustomerIdentity ∞───1 Customer
   │ ∞                 │ ∞
   ├──∞ Conversation ──┘
   │        │ ∞
   ├──∞ WebhookEvent    Message ∞───1 (belongsTo Conversation)
```

| Model / table | Purpose | Key fields |
|---|---|---|
| `channels` | A Facebook page config | `type` ENUM('facebook'), `name`, `pageId`, `accessToken`, `appSecret`, `verifyToken`, `isActive` |
| `customers` | A real person (channel-agnostic) | `name`, `email`, `phone`, `avatarUrl` |
| `customer_identities` | Links customer ↔ channel via provider user id | `customerId`, `channelId`, `providerUserId` (PSID), `providerProfile` (JSONB) |
| `conversations` | A chat thread | `channelId`, `customerId`, `providerConversationId`, `status` ENUM('open','pending','closed'), `lastMessageAt` |
| `messages` | One message in a conversation | `conversationId`, `senderType` ENUM('customer','agent'), `providerMessageId`, `messageType` ENUM('text'), `content`, `sentAt` |
| `webhook_events` | Raw audit log of every webhook received (idempotency/debug layer) | `channelId`, `eventType`, `rawPayload` (JSONB), `status` ENUM('received','processed','failed'), `error`, `processedAt` |

All IDs are UUIDv4. All tables have `createdAt`/`updatedAt`. Foreign keys use `ON DELETE CASCADE`.

### Indexes (all explicit BTREE)

- `uq_channels_page_id` (unique) — channels.pageId
- `uq_customer_identities_channel_provider_user` (unique) — (channelId, providerUserId)
- `idx_customer_identities_customer_id` — customerId
- `uq_conversations_channel_provider` (unique) — (channelId, providerConversationId)
- `idx_conversations_customer_id`, `idx_conversations_channel_id`, `idx_conversations_last_message_at`
- `uq_messages_provider_message_id` (unique) — providerMessageId
- `idx_messages_conversation_id`, `idx_messages_sent_at`
- `idx_webhook_events_channel_id`

> Note: Postgres does NOT auto-index foreign keys — the FK indexes above are the important additions for join performance.

---

## 6. API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/webhook/facebook` | Facebook webhook verification handshake (returns `hub.challenge`) |
| POST | `/webhook/facebook` | Incoming Facebook events (signature-verified, raw body) |
| GET | `/api/channels` | List channels (tokens stripped) |
| POST | `/api/channels` | Create a channel |
| GET | `/api/channels/:id` | Get one channel |
| PATCH | `/api/channels/:id` | Update a channel |
//This patch for updating a channel doenot need to be included.
| DELETE | `/api/channels/:id` | Delete a channel |
| GET | `/api/conversations` | Inbox list (customer + channel + last message, sorted by `lastMessageAt` DESC) |
| GET | `/api/conversations/:id` | Conversation detail with full message history |
| PATCH | `/api/conversations/:id/status` | Change status (open/pending/closed) |
| POST | `/api/conversations/:id/messages` | Send an agent reply (via Facebook Graph API) |

---

## 7. Response & Error Conventions

### Consistent envelope for every response

```jsonc
// Success (HTTP 2xx)
{ "success": true,  "message": "Channel created successfully", "data": { ... } }

// Error (HTTP 4xx/5xx)
{ "success": false, "statusCode": 404, "message": "Channel not found", "data": null }
```

### Error classification (global middleware, `src/middleware/errorHandler.js`)

| Error type | HTTP | Message |
|---|---|---|
| `AppError` (operational) | its own statusCode | its own message |
| Sequelize validation error | 400 | field messages joined |
| Sequelize unique constraint | 409 | "Resource already exists" |
| Body too large | 413 | "Request body too large" |
| Unknown/internal | 500 | "Internal Server Error" (internals never leaked) |

Express 5 auto-forwards rejected promises from async controllers to the error middleware — no try/catch wrappers needed.

### Webhook behavior (production-safe)
- Every event is persisted to `webhook_events` **before** processing.
- Processing failures mark the event `failed` (with error) but still return 200 — Facebook retries are never triggered by processing bugs; the audit trail preserves the payload for replay/debug.
- Missing/invalid `X-Hub-Signature-256` → 401/403.

---

## 8. Core Flows

### Incoming message (customer → system)

```
Facebook → POST /webhook/facebook
  → verify X-Hub-Signature-256 (HMAC-SHA256, timing-safe compare)
  → find channel by pageId
  → save WebhookEvent (status: received)
  → process: PSID → find/create CustomerIdentity (+ Customer via Graph profile)
  → findOrCreate Conversation (by channelId + PSID)
  → insert Message (senderType: customer)
  → update conversation lastMessageAt
  → mark event processed (or failed with error)
```

### Outgoing reply (agent → customer)

```
POST /api/conversations/:id/messages
  → validate text (required, ≤2000 chars)
  → find conversation → find channel (must be active)
  → sendTextMessage via Graph API (/me/messages)
  → insert Message (senderType: agent, providerMessageId from Graph)
  → update conversation lastMessageAt
```

---

## 9. Security Measures (current)

- **Webhook authenticity:** HMAC-SHA256 signature verification using the channel `appSecret` (crypto.timingSafeEqual) — webhook route mounted before `express.json()` so raw body is captured
- **Token protection:** `accessToken`/`appSecret`/`verifyToken` are never returned in any API response (field stripping in `channel.service.js`)
- **Env validation:** fail-fast at startup if `DATABASE_URL` missing
- **Body limit:** `express.json({ limit: '1mb' })`
- **Headers:** `x-powered-by` disabled; CORS origin restricted via env (`CORS_ORIGINS`)
- **DB:** SSL required (Neon), SQL logging disabled, connection pooling
- **UUID validation** on all `:id` params (regex) → 400 before hitting the DB

### Deliberately deferred (owner's roadmap)
- Auth/JWT (to be added at the very end)
- zod schema validation (was installed, then removed; to be re-added)
- Logging / error visibility (to be added when requested)
- helmet / rate limiting (kept minimal on purpose)
- Token encryption at rest

---

## 10. Configuration & Environment

`.env` (gitignored) — see `.env` locally:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require&channel_binding=require
CORS_ORIGINS=*            # comma-separated list for production
```

`src/config/env.js` loads and exports validated config. `src/config/sequelize.config.cjs` is used by sequelize-cli (reads the same `DATABASE_URL`, forces SSL).

> Note: `channel_binding=require` works with node-postgres; if a future driver fails on it, drop that query param.

---

## 11. Database Migrations (production workflow)

`sequelize.sync()` is **not** used at runtime — schema is managed by versioned migrations:

```bash
npm run migrate        # apply pending migrations
npm run migrate:undo   # revert the last migration
```

- Config: `src/config/sequelize.config.cjs` (CJS on purpose — CLI loads via require in a type:module package)
- `.sequelizerc` deliberately omitted (breaks under `"type": "module"`); CLI flags in npm scripts instead
- Migration files are `.cjs` (CLI requires them; supports `(cjs|js|cts|ts)`)
- Baseline: `migrations/20260802000000-create-initial-schema.cjs` — 6 tables, FKs, ENUMs, named BTREE indexes
- `SequelizeMeta` table tracks applied migrations; re-running is idempotent

**Deploy flow:** `npm run migrate` → `npm start`

---

## 12. Running Locally

```bash
npm install
npm run migrate        # apply schema (Neon must be reachable)
npm run dev            # nodemon, auto-restart
# or
npm start              # plain node
```

Server: `http://localhost:3000` (PORT from .env). Graceful shutdown on SIGINT/SIGTERM (closes server + DB pool).

---

## 13. Known Notes / Gotchas

- Neon can occasionally throw transient `ETIMEDOUT` — retry; not a code issue
- Postgres emits a harmless pg warning about `sslmode=require` being treated as `verify-full` (safe for Neon)
- `sequelize.sync()` won't alter existing tables — never rely on it in production; always add a migration
- Never run `sync({ force: true })` against a DB with data (destructive drop/recreate)

---

## 14. Roadmap / Upcoming Work (append as it evolves)

- [ ] Connect a real Facebook app/page and test the webhook loop live
- [ ] zod schema validation (re-add)
- [ ] Auth/JWT
- [ ] Logging
- [ ] Additional Meta channels (Instagram, WhatsApp) — note: ENUM changes need migrations
- [ ] Attachments / non-text message types
- [ ] Agent UI (frontend) integration
- [ ] Token encryption at rest / secrets manager
- [ ] helmet + rate limiting for hardening
