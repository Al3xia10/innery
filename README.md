# Innery

Repo full-stack pentru aplicația Innery.

## Structură

```text
.
├── frontend/   # Next.js app
├── backend/    # Express API + Sequelize migrations
├── .gitignore
└── README.md
```

## Stack

- Frontend: Next.js, React, TypeScript
- Backend: Express, Sequelize, MySQL

## Cerințe

- Node.js 20+
- npm 10+
- MySQL

## Setup

1. Instalează dependențele pentru frontend:

```bash
cd frontend
npm install
```

2. Instalează dependențele pentru backend:

```bash
cd backend
npm install
```

## Variabile de mediu

### Frontend

Fișier: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

### Backend

Fișier: `backend/.env`

```env
NODE_ENV=development
PORT=4000

DATABASE_URL=mysql://user:password@127.0.0.1:3306/innery

CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
JWT_ACCESS_EXPIRES_IN=30d
JWT_REFRESH_EXPIRES_IN=1d

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Innery <no-reply@innery.app>
```

## Rulare locală

Pornește backend-ul:

```bash
cd backend
npm run dev
```

Pornește frontend-ul:

```bash
cd frontend
npm run dev
```

Aplicația va rula implicit pe:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Migrations

Din folderul `backend/`:

```bash
npm run db:up
npm run db:down
npm run db:pending
npm run db:executed
```

## Scripturi utile

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run start
npm run lint
```

### Backend

```bash
cd backend
npm run dev
npm run start
npm run db:up
npm run db:down
```

## Convenție de repo

- `frontend/` conține exclusiv aplicația client.
- `backend/` conține exclusiv API-ul, modelele și migrările.
- Root-ul rămâne rezervat pentru documentație și configurarea repo-ului.

## GitHub

Repo-ul este pregătit acum pentru un singur remote full-stack. După commit și push, aceeași structură va exista și pe GitHub:

- un singur repo
- două aplicații separate logic
- un root curat și ușor de navigat
