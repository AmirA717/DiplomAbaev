# Cyber Education Frontend

Production-oriented refactor of the Figma Make UI with real integration to `cyber-education-backend`.

## Stack

- Vite + React 19 + TypeScript
- React Router (route-based navigation)
- TanStack Query (data fetching, cache, mutations)
- React Hook Form + Zod (validation)
- Tailwind CSS v4
- Sonner (toasts)
- ESLint + Prettier
- Vitest (unit tests)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Ensure backend is running (`cyber-education-backend`) on the URL from `.env`.

4. Start dev server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - start local frontend
- `npm run build` - typecheck + production build
- `npm run lint` - eslint checks
- `npm run test` - run unit tests once
- `npm run test:watch` - watch mode tests
- `npm run format` - run prettier

## Environment

`.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

## Folder Structure

```text
src/
  app/
  api/
    adapters/
    endpoints/
  components/
    common/
    layout/
    ui/
  features/
    auth/
    topics/
    games/
    quizzes/
    profile/
    admin/
  pages/
    auth/
    topics/
    games/
    quizzes/
    profile/
    admin/
  routes/
  styles/
  utils/
  tests/
```

## API Coverage

- Auth:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- Topics:
  - `GET /topics`
  - `GET /topics/:id`
  - `GET /topics/:id/materials`
- Games:
  - `GET /games?topicId=`
  - `GET /games/:id`
  - `POST /games/:id/attempts`
  - `PATCH /games/attempts/:attemptId/finish`
- Quizzes:
  - `GET /quizzes?topicId=`
  - `GET /quizzes/:id`
  - `GET /quizzes/:id/questions`
  - `POST /quizzes/:id/attempts`
  - `POST /quizzes/attempts/:attemptId/answer` (used before submit)
  - `POST /quizzes/attempts/:attemptId/submit`
- Profile/Stats:
  - `GET /users/me/profile`
  - `PATCH /users/me/profile`
  - `GET /users/me/stats`
  - `GET /users/me/achievements`
- Admin:
  - `GET /admin/stats/overview`
  - `POST/PATCH/DELETE /admin/topics`
  - Generic CRUD wrappers for `/admin/materials|games|quizzes|questions|achievements`

## Notes

- Backend currently exposes only published topics via `/topics`; admin table therefore lists published items only.
- E2E is not configured in this repo. To add it, install Playwright (`npm i -D @playwright/test`) and create a smoke scenario `login -> load topics` against a running backend.

