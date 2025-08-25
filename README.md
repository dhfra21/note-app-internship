# Notes App as a blueprint for a Full-Stack application (NestJS + Next.js)

Full‑stack notes application with JWT authentication, notes CRUD, profile image uploads, Redis caching, global input validation, and per‑route rate limiting.

## Features

- User authentication (bcrypt + JWT)
- Protected notes CRUD with ownership checks
- Profile picture upload (Multer memory storage → static serving)
- Redis caching for faster reads with targeted invalidation
- Global Zod validation and centralized error handling
- Per‑route rate limiting (NestJS) and Nginx reverse proxy

## Architecture

```
Internet → Nginx (80) → Next.js (3000) → NestJS API (3001) → PostgreSQL
                                   ↘ Redis (6379) for cache
```

## Quick Start (Docker Compose)

### Prerequisites
- Docker
- Docker Compose

### 1) Clone
```bash
git clone <repository-url>
cd note-app-internship
```

### 2) Environment
Create a `.env` at repo root and `backend/.env`.

Root `.env` (optional for Next.js):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

`backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/notes?schema=public
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=replace-with-strong-secret
```

### 3) Up
```bash
docker-compose up -d --build
```

Open:
- Frontend: http://localhost
- API: http://localhost/api

## Local Development (without Docker)

### Backend
```bash
cd backend
npm install
cp .env.example .env  # if you have one; otherwise create as above
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

### Frontend
```bash
npm install
npm run dev
```

## API Overview

Auth
- POST `/api/auth/register` → { email, password }
- POST `/api/auth/login` → returns `{ access_token }`

Notes (requires `Authorization: Bearer <token>`) 
- GET `/api/notes` → list current user notes (cached per user)
- POST `/api/notes` → { title, content }
- PATCH `/api/notes/:id` → { title?, content? }
- DELETE `/api/notes/:id`

Users
- POST `/api/users/upload-profile-picture` → multipart `file`
- GET `/api/users/profile`

## Caching

- Per‑user list key: `notes:{userId}`
- Per‑note key: `note:{id}`
- Invalidation: on create/update/delete, relevant keys are deleted to avoid stale data.

## Rate Limiting

- Application level (NestJS Throttler):
  - Auth endpoints: 5 req/min
  - CRUD endpoints: 30 req/min
- Nginx reverse proxy is provided; add extra limits there if needed.

## Environment Variables

Backend
- `DATABASE_URL` (required)
- `REDIS_HOST` (default: `localhost` in code, `redis` in Docker)
- `REDIS_PORT` (default: `6379`)
- `JWT_SECRET` (required; no weak defaults in production)

Frontend
- `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)

## Uploads

Profile photos are written to `backend/uploads/profiles` and served at `/uploads/profiles/<filename>` by the NestJS static assets configuration.

## Notes on Data Model

- `User` has many `Note` via `userId`.
- Ensure ownership checks use both `id` and `userId` in queries; consider a composite unique index or `findFirst` with both filters.

## Production

1. Set strong secrets and production database/redis URLs in env.
2. Update `nginx.conf` with your domain and TLS.
3. Build and run with Compose or your platform of choice.

## Troubleshooting

Ports: 80, 3000, 3001, 5432, 6379 must be free.

Logs
```bash
docker-compose logs nginx | tail -n 200
docker-compose logs backend | tail -n 200
docker-compose logs frontend | tail -n 200
```

Rebuild
```bash
docker-compose up -d --build
```

## Roadmap / Improvements

- Require `Note.userId` and enforce ownership at DB level
- Switch `UsersController` to injected `PrismaService`
- Add `/api/users/me` for lightweight auth checks
- Wire pagination/sorting to queries (schemas already present)
- Harden CORS and remove default JWT secret in code
