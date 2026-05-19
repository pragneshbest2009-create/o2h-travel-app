"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FY_PERIODS, getFYLabel } from "@/lib/fy";
import { ANALYTICS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function FYAnalysisPage() {
  const [fy, setFy] = useState("FY27");
  const multiplier = fy === "FY27" ? 1 : fy === "FY28" ? 1.15 : 0.85;

  return (
    <AppShell
      title="Financial Year Analysis"
      description="FY27–FY35 travel spend & trends"
    >
      <select
        value={fy}
        onChange={(e) => setFy(e.target.value)}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
      >
        {FY_PERIODS.map((p) => (
          <option key={p.fy} value={p.fy}>
            {getFYLabel(p.fy)}
          </option>
        ))}
      </select>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <FYStat label="Total spend" value={formatCurrency(ANALYTICS.org.actual * multiplier)} />
        <FYStat label="Trips" value={String(Math.round(ANALYTICS.org.totalTrips * multiplier))} />
        <FYStat label="Avg trip cost" value={formatCurrency(ANALYTICS.org.avgTripCost * multiplier)} />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3">FY</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Est. spend</th>
            </tr>
          </thead>
          <tbody>
            {FY_PERIODS.map((p, i) => (
              <tr
                key={p.fy}
                className={`border-t border-slate-50 ${p.fy === fy ? "bg-blue-50" : ""}`}
              >
                <td className="px-4 py-3 font-medium">{p.fy}</td>
                <td className="px-4 py-3 text-slate-600">
                  {p.start} → {p.end}
                </td>
                <td className="px-4 py-3">
                  {formatCurrency(ANALYTICS.org.actual * (1 + i * 0.12))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function FYStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
