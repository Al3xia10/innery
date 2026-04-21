# Backend

Backend-ul este organizat direct în `backend/`, fără folder `src`.

## Structură

```text
backend/
├── config/
│   └── config.js
├── controller/
├── middleware/
├── migrations/
├── models/
├── routes/
├── seeders/
├── .env.example
├── app.js
├── index.js
├── package.json
└── README.md
```

## Config

- Runtime-ul și Sequelize CLI folosesc același fișier: `config/config.js`
- Migrațiile și seed-urile sunt rulate exclusiv cu `sequelize-cli`

## Scripturi

```bash
npm run dev
npm run start
npm run db:migrate
npm run db:migrate:undo
npm run db:migrate:status
npm run db:seed:all
```
