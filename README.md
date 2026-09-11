# brainboard.

> A real-time collaborative whiteboard — think together, in the same canvas, at the same time.

![Brainboard Hero](https://res.cloudinary.com/denzlvzte/image/upload/v1788412938/brainboard-diagram-arch_l3d8i4.png)

---

## What is Brainboard?

Brainboard is a **multiplayer canvas** that lets teams sketch, plan, and build ideas together in real time. Users can create or join rooms, draw shapes, and see every change from collaborators instantly — all backed by a persistent database so nothing is ever lost.

---

## Monorepo Structure

This project is a **pnpm + Turborepo** monorepo.

```
brainboard/
├── apps/
│   ├── brainboard-ui      # Next.js 16 frontend (React 19, Tailwind CSS v4, Fabric.js)
│   ├── http-backend       # Express 5 REST API  (auth, room management)
│   └── ws-backend         # WebSocket server    (real-time canvas sync)
└── packages/
    ├── backend-common     # Shared config (env vars, JWT secret, CORS origins)
    ├── common             # Shared TypeScript types
    ├── database           # Prisma client + PostgreSQL schema
    ├── ui                 # Shared React component library
    ├── eslint-config      # Shared ESLint config
    └── typescript-config  # Shared tsconfig bases
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Fabric.js |
| HTTP API | Express 5, bcrypt, JOSE (JWT) |
| Real-time | `ws` WebSocket server |
| Database | PostgreSQL via Prisma ORM |
| Monorepo | pnpm workspaces + Turborepo |
| Language | TypeScript throughout |

---

## Database Schema

```
User  ──┐
        │ (admin)
        ▼
       Room ──► Shape[]
```

- **User** — authentication, uniquely identified by `email` and `username`
- **Room** — a collaborative canvas session, owned by one admin user, identified by a `slug`
- **Shape** — a persisted canvas object (stored as JSON) belonging to a room

---

## WebSocket Protocol

The WS server (port **8080**) is authenticated via a JWT passed as a query parameter (`?token=...`).

Once connected, clients send JSON messages:

The WebSocket server supports five event types: `join_room` subscribes a user to a room’s updates, `leave_room` unsubscribes them, `draw` creates a new shape that is persisted by the server and broadcast to other users, `update` mutates an existing shape and broadcasts the change after updating the database, and `delete` removes a shape from the database and broadcasts the deletion.


The server responds with acknowledgement messages (`shape_created`, `shape_updated`, `shape_deleted`) so clients can reconcile optimistic updates.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** 9
- A running **PostgreSQL** instance

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Each app/package that needs environment variables has its own `.env` file. At minimum:

**`packages/database/.env`**
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/brainboard"
```

**`packages/backend-common/.env`**
```env
JWT_SECRET="your-secret-here"
ENVIRONMENT="DEV"
DEV_CORS_ORIGIN="http://localhost:3000"
PROD_CORS_ORIGIN="https://yourdomain.com"
```

**`apps/brainboard-ui/.env`**
```env
NEXT_PUBLIC_HTTP_BACKEND_URL="http://localhost:8000"
NEXT_PUBLIC_WS_BACKEND_URL="ws://localhost:8080"
```

### 3. Run database migrations

```bash
cd packages/database
pnpm prisma migrate dev
```

### 4. Start all services

```bash
pnpm dev
```

This runs everything in parallel via Turborepo:

| Service | Port |
|---|---|
| `brainboard-ui` (Next.js) | 3000 |
| `http-backend` (Express) | 8000 |
| `ws-backend` (WebSocket) | 8080 |

---

## Available Scripts

Run these from the **root** of the repo:

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all workspaces |
| `pnpm check-types` | Type-check all workspaces |
| `pnpm format` | Format all `.ts`, `.tsx`, and `.md` files with Prettier |