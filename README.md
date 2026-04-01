# Leave Request Management System

A full-stack leave management application built with Node.js, Express, MongoDB, and React.

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Backend    | Node.js + Express              |
| Database   | MongoDB + Mongoose             |
| Frontend   | React + React Router           |
| Auth       | JWT + bcrypt                   |
| Container  | Docker + Docker Compose        |
| CI/CD      | Jenkins                        |

---

## Project Structure

```
leave-mgmt/
├── backend/          Node.js + Express API
├── frontend/         React application
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env        # set REACT_APP_API_BASE_URL
npm install
npm start                   # http://localhost:3000
```

---

## Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/leave_mgmt
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend `.env`

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Running Tests

```bash
# Backend (Jest + Supertest) — requires MongoDB on localhost
cd backend
npm test

# CI mode (with coverage)
npm run test:ci

# Frontend
cd frontend
npm run test:ci
```

---

## Docker

### Run full stack with Docker Compose

```bash
# Copy and fill backend env
cp backend/.env.example backend/.env

# Build and start all services
docker-compose up --build

# Services:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:5000
#   MongoDB   → internal (leave_net)
```

### Stop and clean up

```bash
docker-compose down           # stop containers
docker-compose down -v        # stop + remove volumes
```

---

## API Reference

### Auth

| Method | Endpoint               | Access    | Description       |
|--------|------------------------|-----------|-------------------|
| POST   | /api/v1/auth/register  | Public    | Register user     |
| POST   | /api/v1/auth/login     | Public    | Login + get token |
| GET    | /api/v1/auth/me        | Protected | Get current user  |

### Leave

| Method | Endpoint              | Role     | Description          |
|--------|-----------------------|----------|----------------------|
| POST   | /api/v1/leave/apply   | Employee | Apply for leave      |
| GET    | /api/v1/leave/my      | Employee | View own leaves      |
| GET    | /api/v1/leave/all     | Admin    | View all leaves      |
| PUT    | /api/v1/leave/:id     | Admin    | Approve / reject     |

### Query Filters

```
GET /api/v1/leave/my?status=pending&page=1&limit=10
GET /api/v1/leave/all?status=approved&userId=<id>
```

---

## Jenkins CI/CD

See `Jenkinsfile` in the project root for the full pipeline:

```
Stages: Checkout → Install → Test → Build → Docker Build → Deploy
```

---

## Roles

| Role     | Permissions                                      |
|----------|--------------------------------------------------|
| employee | Apply leave, view own requests                   |
| admin    | View all requests, approve / reject any request  |
