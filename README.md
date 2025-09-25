# Atlas Ledger Prototype

Lightweight personal finance prototype built with a Next.js 14 frontend and a NestJS API that serves mock accounts, transactions, alerts, and insights. Plaid is no longer required—the backend ships with in-memory sample data so you can explore the product experience immediately.

## Project Layout

- `apps/frontend` — Next.js dashboard (App Router, Tailwind, React Query).
- `apps/backend` — NestJS 11 API returning mock data via a simple in-memory store.
- `packages/shared` — Shared Zod schemas/types consumed by both tiers.

## Prerequisites

- Node.js 20+
- npm (workspaces enabled)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy environment templates**
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   cp apps/backend/.env.example apps/backend/.env
   ```
   > No secrets are required for the prototype—the backend serves sample data out of the box.
3. **Run the prototype**
   ```bash
   npm run dev
   ```
   This launches the Next.js frontend on port `3000` and the NestJS API on `4000` (using mock data only).

## Available API Endpoints

Authenticated requests expect `Authorization: Bearer <firebase_uid>` (any string is accepted and mapped to a mock user):

- `POST /auth/register` — Register or update a user mapping.
- `GET /accounts` — List sample accounts.
- `GET /transactions?from&to&cat&limit` — Filtered transactions feed.
- `POST /transactions/upload` — Upload a CSV (with headers) to append transactions to the mock dataset.
- `POST /categorize/rebuild` — Re-run simple heuristics to adjust categories.
- `GET /insights/summary` — Aggregated spend for `period=week|month` starting from a given date.
- `GET /insights/forecast` — Next 30-day spend estimate (mocked).
- `GET /alerts` — Current alerts for the user (includes basic 3σ anomaly detection for unusual spend).
- `POST /budgets` — Create/update budget rules for a category.

`POST /plaid/*` endpoints have been removed in this prototype; data is generated locally.

## Frontend Notes

- Firebase Auth providers remain in place for future integration, but during the prototype any bearer token will do. Sign-in falls back to a mock user and automatically registers with the API.
- React Query hooks call the simplified API routes (`/accounts`, `/transactions`, etc.) and render the in-memory data set.
- The dashboard ships with a CSV uploader (Papaparse-powered) so you can ingest exports and immediately see updated categorisation + anomaly highlights.

## Customising Sample Data

Edit `apps/backend/src/data/prototype-data.service.ts` to tweak accounts, transactions, alerts, and budget rules. Merchant names are normalised automatically (e.g. `UBER *TRIP` → `Uber`), uploaded CSV rows merge into the dataset, and a simple z-score detector raises anomaly alerts for unusually large debits. Restart `npm run dev` to reload the dataset.

## Next Steps

When you're ready to replace the mocks with live integrations, reintroduce your data sources (Plaid, real alerts, proper authentication) behind the same endpoints. The frontend already consumes a stable contract, so you can swap the backend implementation without changing the UI.
