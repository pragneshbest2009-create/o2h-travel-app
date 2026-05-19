# Google Sheets + Apps Script setup

## 1. Create the spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet named **o2h Travel App**.
2. Open **Extensions → Apps Script**.
3. Delete the default `Code.gs` content and paste everything from `google-apps-script/Code.gs` in this repo.
4. Save the project (Ctrl+S).

## 2. Initialize sheets & demo users

1. In Apps Script, select the function **`setupSheets`** in the toolbar dropdown.
2. Click **Run** → authorize when prompted.
3. Your spreadsheet will get 5 tabs with headers and sample users.

## 3. Set API key (recommended)

1. Apps Script → **Project Settings** (gear) → **Script properties**.
2. Add property: `API_KEY` = a long random string (e.g. `o2h_prod_xxxxxxxx`).
3. Use the same value in Vercel / `.env.local` as `GOOGLE_APPS_SCRIPT_API_KEY`.

## 4. Deploy as web app

1. **Deploy → New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone** (required for Vercel server to call it).
5. Deploy and copy the **Web app URL** (ends with `/exec`).

## 5. Connect Next.js / Vercel

Create `.env.local` (local) or add in Vercel → Settings → Environment Variables:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
GOOGLE_APPS_SCRIPT_API_KEY=your_api_key_here
```

Restart `npm run dev` or redeploy on Vercel.

## 6. Verify

- Local: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- Should show `"dataSource": "google-sheets"` and `"googleSheets": { "ok": true }`

## Sheet structure

| Tab | Purpose |
|-----|---------|
| Users | UserID, Name, Email, Department, Role, Reporting Manager |
| Travel Requests | Full travel request rows |
| Approvals | Approval workflow rows |
| Expenses | Expense records |
| Flight Calendar | Calendar / trip entries |

## Google Drive (Phase 2)

Create folder **o2h Travel App** with subfolders: Flight Tickets, Hotel Bills, Visa Documents, Expense Bills, Reports, User Uploads. File upload from the app will use Drive API via Apps Script in a later phase.
