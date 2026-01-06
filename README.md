# FLearn Language Web App (Frontend)

Frontend web application for **FLearn**, a conversational English learning platform that combines **AI-driven personalized learning paths**, a **teacher marketplace**, and **live speaking practice**.

- Production (System): https://system-flearn.dev  
- Production (App): https://app-flearn.dev  

> Repository: `xbensieve/flearn-language-webapp`  
> Primary language: TypeScript

---

## What this app does

This frontend provides the web user experience for FLearn, including:

- **Personalised AI-driven learning paths**: UI for tailored curriculum, lessons, and recommendations.
- **Teacher marketplace**: teacher onboarding, course browsing/management, and purchasing/monetization flows (as supported by the backend).
- **Live speaking practice**: interactive lesson experiences, role-plays, and practice sessions (AI and/or teacher-led).
- **Progress tracking & analytics**: dashboards for proficiency, streaks, goal setting, and actionable feedback.
- **Secure communication**: in-app messaging and scheduling UX (while keeping user privacy protected).

It integrates with the FLearn backend API (ASP.NET Core) and uses JWT-based authentication.

---

## Tech Stack (high-level)

Because this repository is predominantly **TypeScript**, it is likely built with a modern TS-based frontend stack.

Typical components you may see in this project:

- **TypeScript** (core language)
- A modern web framework (commonly **Next.js** or **React/Vite**)  
- Styling (e.g., Tailwind, CSS Modules, styled-components)
- API client (fetch/axios), JWT handling
- Forms + validation
- Linting/formatting (ESLint, Prettier)
- Testing (Vitest/Jest/Playwright/Cypress)

> If you want, paste your `package.json` here and I’ll tailor this README to the exact framework/scripts/dependencies used.

---

## Getting Started

### Prerequisites

- **Node.js** (recommended: latest LTS)
- **npm** / **pnpm** / **yarn** (use the one this repo is configured for)
- Access to the FLearn API (local or remote)

### Install dependencies

Using npm:

```bash
npm install
```

Or with pnpm:

```bash
pnpm install
```

Or with yarn:

```bash
yarn install
```

### Run locally (development)

Start the dev server:

```bash
npm run dev
```

Then open the URL printed in your terminal (commonly `http://localhost:3000` or `http://localhost:5173`).

### Build for production

```bash
npm run build
```

### Start production server (if applicable)

Some frameworks (e.g., Next.js) have a start command:

```bash
npm run start
```

If this repo is a static SPA build (e.g., Vite), you’ll typically serve the `dist/` folder via nginx, Cloudflare Pages, Netlify, etc.

---

## Environment Variables / Configuration

This app typically needs environment variables for:

- Backend API base URL
- Auth / JWT handling settings (where tokens are stored, cookie domain, etc.)
- Feature flags (optional)
- Analytics keys (optional)

Create a local env file (one of these, depending on the framework):

- `.env.local`
- `.env.development`
- `.env`

### Example

Adjust names to match your codebase:

```bash
# API
VITE_API_BASE_URL=https://api.example.com
# or
NEXT_PUBLIC_API_BASE_URL=https://api.example.com

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Tip: search the codebase for `process.env.` or `import.meta.env` to find the exact variable names expected.

---

## Connecting to the Backend (API)

The backend base path is typically `/api`.

Examples:

- `https://your-backend-domain/api`
- `http://localhost:<backend-port>/api`

Make sure CORS is configured on the backend to allow your frontend origin in development and production.

---

## Authentication

FLearn uses **JWT** authentication.

Common patterns used by the frontend:

- Store token in an **HttpOnly cookie** (recommended) OR in memory (or, less ideally, localStorage)
- Attach token to requests:
  - `Authorization: Bearer <token>`

If your backend issues refresh tokens, document:
- refresh cadence
- token expiry behavior
- logout invalidation

---

## Project Structure (suggested)

Update to match your repo’s actual folders:

- `src/` — application source
  - `pages/` or `app/` — routes (framework dependent)
  - `components/` — reusable UI components
  - `features/` — feature modules (learning paths, marketplace, chat, etc.)
  - `services/` or `api/` — API clients, request wrappers
  - `hooks/` — shared hooks
  - `styles/` — global styles
  - `types/` — TypeScript types
  - `utils/` — helpers
- `public/` — static assets

---

## Scripts

Your `package.json` typically includes:

- `dev` — run locally
- `build` — production build
- `start` — start production server (if applicable)
- `lint` — lint check
- `format` — formatting
- `test` — unit tests
- `e2e` — end-to-end tests (if configured)

Run:

```bash
npm run
```

to see the full list of available scripts.

---

## Testing

If unit tests are configured:

```bash
npm test
```

or:

```bash
npm run test
```

If end-to-end tests are configured (Playwright/Cypress):

```bash
npm run e2e
```

---

## Deployment

This repository is already deployed to:

- https://system-flearn.dev
- https://app-flearn.dev

General deployment guidance:

1. Install dependencies
2. Set environment variables (API URL, public app URL, etc.)
3. Build
4. Serve the build output (or run the server, depending on framework)

Common hosting targets:
- Vercel (Next.js)
- Netlify / Cloudflare Pages (static builds)
- Docker + nginx
- Kubernetes

---

## Contributing

1. Create a branch:
   ```bash
   git checkout -b feature/my-change
   ```
2. Make changes with clear commits
3. Run checks locally:
   ```bash
   npm run lint
   npm run build
   ```
4. Open a PR with:
   - summary of changes
   - screenshots (UI changes)
   - testing notes

---

## License

Add your license choice here (or reference the `LICENSE` file if present).

---

## Links

- Frontend (System): https://system-flearn.dev
- Frontend (App): https://app-flearn.dev
- Backend API: FLearn Backend (ASP.NET Core, MySQL, JWT)
