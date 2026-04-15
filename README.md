# Tactical Armory System Frontend

A React + TypeScript dashboard for monitoring and managing Tactical Armory System (TAS) operations.

The UI provides:

- Admin-key protected access
- Real-time command-center style dashboard
- Edge node management (list + register)
- Transaction monitoring with filtering and pagination
- Health and readiness visibility

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS v4
- Lucide React icons
- Vitest + Testing Library

## Requirements

- Node.js 20+ (recommended)
- npm 10+ (or compatible package manager)
- TAS backend API running and reachable

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the project root (`frontend/`) with:

```env
VITE_API_URL=http://localhost:8080
```

If `VITE_API_URL` is not set, the app defaults to `http://localhost:8080`.

3. Start development server:

```bash
npm run dev
```

4. Open the URL shown by Vite (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build production assets
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once with Vitest
- `npm run test:watch` - Run tests in watch mode

## Authentication Flow

- Users authenticate with an admin key from the login page.
- The key is validated against a protected backend endpoint.
- On success, the key is stored in `sessionStorage` as `admin_key`.
- API requests include the `X-Admin-Key` header automatically.

## API Integration

API base URL is controlled by `VITE_API_URL`.

Main endpoints used:

- `GET /health`
- `GET /ready`
- `GET /api/v1/nodes/list`
- `POST /api/v1/nodes`
- `GET /api/v1/transactions?limit=&offset=&node_id=`

All protected calls are made through an auth wrapper that:

- Injects `X-Admin-Key`
- Parses backend error payloads
- Throws on non-2xx responses

## App Structure

```text
src/
  components/       # Reusable UI blocks (tables, badges, layout, modals)
  context/          # Auth context + session management
  pages/            # Route-level screens (Dashboard, Nodes, Transactions, Login)
  services/         # API client and request helpers
  types/            # Shared API request/response types
  __tests__/        # Unit/component tests
```

## Quality and Testing

- Unit and component tests use Vitest + Testing Library.
- Linting is configured with ESLint for React/TypeScript.
- Build includes TypeScript project references (`tsc -b`) before bundling.

Run checks before merging:

```bash
npm run lint
npm run test
npm run build
```

## Notes for Production

- Do not rely on `sessionStorage` alone for high-security deployments.
- Serve over TLS and enforce secure backend auth practices.
- Consider key rotation and stricter token-based auth if needed.
- Restrict CORS to approved origins.

## License

This project currently has no explicit license declared.
