"use client";

import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { FLIGHT_CALENDAR } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

type ViewMode = "daily" | "weekly" | "monthly" | "annual";

const FILTERS = ["All", "Chemistry", "Biology", "UK", "USA", "Germany"];

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("monthly");
  const [filter, setFilter] = useState("All");
  const [month, setMonth] = useState(new Date(2026, 4, 1));

  const entries = useMemo(() => {
    return FLIGHT_CALENDAR.filter((e) => {
      if (filter === "All") return true;
      if (["Chemistry", "Biology"].includes(filter))
        return e.department === filter;
      return e.country === filter;
    });
  }, [filter]);

  const monthDays = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const tripsOnDay = (day: Date) =>
    entries.filter((e) => {
      const d = parseISO(e.flightDate);
      return (
        d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear()
      );
    });

  return (
    <AppShell
      title="Travel Calendar"
      description="Daily, weekly, monthly & annual views"
    >
      <div className="flex flex-wrap items-center gap-3">
        <ViewTabs view={view} setView={setView} />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        {view === "monthly" && (
          <input
            type="month"
            value={format(month, "yyyy-MM")}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              setMonth(new Date(y, m - 1, 1));
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        )}
      </div>

      {view === "monthly" && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const trips = tripsOnDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[72px] rounded-lg border p-1 text-xs ${
                    isToday(day)
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-100"
                  } ${!isSameMonth(day, month) ? "opacity-40" : ""}`}
                >
                  <span className="font-medium">{format(day, "d")}</span>
                  {trips.map((t) => (
                    <div
                      key={t.pnr}
                      className="mt-0.5 truncate rounded bg-orange-100 px-1 text-orange-800"
                      title={`${t.user} → ${t.country}`}
                    >
                      {t.user}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(view === "daily" || view === "weekly" || view === "annual") && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Airline / PNR</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const start = parseISO(e.flightDate);
                const end = e.returnDate ? parseISO(e.returnDate) : start;
                const days =
                  Math.ceil(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                  ) + 1;
                return (
                  <tr key={e.pnr} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">{e.user}</td>
                    <td className="px-4 py-3">{e.country}</td>
                    <td className="px-4 py-3">{days} Days</td>
                    <td className="px-4 py-3">{e.purpose}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {e.airline} · {e.pnr}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={e.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Filters: employee, department, country, project, FY, purpose (full filters in Phase 2)
      </p>
    </AppShell>
  );
}

function ViewTabs({
  view,
  setView,
}: {
  view: ViewMode;
  setView: (v: ViewMode) => void;
}) {
  const tabs: { id: ViewMode; label: string }[] = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "annual", label: "Annual" },
  ];
  return (
    <div className="flex rounded-lg border border-slate-200 bg-white p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setView(t.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            view === t.id
              ? "bg-blue-700 text-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
