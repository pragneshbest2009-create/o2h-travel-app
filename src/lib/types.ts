export type Role = "employee" | "manager" | "hod" | "finance" | "admin";

export type RequestStatus =
  | "draft"
  | "pending_manager"
  | "pending_hod"
  | "pending_finance"
  | "pending_admin"
  | "approved"
  | "rejected"
  | "clarification";

export type ExpenseStatus =
  | "uploaded"
  | "ocr_validated"
  | "finance_review"
  | "approved"
  | "reimbursed"
  | "rejected";

export interface User {
  userId: string;
  name: string;
  email: string;
  department: string;
  role: Role;
  reportingManager: string;
}

export interface TravelRequest {
  requestId: string;
  userId: string;
  userName: string;
  from: string;
  to: string;
  country: string;
  startDate: string;
  endDate: string;
  purpose: string;
  clientName?: string;
  department: string;
  estimatedCost: number;
  hotelRequired: boolean;
  visaRequired: boolean;
  forexRequired: boolean;
  advanceRequired: boolean;
  status: RequestStatus;
  fy: string;
  createdAt: string;
}

export interface Approval {
  approvalId: string;
  requestId: string;
  approver: string;
  approverRole: string;
  status: "pending" | "approved" | "rejected" | "clarification" | "escalated";
  remarks?: string;
  date: string;
}

export interface Expense {
  expenseId: string;
  userId: string;
  userName: string;
  category: string;
  amount: number;
  currency: string;
  fy: string;
  department: string;
  status: ExpenseStatus;
  tripRef?: string;
  uploadedAt: string;
}

export interface FlightCalendarEntry {
  user: string;
  userId: string;
  flightDate: string;
  returnDate?: string;
  airline: string;
  pnr: string;
  country: string;
  purpose: string;
  department: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface Notification {
  id: string;
  type: "approval" | "trip" | "expense" | "alert" | "reminder";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Policy {
  id: string;
  name: string;
  category: string;
  limit: string;
  description: string;
}

export interface FYPeriod {
  fy: string;
  start: string;
  end: string;
}
