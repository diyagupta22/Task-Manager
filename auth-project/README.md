# 🔐 NexAuth — Full-Stack JWT Authentication

A complete, production-ready authentication system built with:
- **Backend**: Node.js + Express + MongoDB + Mongoose + bcryptjs + JWT
- **Frontend**: React + React Router v6 + Axios + Context API

---

## 📁 Project Structure

```
auth-project/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # 🔐 JWT protect middleware (Milestone 3)
│   ├── models/
│   │   └── User.js            # User schema + bcrypt hashing (Milestone 1)
│   ├── routes/
│   │   ├── auth.js            # /register, /login, /me, /logout (Milestone 2)
│   │   └── tasks.js           # Protected routes example (Milestone 3)
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── server.js              # Express app entry point
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.js  # Global auth state (login, logout, user)
        ├── components/
        │   └── ProtectedRoute.js  # 🔐 Route guard (Milestone 3)
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   └── DashboardPage.js   # Protected dashboard with task manager
        ├── utils/
        │   └── api.js             # Axios + JWT interceptors (Milestone 2)
        ├── App.js
        ├── index.css
        └── index.js
```

---

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET

# Start the server
npm run dev          # with nodemon (hot-reload)
# OR
npm start            # without nodemon
```

The backend runs on **http://localhost:5000**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React dev server
npm start
```

The frontend runs on **http://localhost:3000**

---

## 🔑 API Endpoints

| Method | Route                | Auth Required | Description              |
|--------|----------------------|:-------------:|--------------------------|
| POST   | `/api/auth/register` | ❌            | Create new account       |
| POST   | `/api/auth/login`    | ❌            | Login → receive JWT      |
| GET    | `/api/auth/me`       | ✅            | Get current user profile |
| POST   | `/api/auth/logout`   | ✅            | Logout acknowledgment    |
| GET    | `/api/tasks`         | ✅            | Get all tasks            |
| POST   | `/api/tasks`         | ✅            | Create a task            |
| PATCH  | `/api/tasks/:id`     | ✅            | Toggle task done         |
| DELETE | `/api/tasks/:id`     | ✅            | Delete a task            |
| GET    | `/api/health`        | ❌            | Health check             |

---

## 🏆 Milestones Covered

### Milestone 1 — Backend Foundation ✅
- **User Model** (`models/User.js`): Email, Password (hashed), Name
- **Security**: bcryptjs hashes password via `pre('save')` hook
- Plain-text passwords are **never** stored in the database

### Milestone 2 — MVP ✅
- **JWT Generation**: `/api/auth/register` and `/api/auth/login` return a signed JWT
- **Frontend Connection**: Login/Register forms connected to backend via Axios
- **JWT Storage**: Token stored in `localStorage` on successful login

### Milestone 3 — Advanced Standard ✅
- **Auth Middleware** (`middleware/auth.js`): Validates JWT from `Authorization: Bearer <token>` header
- **Protected Routes**: `/api/tasks` requires a valid JWT — returns 401 with code `TOKEN_EXPIRED` or `TOKEN_INVALID` otherwise
- **Protected Frontend**: `ProtectedRoute` component redirects unauthenticated users to `/login`; Axios interceptor handles token expiry globally

---

## 🔒 Security Features

- Passwords hashed with `bcryptjs` (12 salt rounds)
- JWT signed with secret key, expires in 7 days
- `Authorization: Bearer <token>` header pattern
- Axios interceptor clears expired tokens automatically
- Generic error messages prevent email enumeration
- Password field excluded from DB queries by default (`select: false`)
- CORS configured for specific origin
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

---

## 🌐 Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/authdb
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
CLIENT_URL=http://localhost:3000
```

> ⚠️ **Never commit your `.env` file!** Add it to `.gitignore`.
