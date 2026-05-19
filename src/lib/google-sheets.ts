/**
 * Server-side client for Google Apps Script web app.
 * Falls back to mock data when GOOGLE_APPS_SCRIPT_URL is not set.
 */

const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const API_KEY = process.env.GOOGLE_APPS_SCRIPT_API_KEY;

export function isGoogleSheetsEnabled(): boolean {
  return Boolean(GAS_URL?.trim());
}

type GasAction =
  | "users"
  | "travel"
  | "expenses"
  | "calendar"
  | "approvals"
  | "health";

interface GasResponse<T> {
  data?: T;
  success?: boolean;
  error?: string;
  message?: string;
}

async function gasGet<T>(action: GasAction): Promise<T> {
  if (!GAS_URL) throw new Error("GOOGLE_APPS_SCRIPT_URL is not configured");

  const url = new URL(GAS_URL);
  url.searchParams.set("action", action);
  if (API_KEY) url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`Google Sheets API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GasResponse<T>;
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

async function gasPost<T>(body: Record<string, unknown>): Promise<T> {
  if (!GAS_URL) throw new Error("GOOGLE_APPS_SCRIPT_URL is not configured");

  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...body,
      key: API_KEY || undefined,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google Sheets API error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
}

export async function fetchUsersFromSheets() {
  return gasGet<unknown[]>("users");
}

export async function fetchTravelFromSheets() {
  return gasGet<unknown[]>("travel");
}

export async function fetchExpensesFromSheets() {
  return gasGet<unknown[]>("expenses");
}

export async function fetchCalendarFromSheets() {
  return gasGet<unknown[]>("calendar");
}

export async function fetchApprovalsFromSheets() {
  return gasGet<unknown[]>("approvals");
}

export async function createTravelInSheets(payload: Record<string, unknown>) {
  return gasPost<{ success: boolean; requestId?: string; error?: string }>({
    action: "createTravel",
    payload,
  });
}

export async function createExpenseInSheets(payload: Record<string, unknown>) {
  return gasPost<{ success: boolean; expenseId?: string; error?: string }>({
    action: "createExpense",
    payload,
  });
}

export async function checkGoogleHealth() {
  return gasGet<{ success: boolean; message?: string }>("health" as GasAction);
}
