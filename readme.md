# Pixara — Professional Photo Delivery Platform

A full-stack web application for photographers to manage events, coordinate with team members, curate photos, and securely deliver them to clients through PIN-protected galleries.

Built for simplicity, scalability, and security.

---

## ✨ Features

- **Event Management** — Create, organize, and track photography events with custom metadata
- **Team Collaboration** — Assign team members to specific events; view only assigned work
- **Bulk Photo Upload** — Direct-to-cloud uploads via Backblaze B2 with progress tracking
- **Photo Curation** — Admins select and approve photos for client delivery
- **Secure Client Galleries** — Custom URLs with 6-digit PIN protection and 1-hour signed download links
- **Role-Based Access Control** — Strict separation between admin (full access) and team members (event-scoped)
- **Presigned URLs** — Photos never pass through the server; B2 handles all binary transfers
- **Rate Limiting** — Throttle auth attempts and PIN guessing to prevent abuse
- **JWT Authentication** — Stateless, 7-day token expiry, `localStorage` persistence

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **State** | Zustand (auth), TanStack Query (server) |
| **Routing** | React Router v7 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Storage** | Backblaze B2 (S3-compatible) |
| **Testing** | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |
| **Security** | bcrypt, JWT, helmet, CORS, express-validator, rate-limit |

---

## 📋 Prerequisites

- **Node.js** v18+ (check with `node --version`)
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Backblaze B2** account ([sign up](https://www.backblaze.com/b2/cloud-storage.html)) with a bucket and application key

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/sukumar5705/pixara.git
cd pixara
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal or after finishing backend install)
cd ../frontend
npm install
```

### 3. Configure Environment

#### Backend (`backend/.env`)

Create a `.env` file in the `backend` directory:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/pixara

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_EXPIRE=7d

# Backblaze B2
B2_KEY_ID=your_b2_application_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET_NAME=your_b2_bucket_name
B2_ENDPOINT=s3.us-west-004.backblazeb2.com
B2_REGION=us-west-004

# Frontend URL (for gallery links)
FRONTEND_URL=http://localhost:5173
```

**How to get B2 credentials:**
1. Log into [Backblaze B2](https://secure.backblaze.com/user_account.htm)
2. Go to **App Keys** → **Create Application Key**
3. Choose permissions: `readFiles`, `listFiles`, `writeFiles`
4. Copy the **Application Key** (shown only once)
5. Create a bucket and note its name

#### Frontend (`frontend/.env`)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the Application

Start the backend and frontend in separate terminals:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```

Expected output:
```
Server running in development mode on port 5000
MongoDB Connected: 127.0.0.1
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v7.3.6  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h + enter to show help
```

### 5. Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

### 6. First Login

A default admin account is seeded. Use the seed script:

```bash
cd backend
node scripts/seedAdmin.js
```

Login credentials will appear in the console. From there, create additional team members via the **Team** page.

---

## 📁 Project Structure

```
pixara/
├── backend/
│   ├── config/              — Database & B2 setup
│   ├── middleware/          — Auth, validation, error handling
│   ├── routes/              — API endpoints (auth, events, photos, galleries)
│   ├── controllers/         — Business logic per domain
│   ├── models/              — Mongoose schemas (User, Event, Photo, Gallery)
│   ├── services/            — B2 integration
│   ├── utils/               — JWT, PIN, slug generators
│   ├── tests/               — Jest test suite
│   ├── app.js               — Express app factory
│   └── server.js            — Entry point (calls app.listen)
│
├── frontend/
│   ├── src/
│   │   ├── api/             — Axios instance + domain modules
│   │   ├── hooks/           — TanStack Query hooks
│   │   ├── store/           — Zustand auth store
│   │   ├── components/
│   │   │   ├── ui/          — Reusable Button, Input, etc.
│   │   │   ├── layout/      — AppLayout, Sidebar, guards
│   │   │   ├── events/      — Event cards, modals, dialogs
│   │   │   ├── photos/      — Upload, grid, lightbox
│   │   │   └── gallery/     — PIN gate, public view
│   │   ├── pages/           — Page-level components
│   │   ├── types/           — TypeScript contracts
│   │   └── App.tsx          — Router setup
│   ├── public/              — Static assets
│   ├── vite.config.ts       — Vite configuration
│   └── tsconfig.json        — TypeScript config
│
├── ARCHITECTURE.md          — System design & API reference
├── TESTING.md               — Test suite documentation
├── PROJECT_FILES.md         — Detailed file manifest
└── README.md                — This file
```

---

## 🔐 Authentication & Authorization

Pixara uses **role-based access control (RBAC)** with two roles:

| Role | Access | Capabilities |
|---|---|---|
| **admin** | Global | Create/edit/delete events, manage team, publish galleries, select photos |
| **team** | Event-scoped | Upload photos, view assigned events, see own photos only |

**Key flows:**

1. **Public Signup** — Creates a `team` user (non-admin)
2. **Admin Invitation** — Admins use `/api/auth/create-user` to elevate accounts
3. **Event Assignment** — Admins assign team members to specific events
4. **Scope Enforcement** — Every request is checked against the user's role and event assignment

---

## 📸 Upload Flow

Pixara uses a **server-side proxy** for uploads to avoid CORS complexity:

```
Browser → POST /api/photos/upload → Node.js Express → Backblaze B2
                                        (raw binary)
```

Why? Backblaze B2 presigned PUTs require bucket-level CORS configuration. Proxying through
your server sidesteps this entirely and gives you a central audit point.

**Details:**
- Requests to `/api/photos/upload` include raw binary + metadata headers
- Express buffers the file in memory (100 MB max)
- B2 service generates a unique storage key and uploads
- Photo metadata is saved to MongoDB, linking the `storageKey` to the event
- Download URLs are signed on-demand (1-hour expiry) when returning photos to the client

---

## 🎁 Gallery Publishing

Admins curate selected photos and publish them to a client-facing URL:

```
Admin selects photos → POST /api/galleries/publish
                    → Generates 6-digit PIN (bcrypt-hashed)
                    → Returns shareable URL + plain PIN (once only)
                    → Client visits URL, enters PIN
                    → Receives selected photos with 1-hour signed download URLs
```

**Security:**
- PIN is bcrypt-hashed; never stored or returned after publish
- Rate limited to 10 guesses per IP per 15 minutes
- Published galleries are deactivatable at any time
- Only photos marked `isSelected: true` are visible to clients

---

## 🧪 Testing

### Backend Tests

Requires a MongoDB instance (uses a test database):

```bash
cd backend
npm test                  # Run all tests with coverage
npm run test:watch       # Re-run on file changes
npm run test:coverage    # Generate coverage report
```

**Test suites:**
- `auth.test.js` — Login, registration, role checks
- `events.test.js` — Event CRUD, team assignment, access control
- `photos.test.js` — Upload, metadata, selection, deletion
- `galleries.test.js` — PIN verification, publish, deactivation

### Frontend Tests

```bash
cd frontend
npm run test:run        # Run once
npm run test            # Watch mode
npm run test:ui         # Open test UI dashboard
```

**Test suites:**
- `auth.test.tsx` — Login form, auth flow
- `gallery.test.tsx` — PIN gate, public gallery view

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, API reference, data model, known gaps |
| [TESTING.md](./TESTING.md) | Test philosophy, running tests, coverage targets |
| [PROJECT_FILES.md](./PROJECT_FILES.md) | File-by-file manifest with descriptions |

---

## 🚨 Known Issues & Gaps

Before deploying to production, address these:

1. **Cascade delete** — Deleting an event orphans photos and galleries. Needs a `pre("deleteOne")` hook.
2. **Slug stability** — Republishing a gallery rotates the slug, breaking old links. Keep slug, rotate PIN only.
3. **Presigned URL overload** — No pagination; large events sign a URL for every photo on every load.
4. **CORS allowlist** — Currently allows all origins. Should whitelist `FRONTEND_URL` only.
5. **Index coverage** — `Photo` lacks an index on `event` (the hot query path).

See [ARCHITECTURE.md § 10](./ARCHITECTURE.md#10-known-gaps) for full details.

---

## 🔧 Environment Troubleshooting

### MongoDB Connection Fails
- Ensure MongoDB is running: `mongod --version` (local) or verify Atlas connection string
- Check `MONGO_URI` in `.env` matches your setup

### B2 Bucket Errors
- Verify bucket exists and name matches `B2_BUCKET_NAME`
- Confirm app key has `readFiles`, `writeFiles`, `listFiles` permissions
- Check endpoint matches your B2 region (e.g., `s3.us-west-004.backblazeb2.com`)

### CORS / Upload Blocked
- Backend must be running on `http://localhost:5000` (or whatever `VITE_API_URL` specifies)
- Frontend must load from `FRONTEND_URL` in backend `.env`

### 401 Errors on Protected Routes
- Ensure JWT is present in `Authorization: Bearer <token>` header
- Tokens expire after 7 days by default; re-login to refresh

---

## 📦 Dependencies Overview

### Backend Key Packages
- **Express** — HTTP server framework
- **Mongoose** — MongoDB object modeling
- **JWT** — Stateless authentication
- **bcryptjs** — Password and PIN hashing
- **@aws-sdk/client-s3** — Backblaze B2 (S3-compatible) integration
- **express-validator** — Input validation
- **helmet** — Security headers
- **express-rate-limit** — Request throttling

### Frontend Key Packages
- **React** — UI framework
- **Zustand** — Lightweight state management
- **@tanstack/react-query** — Server state + caching
- **React Router** — Client-side routing
- **axios** — HTTP client
- **Tailwind CSS** — Utility-first styling
- **Lucide React** — Icon library

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure tests pass before submitting:
```bash
cd backend && npm test
cd ../frontend && npm run test:run
```

---

## 📄 License

This project is provided as-is. Check the repository for license details.

---

## 📧 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for photographers.** Made to be simple, powerful, and secure.
