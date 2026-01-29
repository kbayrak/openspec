# QR Menu App

QR code powered digital menu platform for restaurants and cafes. Built with Next.js + NestJS, Prisma, and PostgreSQL.

## Features

- Public menu at `/menu/[slug]` with category filtering
- Admin dashboard for categories, products, and QR management
- Multi-language menu support with per-item translations
- QR code generation, downloads (SVG/PNG/PDF), and customization
- Multi-tenant data isolation

## Tech Stack

- Frontend: Next.js (App Router) + Tailwind CSS
- Backend: NestJS + Prisma
- Database: PostgreSQL
- Auth: NextAuth (credentials) + JWT on backend

## Local Development (no Docker)

1. Install deps

```
npm install
```

2. Start backend and frontend (from repo root)

```
cd qr-menu-app
npm run dev --workspace apps/backend
npm run dev --workspace apps/frontend
```

## Docker (Production-like)

Build and run all services:

```
cd qr-menu-app

# Build and start

docker compose up --build
```

Seed demo data (optional):

```
docker compose --profile seed up --build seed
```

## Docker (Development)

```
cd qr-menu-app

docker compose -f docker-compose.dev.yml up -d db

cd qr-menu-app/apps/backend
npm run db:seed
```

## Environment Variables

### Backend

- `DATABASE_URL`
- `FRONTEND_URL`
- `JWT_SECRET`
- `PORT`

### Frontend

- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Tests

Frontend:

```
cd qr-menu-app
npm run test --workspace apps/frontend
```

Backend:

```
cd qr-menu-app
npm run test --workspace apps/backend
```

## Documentation

- API endpoints: `docs/api.md`
- Business owner guide: `docs/user-guide.md`

## Notes

- Prisma migrations run on container startup in docker compose.
- QR codes are regenerated when the business slug changes.
- Image upload UI is planned to use PostgreSQL blob storage (see section 16.5).
