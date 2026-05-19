"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Download } from "lucide-react";

const REPORTS = [
  "Monthly travel report",
  "Department-wise report",
  "Country-wise report",
  "Yearly summary",
  "Expense reimbursement report",
  "Approval audit log",
];

export default function ReportsPage() {
  return (
    <AppShell title="Reports" description="Export PDF & Excel reports">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((name) => (
          <article
            key={name}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-900">{name}</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
              >
                <Download className="h-3 w-3" /> PDF
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg bg-blue-700 px-2 py-1 text-xs text-white"
              >
                <Download className="h-3 w-3" /> Excel
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
