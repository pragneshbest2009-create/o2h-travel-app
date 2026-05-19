"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { EXPENSES } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCurrentFY } from "@/lib/fy";

const CATEGORIES = [
  "Flight",
  "Hotel",
  "Taxi",
  "Meals",
  "Visa",
  "Forex",
  "Insurance",
  "Client Entertainment",
  "Miscellaneous",
];

const UPLOAD_TYPES = [
  "Flight Ticket PDF",
  "Boarding Pass",
  "Hotel Invoice",
  "Visa Invoice",
  "Taxi Invoice",
  "Meal Bills",
];

export default function ExpensesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"upload" | "list">("list");
  const myExpenses = EXPENSES.filter((e) => e.userId === user?.userId);

  return (
    <AppShell
      title="Expense Management"
      description="Upload → OCR → Finance → Approval → Reimbursement"
    >
      <div className="flex gap-2">
        <TabButton active={tab === "list"} onClick={() => setTab("list")}>
          My expenses
        </TabButton>
        <TabButton active={tab === "upload"} onClick={() => setTab("upload")}>
          Upload bill
        </TabButton>
      </div>

      {tab === "upload" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold">Upload & OCR (Phase 2)</h2>
            <p className="mt-1 text-xs text-slate-500">
              Google Vision + OpenAI will extract passenger, PNR, amounts, GST, hotel dates
            </p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 px-6 py-12">
              <Upload className="h-10 w-10 text-blue-600" />
              <span className="mt-2 text-sm font-medium text-slate-700">
                Drop PDF or image
              </span>
              <input type="file" className="hidden" accept=".pdf,image/*" />
            </label>
            <select className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {UPLOAD_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold">Manual entry</h2>
            <form className="mt-4 space-y-3">
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                placeholder="Amount (INR)"
                type="number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Trip reference (optional)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                className="w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Submit expense
              </button>
            </form>
          </section>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">FY</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(myExpenses.length ? myExpenses : EXPENSES).map((e) => (
                <tr key={e.expenseId} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{e.expenseId}</td>
                  <td className="px-4 py-3">{e.category}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(e.amount, e.currency)}
                  </td>
                  <td className="px-4 py-3">{e.fy}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(e.uploadedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Current FY: {getCurrentFY()} · Workflow matches spec sheet: Expenses
      </p>
    </AppShell>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        active
          ? "bg-blue-700 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
