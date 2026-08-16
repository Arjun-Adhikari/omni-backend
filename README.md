# omni-backend

An omnichannel customer support inbox backend. Receives incoming customer messages from messaging channels, stores them, and lets support agents reply back through the same channel.

**Current status:** Facebook Messenger only (text messages). Instagram and WhatsApp (Meta channels) planned.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express 5 |
| ORM | Sequelize 6 |
| Database | PostgreSQL (Neon) |
| HTTP client | Axios (Facebook Graph API) |
| Migrations | sequelize-cli |
| Dev tooling | nodemon |

## Prerequisites

- Node.js (ESM supported)
- A PostgreSQL database (e.g. Neon) — connection via `DATABASE_URL`

## Setup

```bash
npm install
```

Create a `.env` file (see [Configuration](#configuration)).

```bash
npm run migrate        # apply schema (DB must be reachable)
npm run dev            # nodemon, auto-restart
# or
npm start              # plain node
```

Server: `http://localhost:3000` (PORT from `.env`). Graceful shutdown on SIGINT/SIGTERM.

## Configuration

`.env` (gitignored):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
CORS_ORIGINS=*            # comma-separated list for production
```

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness probe (status + uptime) |
| GET | `/webhook/facebook` | Facebook webhook verification handshake |
| POST | `/webhook/facebook` | Incoming Facebook events (signature-verified) |
| GET | `/api/channels` | List channels (tokens stripped) |
| POST | `/api/channels` | Create a channel |
| GET | `/api/channels/:id` | Get one channel |
| PATCH | `/api/channels/:id` | Update a channel |
| DELETE | `/api/channels/:id` | Delete a channel |
| GET | `/api/conversations` | Inbox list (sorted by `lastMessageAt` DESC) |
| GET | `/api/conversations/:id` | Conversation detail with message history |
| PATCH | `/api/conversations/:id/status` | Change status (open/pending/closed) |
| POST | `/api/conversations/:id/messages` | Send an agent reply (via Facebook Graph API) |

All responses use a consistent envelope:

```jsonc
// Success
{ "success": true, "message": "Channel created successfully", "data": { ... } }

// Error
{ "success": false, "statusCode": 404, "message": "Channel not found", "data": null }
```

## Architecture

```
routes → controllers → services → repositories → models (Sequelize)
                          ↓
                     providers (external APIs, e.g. Facebook Graph)
```

## Project Structure

```
omni-backend/
├── migrations/          # sequelize-cli versioned migrations
├── src/
│   ├── config/          # env.js, database.js, sequelize.config.cjs
│   ├── models/          # Sequelize models + defineAssociations.js
│   ├── repositories/    # all DB access
│   ├── providers/       # external API integrations (Facebook)
│   ├── services/        # business logic
│   ├── controllers/     # request handling + validation
│   ├── routes/          # path definitions
│   ├── middleware/      # errorHandler.js, notFound.js
│   ├── utils/           # AppError.js
│   ├── app.js           # Express app assembly (importable, no listen)
│   └── server.js        # entry point: DB authenticate + listen + shutdown
├── package.json
└── .env                 # gitignored
```

## Migrations

Schema is managed by versioned migrations (no runtime `sync()`):

```bash
npm run migrate        # apply pending migrations
npm run migrate:undo   # revert the last migration
```

**Deploy flow:** `npm run migrate` → `npm start`

## Security

- Webhook authenticity via HMAC-SHA256 signature verification (`X-Hub-Signature-256`, timing-safe compare)
- `accessToken` / `appSecret` / `verifyToken` never returned in API responses
- Fail-fast env validation at startup
- Body limit `1mb`, CORS restricted via env, `x-powered-by` disabled
- DB: SSL required, SQL logging disabled, connection pooling
- UUID validation on all `:id` params

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for the full living project documentation (schema, core flows, roadmap).
