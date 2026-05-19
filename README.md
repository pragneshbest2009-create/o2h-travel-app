# o2h Travel App

AI-powered travel and expense management platform — **Phase 1 MVP**.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Google Apps Script (optional) + Next.js API routes |
| Database | Google Sheets (or mock data locally) |
| Hosting | Vercel |

## Quick start (mock data)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign in with `pragnesh@o2h.com` or any demo email on the login page.

## Connect Google Sheets

1. Follow **[docs/GOOGLE_SETUP.md](docs/GOOGLE_SETUP.md)** (15 minutes).
2. Copy `.env.example` → `.env.local` and add your Apps Script URL + API key.
3. Check [http://localhost:3000/api/health](http://localhost:3000/api/health) — `dataSource` should be `google-sheets`.

Without env vars, the app uses mock data in `src/lib/mock-data.ts` (fine for UI demos).

## API routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/health` | GET | App + Google Sheets connection status |
| `/api/users` | GET | Users list |
| `/api/travel` | GET, POST | Travel requests |
| `/api/expenses` | GET, POST | Expenses |
| `/api/calendar` | GET | Flight calendar |

## Deploy to Vercel

### Option A — CLI

```bash
npm i -g vercel
vercel login
vercel
```

Add environment variables in the Vercel dashboard (same as `.env.local`), then:

```bash
vercel --prod
```

### Option B — GitHub

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → Import repo.
3. Add `GOOGLE_APPS_SCRIPT_URL` and `GOOGLE_APPS_SCRIPT_API_KEY`.
4. Deploy.

## Demo users

| Name | Email | Role |
|------|-------|------|
| Pragnesh | pragnesh@o2h.com | Admin |
| Siddhi | siddhi@o2h.com | Employee |
| Rajeshree | rajeshree@o2h.com | HOD Chemistry |

## Roadmap

- **Phase 2:** OCR, AI copilot, email/WhatsApp notifications
- **Phase 3:** MakeMyTrip MyBiz, predictive budgeting
