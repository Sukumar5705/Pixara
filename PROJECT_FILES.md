# PhotoShare — Project Files

## Project Structure

This is a monorepo containing a React/Vite frontend and a Node.js/Express backend.

```
photo-sharing-platform/
├── backend/          # Express API, MongoDB models, B2 integration
├── frontend/         # React SPA, Tailwind CSS, Zustand, React Query
├── README.md         # Setup and run instructions
├── TESTING.md        # Test suite documentation
├── PROJECT_FILES.md  # File structure documentation (this file)
└── ARCHITECTURE.md   # System design and architecture
```

---

## Backend (`/backend`)

The backend follows an MVC-like architecture.

### Core Configuration
- `server.js` — Application entry point, connects to DB, starts listener
- `app.js` — Express application factory, middleware, and route registration (separated for testing)
- `package.json` — Dependencies and scripts (Start, Dev, Test)
- `jest.config.js` / `.babelrc` — Test configuration
- `.env` — Environment variables (MongoDB, JWT, B2 credentials)

### API Routes (`/backend/routes/`)
- `authRoutes.js` — `/api/auth` (Login, Register, User info)
- `eventRoutes.js` — `/api/events` (Event CRUD)
- `photoRoutes.js` — `/api/photos` (Upload URLs, Metadata, Selection, Deletion)
- `galleryRoutes.js` — `/api/galleries` (Publishing, Verification, Deactivation)

### Controllers (`/backend/controllers/`)
- `authController.js` — Authentication logic, JWT issuing
- `eventController.js` — Event management, role-based checks
- `photoController.js` — Photo lifecycle (proxy upload, metadata save, selection)
- `galleryController.js` — Public gallery operations, PIN hashing and verification

### Database Models (`/backend/models/`)
*Mongoose schemas for MongoDB:*
- `user.js` — System users (Admin, Team Member)
- `event.js` — Photography events
- `photo.js` — Individual photo records linked to events
- `gallery.js` — Published gallery configuration and access credentials

### Middleware (`/backend/middleware/`)
- `auth.js` — JWT verification and role-based access control (RBAC)
- `eventAccess.js` — Validates user access to specific events based on assignment
- `rateLimiter.js` — IP-based request limiting (Auth & Gallery PIN attempts)
- `errorHandler.js` — Global Express error handling

### Services & Utilities
- `services/b2Service.js` — Backblaze B2 integration (presigned URLs, uploads, deletions)
- `utils/generateSlug.js` — Creates short unique identifiers for gallery URLs

### Testing (`/backend/tests/`)
- `helpers.js` — MongoDB memory server setup, DB teardown, test user seeding
- `*.test.js` — Jest test suites covering all controllers
- `__mocks__/uuid.js` — CommonJS mock for uuid to resolve ESM test issues

---

## Frontend (`/frontend`)

The frontend is a Vite-powered React single-page application.

### Core Configuration
- `index.html` — Application entry point
- `src/main.tsx` — React root, Provider wrapping
- `src/App.tsx` — Application routing layout
- `src/index.css` — Global CSS and Tailwind directives
- `vite.config.ts` — Vite build and plugin config
- `vitest.config.ts` — Test configuration
- `tailwind.config.ts` — Tailwind CSS configuration (if separate)

### State Management (`/frontend/src/store/`)
- `useAuthStore.ts` — Zustand store for JWT token and user profile (persisted to localStorage)
- `useAppStore.ts` — UI state (sidebar toggle, mobile menu)

### Data Fetching (`/frontend/src/hooks/` & `/frontend/src/api/`)
*React Query hooks and Axios API clients:*
- `api/apiClient.ts` — Axios instance with JWT interceptor
- `api/auth.ts`, `events.ts`, `photos.ts`, `galleries.ts` — Raw API call functions
- `hooks/useEvents.ts` — React Query hooks for event fetching/mutation
- `hooks/photos/` — Upload, fetch, and selection hooks
- `hooks/galleries/` — Publishing and PIN verification hooks

### Routing (`/frontend/src/App.tsx` & Pages)
*Application divided into Authenticated App and Public Gallery views:*

#### Pages (`/frontend/src/pages/`)
- `auth/LoginPage.tsx` — User authentication
- `events/EventsPage.tsx` — Dashboard/Event listing
- `events/EventDetailPage.tsx` — Event workspace (Photos tab, Galleries tab)
- `public/PublicGalleryPage.tsx` — Public-facing PIN gate and photo viewer

### UI Components (`/frontend/src/components/`)
- `layout/` — `Topbar.tsx`, `Sidebar.tsx`, `AppLayout.tsx`
- `ui/` — Reusable elements (`Button`, `Input`, `Modal`, `Toast`, `Loader`)
- `events/` — Event creation forms, event cards
- `photos/` — `PhotoGrid.tsx`, `PhotoCard.tsx`, `UploadArea.tsx`, `BulkActions.tsx`
- `gallery/` — `PinGate.tsx`, `GalleryWorkspace.tsx` (admin side)

### Testing (`/frontend/src/tests/`)
- `setup.ts` — Testing Library configuration and global mocks
- `auth.test.tsx` — Authentication flow tests
- `gallery.test.tsx` — Public gallery and PIN gate tests
