# PhotoShare Platform

PhotoShare is a professional full-stack web application for photographers to manage events, upload photos, and deliver them to clients via secure, PIN-protected public galleries.

## Features

- **Event Management**: Create and manage photography events (Weddings, Corporate, etc.).
- **Team Collaboration**: Assign team members to specific events.
- **Cloud Photo Storage**: Direct-to-cloud photo uploads via Backblaze B2 presigned URLs.
- **Photo Selection**: Mark specific photos to be included in the client gallery.
- **Secure Client Galleries**: Publish events to public URLs protected by custom 6-digit PINs.
- **Role-Based Access Control**: Secure separation between Admins and Team Members.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand, React Query.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Storage**: Backblaze B2.
- **Testing**: Jest, Supertest, Vitest, React Testing Library.

---

## Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)
- Backblaze B2 account (for photo uploads)

### 1. Clone & Install
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend (`backend/.env`)**
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/photoshare
JWT_SECRET=your_super_secret_jwt_key
B2_APPLICATION_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET_ID=your_b2_bucket_id
B2_BUCKET_NAME=your_b2_bucket_name
B2_ENDPOINT=s3.us-west-004.backblazeb2.com # (example)
```

**Frontend (`frontend/.env`)**
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Application

Start both servers in development mode:

**Terminal 1 (Backend)**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Documentation

Comprehensive documentation is available in the repository:

- [PROJECT_FILES.md](./PROJECT_FILES.md) — Detailed file and directory structure.
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, API architecture, and data flows.
- [TESTING.md](./TESTING.md) — Guide to running the backend and frontend test suites.

## Testing

The project includes comprehensive test coverage for both backend and frontend.

```bash
# Run Backend tests (requires MongoDB)
cd backend
npm test

# Run Frontend tests
cd frontend
npm run test:run
```
See `TESTING.md` for detailed information on test architecture and coverage.
