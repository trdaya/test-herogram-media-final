# Herogram media

## Installation

Run these

```
nvm use && npm i
cd backend && nvm use && npm i --legacy-peer-deps
cd ..
cd frontend && nvm use && npm i --legacy-peer-deps
cd ..
```

- Copy `/backend/.env.example` to `/backend/.env`
- Copy `/frontend/.env.example` to `/frontend/.env`
- Add values for sensitive variables.

## Run dev servers

```
cd backend && npm run start:dev
cd frontend && npm run dev
```

- Backend URL: http://localhost:4001
- Backend docs URL: http://localhost:4001/docs
- Frontend URL: http://localhost:3001

## Run prod servers

```
cd backend && npm run build && npm start
cd frontend && npm run build && npm run preview
```

- Backend URL: http://localhost:4001
- Backend docs URL: http://localhost:4001/docs
- Frontend URL: http://localhost:3002
