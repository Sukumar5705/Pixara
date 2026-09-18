# PhotoShare — Testing Guide

## Overview

PhotoShare uses two separate testing setups — one for the backend API (Node/Express) and one for the frontend React application.

| Layer | Framework | Runner | Config |
|-------|-----------|--------|--------|
| Backend | Jest + Supertest | `npm test` | `jest.config.js`, `.babelrc` |
| Frontend | Vitest + Testing Library | `npm test` | `vitest.config.ts` |

---

## Backend Tests

### Setup

Dependencies installed to `backend/devDependencies`:
- `jest` — test runner
- `supertest` — HTTP request assertions against Express app
- `babel-jest`, `@babel/core`, `@babel/preset-env` — CJS transform for ESM node_modules

**uuid ESM workaround**: Jest's CommonJS runtime cannot parse `uuid@14`'s ESM exports. A lightweight CJS stub lives at `tests/__mocks__/uuid.js` and is mapped via `moduleNameMapper` in `jest.config.js`.

### Running

```bash
cd backend
npm test              # run all backend tests
npm run test:verbose  # verbose output
```

### Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `tests/auth.test.js` | 13 | Registration, login, token guard, role-based access, admin create user |
| `tests/events.test.js` | 18 | Create/read/update/delete events, team assignment, access control |
| `tests/photos.test.js` | 14 | Signed URL generation, metadata saving, listing, selection toggle, deletion |
| `tests/galleries.test.js` | 15 | Publish, custom PIN, PIN verification, credentials retrieval, deactivation |

**Total: 60 backend tests**

### Architecture

Tests use a **real MongoDB database** (local `mongod` or Atlas URI via `MONGO_URI` env var) with a unique DB name per run to prevent cross-test pollution.

`tests/helpers.js` provides:
- `connectTestDB()` / `closeTestDB()` / `clearTestDB()` — lifecycle hooks
- `createAdmin(opts)` / `createTeamMember(opts)` — seed users with JWT tokens
- `app` — the Express app imported from `app.js` (no `listen` call)

**B2 storage is fully mocked** in all test files:
```js
jest.mock("../services/b2Service", () => ({
  generateSignedUploadUrl: jest.fn().mockResolvedValue({ ... }),
  generateSignedReadUrl: jest.fn().mockResolvedValue("https://..."),
  uploadBuffer: jest.fn().mockResolvedValue({ storageKey: "..." }),
  deleteFile: jest.fn().mockResolvedValue(undefined),
}));
```
No Backblaze B2 credentials are needed to run tests.

### What's Tested

#### Authentication
- `POST /api/auth/register` — success, duplicate email, invalid email, short password
- `POST /api/auth/login` — valid, wrong password, non-existent user
- `GET /api/auth/me` — valid token, no token, tampered token
- `GET /api/auth/team-members` — admin access, team member denied (403)
- `POST /api/auth/create-user` — admin creates user, team member denied (403)

#### Events
- Create event — admin success, team denied, missing title, unauthenticated
- List events — admin sees all, team sees only assigned events
- Get single event — admin any, team assigned only, 404 for non-existent
- Update event — admin success, team denied
- Assign team — admin success, team denied
- Delete event — admin success, team denied, DB cleanup verified

#### Photos
- Signed URL — admin/team assigned success, unassigned denied, unauthenticated denied
- Save metadata — assigned team success, unassigned denied
- List by event — admin sees all photos, team sees only their own
- Toggle selection (admin only) — admin success, team denied (403)
- Delete photo — admin any photo, owner their own, other team denied (403)

#### Galleries
- Publish — admin success, custom PIN, team denied, unauthenticated denied, missing eventId, republish generates new slug
- PIN verify — correct PIN succeeds, wrong PIN 401, missing PIN 400, wrong slug 404, deactivated 404, only selected photos returned
- Get credentials — admin success after publish, 404 before publish, team denied
- Deactivate — admin success, team denied, DB state verified

---

## Frontend Tests

### Setup

Dependencies installed to `frontend/devDependencies`:
- `vitest` — Vite-native test runner
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` — DOM assertions and user interaction simulation
- `jsdom` — browser environment for Vitest

### Running

```bash
cd frontend
npm run test:run   # single run (CI)
npm test           # watch mode
```

### Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `src/tests/auth.test.tsx` | 7 | Login form renders, email/password validation, API call, error display, loading state, navigation |
| `src/tests/gallery.test.tsx` | 8 | PIN gate render, 6-digit input slots, submit enable/disable, PIN call, loading state, 404 error, gallery view, no admin nav |

**Total: 15 frontend tests**

### Architecture

All API calls and hooks are **fully mocked** with `vi.mock`. No live backend is required.

```ts
vi.mock("../api/auth", () => ({ login: vi.fn(), ... }));
vi.mock("../hooks/galleries/useVerifyGallery", () => ({
  useVerifyGallery: vi.fn(),
}));
```

Tests render components inside `MemoryRouter + QueryClientProvider` to satisfy React Router and React Query contexts.

### What's Tested

#### LoginPage (auth.test.tsx)
- Form renders with heading, email, password fields
- Zod validation fires for invalid email format
- Zod validation fires for empty password
- `login()` API called with correct args on valid submit
- API error message shown on failed login
- Submit button disabled during loading (`isSubmitting = true`)
- `navigate("/app/dashboard")` called on successful login

#### PublicGalleryPage / PinGate (gallery.test.tsx)
- Renders heading "Enter your access PIN"
- All 6 digit input slots present (aria-label "PIN digit N")
- Submit button disabled until all 6 digits filled
- Submit button enables at 6 digits, clicking calls `verifyPin` with slug + pin
- Shows "Verifying…" text and disabled button while `isPending = true`
- Shows "Gallery unavailable" error block on 404 response
- After successful verify: shows event title and photo count
- No admin navigation (Dashboard, Team Members) visible on public page

---

## Environment Requirements

### Backend Tests
| Variable | Value for tests |
|----------|----------------|
| `MONGO_URI` | Local `mongodb://127.0.0.1:27017` or Atlas URI |
| `JWT_SECRET` | Auto-set to `test-secret-for-jest` in `tests/helpers.js` |
| `NODE_ENV` | Auto-set to `test` in `tests/helpers.js` |
| `B2_BUCKET_NAME` | Auto-set to `test-bucket` in `tests/helpers.js` |

> [!IMPORTANT]
> A running MongoDB instance is required for backend tests. Tests will fail if MongoDB is not reachable at the URI in `MONGO_URI`.

### Frontend Tests
No environment variables required. All API calls are mocked.

---

## What's NOT Tested (Scope)

The following are currently **not covered by automated tests** and should be verified manually:

- End-to-end photo upload flow (B2 presigned URL → client PUT → metadata save)
- Proxy upload endpoint (`POST /api/photos/proxy-upload`)
- React Query hooks (`useEventPhotos`, `useUploadPhoto`, `useDeletePhoto`, `useTogglePhotoSelection`)
- Gallery workspace UI (`GalleryWorkspace.tsx`)
- Rate limiter behavior (`authLimiter`, `pinLimiter`)
- Full E2E browser flow (see manual test checklist in `TESTING.md`)
