# PhotoShare — Architecture

## System Overview

PhotoShare is a full-stack web application designed for photographers to manage events, upload photos, and securely share them with clients via PIN-protected public galleries.

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand (client state), React Query (server state), React Router v6.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose).
- **Storage**: Backblaze B2 Cloud Storage.
- **Testing**: Jest + Supertest (Backend), Vitest + React Testing Library (Frontend).

---

## Backend Architecture

### 1. API Design (RESTful)
The backend provides a RESTful JSON API. Routes are logically grouped:
- `/api/auth` — Authentication, user profile, team management.
- `/api/events` — Event CRUD, team assignment.
- `/api/photos` — Photo upload coordination, metadata storage, selection, deletion.
- `/api/galleries` — Gallery publishing, public PIN verification.

### 2. Authentication & Authorization
- **JWT (JSON Web Tokens)**: Used for stateless authentication. The token is sent via the `Authorization: Bearer <token>` header.
- **Role-Based Access Control (RBAC)**: Users are either `admin` or `team_member`.
  - Admins have global access.
  - Team members only have access to events they are explicitly assigned to.
- **Middleware**: `authMiddleware.js` verifies the JWT. `eventAccess.js` checks if a team member is authorized for a specific `eventId`.

### 3. Photo Upload Flow (Presigned URLs)
To avoid routing heavy image traffic through the Node.js server, the application uses a presigned URL architecture:
1. **Request**: Client requests an upload URL for a specific file (`POST /api/photos/upload-url`).
2. **Sign**: Backend calls B2 SDK to generate a presigned upload URL and authorization token.
3. **Upload**: Client uploads the binary file *directly* to Backblaze B2 using the presigned URL.
4. **Confirm**: Client notifies the backend that the upload succeeded and sends file metadata (`POST /api/photos/save-metadata`). Backend saves the photo record to MongoDB.

*(A fallback proxy upload endpoint `/api/photos/proxy-upload` is also available if direct uploads face CORS issues).*

### 4. Secure Galleries
- **Data Model**: A Gallery document links to an Event. It contains a unique `slug` (for the URL) and a hashed `pin` (using bcrypt).
- **Verification**: When a client visits `/gallery/:slug`, they must enter the PIN. The backend verifies the PIN and returns a temporary Gallery JWT.
- **Rate Limiting**: `express-rate-limit` is used to prevent brute-force attacks on the PIN verification endpoint.

---

## Frontend Architecture

### 1. State Management
- **Server State (React Query)**: Handles fetching, caching, synchronizing, and updating server data (Events, Photos, Galleries). It manages loading and error states automatically.
- **Client State (Zustand)**: Manages global UI state (sidebar toggle) and authentication state (`useAuthStore`). The auth store is persisted to `localStorage` to keep users logged in across reloads.

### 2. Routing (React Router)
- **Protected Routes**: `/app/*` routes require a valid JWT in the Zustand store. If not present, users are redirected to `/login`.
- **Public Routes**: `/gallery/:slug` is accessible without authentication, but requires PIN verification to view photos.

### 3. Component Design
- **Atomic Design Principles**: Reusable UI components (Buttons, Inputs, Modals) in `src/components/ui`.
- **Feature Modules**: Complex features are grouped by domain (e.g., `src/components/events`, `src/components/photos`).
- **Tailwind CSS**: Used for all styling. Complex conditional classes are handled via standard template literals or `clsx`/`tailwind-merge` (if installed).

### 4. Public Gallery PIN Gate
- The PIN input uses 6 segmented input fields for a premium user experience.
- When verified, the frontend receives the event details and *only* the photos marked as `selected` by the admin.
- Admin navigation (sidebar, topbar) is completely hidden on public gallery routes.
