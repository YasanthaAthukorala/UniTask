# UniTask

## Problem Description

Students often lack the time or specific skills required for small, ad-hoc tasks, while other students are looking for flexible ways to earn money or build experience. There is no centralized, trusted platform exclusively for the student community to connect these needs efficiently.

## Proposed Solution

UniTask is a student-focused micro-task marketplace that bridges this gap. It provides a secure and intuitive platform where students can post tasks they need help with, browse listings, hire others for available gigs, and leave ratings so the campus community can build trust over time.

## Features

- **User authentication**: Registration and login with JWT; passwords hashed with bcrypt.
- **Gig listings**: Full CRUD for tasks (stored as gigs) with categories, budgets, and contact details.
- **Hiring flow**: Authenticated users can hire available gigs they do not own; owners receive notifications when their gig is hired.
- **Ratings & reviews**: Star ratings (1–5) and optional short comments on **completed** gigs (by eligible users—not the gig owner—per API rules).
- **Notifications**: Server-backed notifications plus a UI that periodically refreshes unread counts while you use the app.
- **Responsive design**: React + Vite client suitable for desktop and mobile layouts.

## Technologies Used

- **Frontend**: React, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Security & auth**: JSON Web Tokens (JWT), bcryptjs
- **Other**: CORS, dotenv

## API Endpoints (with examples)

Unless noted, `{baseUrl}` is your server origin (default `http://localhost:8000`).  
Endpoints marked **Requires auth** expect a JWT:

```http
Authorization: Bearer <your_jwt_token>
```

Registration and login return JSON including `token` and `user` (`_id`, `name`, `email`). Use the token for protected routes.

### Health

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/health` | No |

*Example response:* `{ "status": "ok", "service": "UniTask API" }`

### Auth

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/auth/register` | No |
| `POST` | `/api/auth/login` | No |
| `GET` | `/api/auth/me` | Yes |

**`POST /api/auth/register`** — body must match what the backend validates (`name`, `email`, `password`; password at least **6 characters**).

```json
{
  "name": "Ada Studentson",
  "email": "ada@uni.edu",
  "password": "secret123"
}
```

**`POST /api/auth/login`**

```json
{
  "email": "ada@uni.edu",
  "password": "secret123"
}
```

**`GET /api/auth/me`** — requires `Authorization: Bearer …`. Returns `{ "user": { … } }` (without password).

### Tasks (gigs)

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/tasks` | Yes |
| `POST` | `/api/tasks` | Yes |
| `PUT` | `/api/tasks/:id` | Yes (owner only) |
| `DELETE` | `/api/tasks/:id` | Yes (owner only) |
| `POST` | `/api/tasks/:id/hire` | Yes |
| `POST` | `/api/tasks/:id/rate` | Yes |

**`GET /api/tasks`** supports optional query parameters:

| Query | Meaning |
|--------|---------|
| `search` | Case-insensitive match on title or description |
| `category` | Filter by category (use `All` or omit for no category filter) |
| `sort` | One of `newest` (default), `oldest`, `budget-asc`, `budget-desc`, `rating-desc`, `rating-asc` |

**`POST /api/tasks`** — Mongoose requires **title**, **description**, **category**, **budget**, **contactEmail**, and **contactPhone**. `postedBy` is set from the logged-in user. `status` defaults to `Available` if omitted.

`contactPhone` is normalized by the API and validated as **Sri Lankan**: `+94` followed by **9 digits** (e.g. `+94771234567`). Other formats fail validation until normalized to that pattern via the client or by sending the correct shape.

```json
{
  "title": "Calculus tutoring session",
  "description": "Need help reviewing integration before finals.",
  "category": "Tutoring",
  "budget": 3500,
  "contactEmail": "ada@uni.edu",
  "contactPhone": "+94771234567"
}
```

**`PUT /api/tasks/:id`** — owner only. You may send a subset of fields; optional `status` must respect business rules (e.g. cannot force `Available` while someone is hired).

**`POST /api/tasks/:id/hire`** — body usually empty (`{}`). The authenticated user becomes the hirer when the gig is `Available`; the owner cannot hire their own gig.

**`POST /api/tasks/:id/rate`** — only when the gig’s `status` is `Completed`, and **not** by the gig owner. `stars` is required (integer 1–5); `comment` is optional.

```json
{
  "stars": 5,
  "comment": "Clear explanations and on time!"
}
```

### Notifications

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/notifications` | Yes |
| `PATCH` | `/api/notifications/read-all` | Yes |
| `PATCH` | `/api/notifications/:id/read` | Yes |

**`GET /api/notifications`** returns `{ "notifications": [ … ], "unreadCount": <number> }`.

## Setup Instructions

1. **Clone the repository** and open the project root.
2. **Prerequisites**: [Node.js](https://nodejs.org/) and a running **MongoDB** instance (local or Atlas).
3. **Install backend dependencies:**
   ```bash
   npm install
   ```
4. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```
5. **Environment configuration**: Create a `.env` file in the **project root** (copy `.env.example` and fill values). The API **will not start** without `JWT_SECRET`.
   ```env
   PORT=8000
   MONGO_URL=mongodb://127.0.0.1:27017/unitask
   JWT_SECRET=use_a_long_random_string_here
   ```
6. **Optional sample data**: After MongoDB is reachable and `MONGO_URL` is set, you can wipe and repopulate the database with realistic demo gigs, ratings, and notifications:
   ```bash
   npm run seed
   ```
   This runs `node scripts/seed.js`. **It deletes existing users, tasks, and notifications** in that database before inserting seed data. The script prints demo accounts—by default **all demo users share the password** `password123` (see the comment block at the top of `scripts/seed.js`).

## How to Run the Project

1. Ensure MongoDB is running and `.env` is configured (`MONGO_URL`, `JWT_SECRET`).

2. **Start the API** (from the project root):

   ```bash
   npm run dev:server
   ```

   The server listens on `PORT` (default **8000**).

3. **Start the React client** (second terminal):

   ```bash
   npm run dev:client
   ```

   Use the URL Vite prints (typically `http://localhost:5173`) and ensure API calls match your backend port/CORS setup.

### Production-style run (built client + API)

Build the SPA and serve it from Express when `client/dist` exists:

```bash
npm run build:client
npm start
```

The API continues to expose `/api/*`; non-API routes fall through to the built single-page app when static files are present.
