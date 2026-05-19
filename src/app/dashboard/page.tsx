"use client";

import {
  AlertTriangle,
  Brain,
  Calendar,
  CheckCircle,
  IndianRupee,
  Plane,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import {
  ANALYTICS,
  FLIGHT_CALENDAR,
  NOTIFICATIONS,
  TRAVEL_REQUESTS,
  EXPENSES,
} from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCurrentFY } from "@/lib/fy";

export default function DashboardPage() {
  const { user } = useAuth();
  const fy = getCurrentFY();

  const myTrips = FLIGHT_CALENDAR.filter((t) => t.userId === user?.userId);
  const myRequests = TRAVEL_REQUESTS.filter((r) => r.userId === user?.userId);
  const pendingApprovals = TRAVEL_REQUESTS.filter((r) =>
    r.status.startsWith("pending")
  ).length;
  const pendingReimbursements = EXPENSES.filter(
    (e) =>
      e.userId === user?.userId &&
      !["approved", "reimbursed"].includes(e.status)
  ).length;

  const alerts = NOTIFICATIONS.filter((n) => !n.read).slice(0, 4);
  const insights = ANALYTICS.aiInsights.slice(0, 3);

  return (
    <AppShell
      title={`Hello, ${user?.name}`}
      description="Your travel & expense overview"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Upcoming Trips"
          value={String(myTrips.length || myRequests.length)}
          subtitle="Confirmed & pending"
          icon={Plane}
          variant="blue"
        />
        <StatCard
          title="Pending Approvals"
          value={String(pendingApprovals)}
          subtitle="Organization-wide"
          icon={CheckCircle}
          variant="orange"
        />
        <StatCard
          title={`${fy} Spend`}
          value={formatCurrency(ANALYTICS.org.actual)}
          subtitle={`Budget: ${formatCurrency(ANALYTICS.org.budget)}`}
          icon={IndianRupee}
        />
        <StatCard
          title="Current Month"
          value={formatCurrency(ANALYTICS.org.monthlySpend)}
          icon={Wallet}
          variant="orange"
        />
        <StatCard
          title="Avg Trip Cost"
          value={formatCurrency(ANALYTICS.org.avgTripCost)}
          icon={Calendar}
        />
        <StatCard
          title="Pending Reimbursements"
          value={String(pendingReimbursements)}
          icon={Wallet}
          variant="orange"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Smart Alerts
          </h2>
          <ul className="mt-4 space-y-3">
            {alerts.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Brain className="h-4 w-4 text-blue-600" />
            AI Insights
          </h2>
          <ul className="mt-4 space-y-3">
            {insights.map((text, i) => (
              <li
                key={i}
                className="rounded-lg border-l-4 border-orange-400 bg-orange-50/50 px-4 py-3 text-sm text-slate-700"
              >
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            Full AI copilot in Phase 2
          </p>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Recent Travel</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="pb-2 pr-4">Route</th>
                <th className="pb-2 pr-4">Dates</th>
                <th className="pb-2 pr-4">Purpose</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {TRAVEL_REQUESTS.slice(0, 5).map((r) => (
                <tr key={r.requestId} className="border-b border-slate-50">
                  <td className="py-3 pr-4 font-medium">
                    {r.from} → {r.to}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{r.purpose}</td>
                  <td className="py-3">
                    <Badge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
