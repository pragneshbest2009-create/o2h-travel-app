"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Calendar,
  CheckCircle,
  IndianRupee,
  Plane,
  Timer,
  TrendingUp,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { useFY } from "@/lib/fy-context";
import {
  ANALYTICS,
  FLIGHT_CALENDAR,
  NOTIFICATIONS,
  TRAVEL_REQUESTS,
} from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FY_PERIODS } from "@/lib/fy";

const COST_CENTERS = ["All", "Chemistry", "Biology", "DMPK", "ADL", "General"];

type Period = "full" | "Q1" | "Q2" | "Q3" | "Q4" | number;

const PERIOD_OPTIONS: { label: string; value: string }[] = [
  { label: "Full Year", value: "full" },
  { label: "Q1 (Apr–Jun)", value: "Q1" },
  { label: "Q2 (Jul–Sep)", value: "Q2" },
  { label: "Q3 (Oct–Dec)", value: "Q3" },
  { label: "Q4 (Jan–Mar)", value: "Q4" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
];

function parsePeriod(v: string): Period {
  if (v === "full" || v === "Q1" || v === "Q2" || v === "Q3" || v === "Q4")
    return v as Period;
  return Number(v);
}

function inPeriod(startDate: string, period: Period): boolean {
  if (period === "full") return true;
  const m = parseISO(startDate).getMonth() + 1;
  if (period === "Q1") return m >= 4 && m <= 6;
  if (period === "Q2") return m >= 7 && m <= 9;
  if (period === "Q3") return m >= 10 && m <= 12;
  if (period === "Q4") return m >= 1 && m <= 3;
  return m === (period as number);
}

function periodLabel(period: Period): string {
  const v = typeof period === "number" ? String(period) : period;
  return PERIOD_OPTIONS.find((o) => o.value === v)?.label ?? "Full Year";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedFY } = useFY();

  const [period, setPeriod] = useState<Period>("full");
  const [costCenter, setCostCenter] = useState("All");

  const fyPeriod = FY_PERIODS.find((p) => p.fy === selectedFY);

  const filteredRequests = useMemo(
    () =>
      TRAVEL_REQUESTS.filter((r) => {
        if (r.fy !== selectedFY) return false;
        if (costCenter !== "All" && r.department !== costCenter) return false;
        return inPeriod(r.startDate, period);
      }),
    [selectedFY, period, costCenter]
  );

  const totalCost = filteredRequests.reduce((s, r) => s + r.estimatedCost, 0);
  const totalTrips = filteredRequests.length;
  const avgCostPerTrip = totalTrips > 0 ? totalCost / totalTrips : 0;
  const avgDurationDays =
    totalTrips > 0
      ? filteredRequests.reduce((s, r) => {
          const days =
            differenceInDays(parseISO(r.endDate), parseISO(r.startDate)) + 1;
          return s + days;
        }, 0) / totalTrips
      : 0;

  const myTrips = FLIGHT_CALENDAR.filter((t) => t.userId === user?.userId);
  const myRequests = TRAVEL_REQUESTS.filter((r) => r.userId === user?.userId);
  const pendingApprovals = TRAVEL_REQUESTS.filter((r) =>
    r.status.startsWith("pending")
  ).length;

  const alerts = NOTIFICATIONS.filter((n) => !n.read).slice(0, 4);
  const insights = ANALYTICS.aiInsights.slice(0, 3);

  const activePeriodLabel = periodLabel(period);
  const filterSummary = [
    selectedFY,
    activePeriodLabel !== "Full Year" ? activePeriodLabel : null,
    costCenter !== "All" ? costCenter : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <AppShell
      title={`Hello, ${user?.name}`}
      description="Your travel & expense overview"
    >
      {/* Filter Bar — FY is in the header; period + cost center here */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Period</span>
          <select
            value={
              typeof period === "number" ? String(period) : (period as string)
            }
            onChange={(e) => setPeriod(parsePeriod(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            Cost Center
          </span>
          <select
            value={costCenter}
            onChange={(e) => setCostCenter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            {COST_CENTERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {fyPeriod && (
          <span className="ml-auto text-xs text-slate-400">
            {fyPeriod.start} → {fyPeriod.end}
          </span>
        )}
      </div>

      {/* Analysis Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Cost"
          value={formatCurrency(totalCost)}
          subtitle={filterSummary}
          icon={IndianRupee}
          variant="blue"
        />
        <StatCard
          title="Total Trips"
          value={String(totalTrips)}
          subtitle={filterSummary}
          icon={Plane}
        />
        <StatCard
          title="Avg Trip Duration"
          value={totalTrips > 0 ? `${avgDurationDays.toFixed(1)} days` : "—"}
          subtitle="Average days per trip"
          icon={Timer}
          variant="orange"
        />
        <StatCard
          title="Avg Cost / Trip"
          value={totalTrips > 0 ? formatCurrency(avgCostPerTrip) : "—"}
          subtitle="Estimated per trip"
          icon={TrendingUp}
        />
      </div>

      {/* Personal / Org Stats */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Upcoming Trips"
          value={String(myTrips.length || myRequests.length)}
          subtitle="Your confirmed & pending"
          icon={Calendar}
          variant="blue"
        />
        <StatCard
          title="Pending Approvals"
          value={String(pendingApprovals)}
          subtitle="Organisation-wide"
          icon={CheckCircle}
          variant="orange"
        />
      </div>

      {/* Alerts & Insights */}
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

      {/* Recent Travel — filtered by selections */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Recent Travel</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="pb-2 pr-4">Route</th>
                <th className="pb-2 pr-4">Dates</th>
                <th className="pb-2 pr-4">Purpose</th>
                <th className="pb-2 pr-4">Cost Center</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.slice(0, 5).map((r) => (
                <tr key={r.requestId} className="border-b border-slate-50">
                  <td className="py-3 pr-4 font-medium">
                    {r.from} → {r.to}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{r.purpose}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {r.department}
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge status={r.status} />
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    No trips found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
