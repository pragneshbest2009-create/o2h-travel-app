"use client";

import { useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { TRAVEL_REQUESTS, USERS, ANALYTICS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useFY } from "@/lib/fy-context";
import { FY_PERIODS } from "@/lib/fy";
import {
  BarChart3,
  Globe,
  IndianRupee,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";

// ── shared period helpers ─────────────────────────────────────────────────────

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

// Indian FY months in order Apr → Mar
const FY_MONTHS = [
  { m: 4, label: "Apr" },
  { m: 5, label: "May" },
  { m: 6, label: "Jun" },
  { m: 7, label: "Jul" },
  { m: 8, label: "Aug" },
  { m: 9, label: "Sep" },
  { m: 10, label: "Oct" },
  { m: 11, label: "Nov" },
  { m: 12, label: "Dec" },
  { m: 1, label: "Jan" },
  { m: 2, label: "Feb" },
  { m: 3, label: "Mar" },
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

function monthsForPeriod(period: Period) {
  if (period === "full") return FY_MONTHS;
  if (period === "Q1") return FY_MONTHS.slice(0, 3);
  if (period === "Q2") return FY_MONTHS.slice(3, 6);
  if (period === "Q3") return FY_MONTHS.slice(6, 9);
  if (period === "Q4") return FY_MONTHS.slice(9, 12);
  return FY_MONTHS.filter((x) => x.m === (period as number));
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { selectedFY } = useFY();

  const [period, setPeriod] = useState<Period>("full");
  const [costCenter, setCostCenter] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState("All");

  const fyPeriod = FY_PERIODS.find((p) => p.fy === selectedFY);

  // Base: filtered by FY + period + cost center
  const base = useMemo(
    () =>
      TRAVEL_REQUESTS.filter((r) => {
        if (r.fy !== selectedFY) return false;
        if (costCenter !== "All" && r.department !== costCenter) return false;
        return inPeriod(r.startDate, period);
      }),
    [selectedFY, period, costCenter]
  );

  // Further narrow for person-specific view
  const filtered = useMemo(
    () =>
      selectedPerson === "All"
        ? base
        : base.filter((r) => r.userId === selectedPerson),
    [base, selectedPerson]
  );

  // ── summary stats ────────────────────────────────────────────────────────
  const totalCost = filtered.reduce((s, r) => s + r.estimatedCost, 0);
  const totalTrips = filtered.length;
  const avgCostPerTrip = totalTrips > 0 ? totalCost / totalTrips : 0;
  const uniqueTravelers = new Set(filtered.map((r) => r.userId)).size;
  const fyBudget = ANALYTICS.org.budget;
  // Use org-level base (no person filter) for budget %
  const baseCost = base.reduce((s, r) => s + r.estimatedCost, 0);
  const budgetPct = fyBudget > 0 ? Math.round((baseCost / fyBudget) * 100) : 0;

  // ── quarterly snapshot (ignores period filter – always shows full FY) ────
  const quarterlySnap = useMemo(() => {
    const fyBase = TRAVEL_REQUESTS.filter(
      (r) =>
        r.fy === selectedFY &&
        (costCenter === "All" || r.department === costCenter) &&
        (selectedPerson === "All" || r.userId === selectedPerson)
    );
    return (["Q1", "Q2", "Q3", "Q4"] as const).map((q) => {
      const qReqs = fyBase.filter((r) => inPeriod(r.startDate, q));
      return {
        q,
        label:
          q === "Q1"
            ? "Q1 Apr–Jun"
            : q === "Q2"
            ? "Q2 Jul–Sep"
            : q === "Q3"
            ? "Q3 Oct–Dec"
            : "Q4 Jan–Mar",
        cost: qReqs.reduce((s, r) => s + r.estimatedCost, 0),
        trips: qReqs.length,
      };
    });
  }, [selectedFY, costCenter, selectedPerson]);

  // ── monthly trend ────────────────────────────────────────────────────────
  const monthlyTrend = useMemo(
    () =>
      monthsForPeriod(period).map(({ m, label }) => {
        const reqs = filtered.filter(
          (r) => parseISO(r.startDate).getMonth() + 1 === m
        );
        return {
          label,
          cost: reqs.reduce((s, r) => s + r.estimatedCost, 0),
          trips: reqs.length,
        };
      }),
    [filtered, period]
  );
  const maxMonthCost = Math.max(...monthlyTrend.map((m) => m.cost), 1);

  // ── department / cost-center breakdown ───────────────────────────────────
  const byDept = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      map[r.department] = (map[r.department] || 0) + r.estimatedCost;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // ── country breakdown ────────────────────────────────────────────────────
  const byCountry = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      map[r.country] = (map[r.country] || 0) + r.estimatedCost;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // ── person breakdown ─────────────────────────────────────────────────────
  const byPerson = useMemo(() => {
    const map: Record<
      string,
      { name: string; dept: string; trips: number; cost: number }
    > = {};
    base.forEach((r) => {
      if (!map[r.userId])
        map[r.userId] = {
          name: r.userName,
          dept: r.department,
          trips: 0,
          cost: 0,
        };
      map[r.userId].trips++;
      map[r.userId].cost += r.estimatedCost;
    });
    return Object.values(map).sort((a, b) => b.cost - a.cost);
  }, [base]);

  const personOptions = useMemo(
    () =>
      USERS.filter((u) =>
        costCenter === "All" ? true : u.department === costCenter
      ),
    [costCenter]
  );

  return (
    <AppShell
      title="Analytics Dashboard"
      description="Organisation, quarterly, monthly, department, cost-center & person-wise analysis"
    >
      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
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
            onChange={(e) => {
              setCostCenter(e.target.value);
              setSelectedPerson("All");
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            {COST_CENTERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Person</span>
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="All">All People</option>
            {personOptions.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.name} ({u.department})
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

      {/* ── Summary Stat Cards ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Cost"
          value={formatCurrency(totalCost)}
          subtitle={`${selectedFY}${selectedPerson !== "All" ? ` · ${byPerson.find((p) => USERS.find((u) => u.userId === selectedPerson)?.name === p.name)?.name ?? ""}` : ""}`}
          icon={IndianRupee}
          variant="blue"
        />
        <StatCard
          title="Total Trips"
          value={String(totalTrips)}
          subtitle="Approved & pending"
          icon={BarChart3}
        />
        <StatCard
          title="Avg Cost / Trip"
          value={totalTrips > 0 ? formatCurrency(avgCostPerTrip) : "—"}
          subtitle="Estimated per trip"
          icon={TrendingUp}
          variant="orange"
        />
        <StatCard
          title={selectedPerson === "All" ? "Travelers" : "Budget Used"}
          value={
            selectedPerson === "All" ? String(uniqueTravelers) : `${budgetPct}%`
          }
          subtitle={
            selectedPerson === "All"
              ? "Unique travellers"
              : `${formatCurrency(baseCost)} of ${formatCurrency(fyBudget)}`
          }
          icon={selectedPerson === "All" ? UsersIcon : Globe}
          variant={selectedPerson === "All" ? "blue" : "orange"}
        />
      </div>

      {/* ── Quarterly Snapshot ───────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quarterlySnap.map(({ q, label, cost, trips }) => (
          <button
            key={q}
            type="button"
            onClick={() => setPeriod(period === q ? "full" : q)}
            className={`rounded-xl border p-4 text-left transition-all ${
              period === q
                ? "border-blue-400 bg-blue-50 ring-1 ring-blue-400"
                : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
            } shadow-sm`}
          >
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {cost > 0 ? formatCurrency(cost) : "—"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {trips} trip{trips !== 1 ? "s" : ""}
            </p>
          </button>
        ))}
      </div>

      {/* ── Monthly Trend ────────────────────────────────────────────────── */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Monthly Trend</h2>
        <div className="mt-4 space-y-2">
          {monthlyTrend.map(({ label, cost, trips }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-xs font-medium text-slate-500">
                {label}
              </span>
              <div className="flex-1">
                <div className="h-6 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="flex h-full items-center rounded-full bg-blue-500 px-2 transition-all"
                    style={{ width: `${(cost / maxMonthCost) * 100}%` }}
                  >
                    {cost > 0 && (
                      <span className="truncate text-xs font-medium text-white">
                        {formatCurrency(cost)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="w-14 shrink-0 text-right text-xs text-slate-500">
                {trips} trip{trips !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
          {monthlyTrend.every((m) => m.cost === 0) && (
            <p className="py-4 text-center text-sm text-slate-400">
              No data for this period.
            </p>
          )}
        </div>
      </section>

      {/* ── Dept + Country Charts ─────────────────────────────────────────── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BarCard
          title={`${costCenter === "All" ? "Department" : "Cost Center"}-wise Spend`}
          items={byDept}
          colorClass="bg-blue-500"
        />
        <BarCard
          title="Country-wise Spend"
          items={byCountry}
          colorClass="bg-orange-400"
        />
      </div>

      {/* ── Person-wise Analysis ─────────────────────────────────────────── */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Person-wise Analysis
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Department</th>
                <th className="pb-2 pr-4">Trips</th>
                <th className="pb-2 pr-4">Total Cost</th>
                <th className="pb-2 pr-4">Avg Cost</th>
                <th className="pb-2">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {byPerson.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    No data for the selected filters.
                  </td>
                </tr>
              )}
              {byPerson.map((p) => {
                const pct =
                  baseCost > 0
                    ? ((p.cost / baseCost) * 100).toFixed(1)
                    : "0.0";
                const isSelected =
                  selectedPerson !== "All" &&
                  USERS.find((u) => u.userId === selectedPerson)?.name ===
                    p.name;
                return (
                  <tr
                    key={p.name}
                    className={`cursor-pointer border-b border-slate-50 hover:bg-slate-50 ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      const u = USERS.find((u) => u.name === p.name);
                      setSelectedPerson(
                        u && selectedPerson !== u.userId ? u.userId : "All"
                      );
                    }}
                  >
                    <td className="py-2.5 pr-4 font-medium text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {p.dept}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">{p.trips}</td>
                    <td className="py-2.5 pr-4 font-medium">
                      {formatCurrency(p.cost)}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">
                      {formatCurrency(Math.round(p.cost / p.trips))}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${(p.cost / baseCost) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {byPerson.length > 0 && (
          <p className="mt-2 text-xs text-slate-400">
            Click a row to filter all charts to that person. Click again to
            clear.
          </p>
        )}
      </section>

      {/* ── AI Insights ──────────────────────────────────────────────────── */}
      <section className="mt-6 rounded-xl border border-orange-200 bg-orange-50/50 p-5">
        <h2 className="text-sm font-semibold text-orange-900">
          AI Insights (preview)
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {ANALYTICS.aiInsights.map((text, i) => (
            <li key={i}>• {text}</li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

// ── Bar Chart Card ────────────────────────────────────────────────────────────

function BarCard({
  title,
  items,
  colorClass,
}: {
  title: string;
  items: { label: string; value: number }[];
  colorClass: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-center text-sm text-slate-400">No data.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="text-slate-500">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${colorClass}`}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
