import {
  APPROVALS,
  EXPENSES,
  FLIGHT_CALENDAR,
  TRAVEL_REQUESTS,
  USERS,
} from "./mock-data";
import {
  createTravelInSheets,
  fetchApprovalsFromSheets,
  fetchCalendarFromSheets,
  fetchExpensesFromSheets,
  fetchTravelFromSheets,
  fetchUsersFromSheets,
  isGoogleSheetsEnabled,
} from "./google-sheets";
import type { Approval, Expense, FlightCalendarEntry, TravelRequest, User } from "./types";

export function getDataSourceLabel(): "google-sheets" | "mock" {
  return isGoogleSheetsEnabled() ? "google-sheets" : "mock";
}

export async function getUsers(): Promise<User[]> {
  if (isGoogleSheetsEnabled()) {
    return (await fetchUsersFromSheets()) as User[];
  }
  return USERS;
}

export async function getTravelRequests(): Promise<TravelRequest[]> {
  if (isGoogleSheetsEnabled()) {
    return (await fetchTravelFromSheets()) as TravelRequest[];
  }
  return TRAVEL_REQUESTS;
}

export async function getExpenses(): Promise<Expense[]> {
  if (isGoogleSheetsEnabled()) {
    return (await fetchExpensesFromSheets()) as Expense[];
  }
  return EXPENSES;
}

export async function getFlightCalendar(): Promise<FlightCalendarEntry[]> {
  if (isGoogleSheetsEnabled()) {
    return (await fetchCalendarFromSheets()) as FlightCalendarEntry[];
  }
  return FLIGHT_CALENDAR;
}

export async function getApprovals(): Promise<Approval[]> {
  if (isGoogleSheetsEnabled()) {
    return (await fetchApprovalsFromSheets()) as Approval[];
  }
  return APPROVALS;
}

export async function submitTravelRequest(
  payload: Record<string, unknown>
): Promise<{ success: boolean; requestId?: string; source: string }> {
  if (isGoogleSheetsEnabled()) {
    const result = await createTravelInSheets(payload);
    return { ...result, source: "google-sheets" };
  }
  return {
    success: true,
    requestId: `TR${Date.now()}`,
    source: "mock",
  };
}
