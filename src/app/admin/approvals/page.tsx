"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { APPROVALS, TRAVEL_REQUESTS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ApprovalsPage() {
  const [items, setItems] = useState(APPROVALS);

  function act(id: string, status: "approved" | "rejected" | "clarification") {
    setItems((prev) =>
      prev.map((a) => (a.approvalId === id ? { ...a, status } : a))
    );
  }

  return (
    <AppShell
      title="Approval Center"
      description="Employee → Manager → HOD → Finance → Admin (Pragnesh)"
    >
      <div className="space-y-4">
        {items.map((a) => {
          const req = TRAVEL_REQUESTS.find((r) => r.requestId === a.requestId);
          if (!req) return null;
          return (
            <article
              key={a.approvalId}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {req.userName}: {req.from} → {req.to}
                  </p>
                  <p className="text-sm text-slate-600">
                    {req.purpose} · {formatDate(req.startDate)} – {formatDate(req.endDate)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {a.requestId} · Approver: {a.approver} ({a.approverRole})
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(req.estimatedCost)}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge status={a.status} />
                <button
                  type="button"
                  onClick={() => act(a.approvalId, "approved")}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => act(a.approvalId, "rejected")}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => act(a.approvalId, "clarification")}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium"
                >
                  Ask clarification
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-700"
                >
                  Escalate
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
