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
import { FLIGHT_CALENDAR, USERS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

type ViewMode = "daily" | "weekly" | "monthly" | "annual";

const ALL_DEPARTMENTS = [
  "All",
  "Chemistry",
  "Biology",
  "DMPK",
  "ADL",
  "General",
  "Finance",
  "HR",
  "BD",
];

const ALL_COUNTRIES = [
  "All",
  "UK",
  "USA",
  "Germany",
  "France",
  "Singapore",
  "Japan",
  "South Korea",
  "Netherlands",
  "India",
];

export default function CalendarPage() {
  const { user, isAdmin } = useAuth();
  const isHod = user?.role === "hod";
  const isManager = user?.role === "manager";
  const canFilter = isAdmin || isHod || isManager;

  const [view, setView] = useState<ViewMode>("monthly");
  const [month, setMonth] = useState(new Date(2026, 4, 1));

  // Dept filter only meaningful for admin (HODs are locked to their dept)
  const [deptFilter, setDeptFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");

  // Users shown in the User dropdown, scoped by role
  const dropdownUsers = useMemo(() => {
    if (isAdmin) {
      return deptFilter === "All"
        ? USERS
        : USERS.filter((u) => u.department === deptFilter);
    }
    if (isHod) return USERS.filter((u) => u.department === user?.department);
    if (isManager)
      return USERS.filter(
        (u) =>
          u.reportingManager === user?.name || u.userId === user?.userId
      );
    return [];
  }, [user, isAdmin, isHod, isManager, deptFilter]);

  const entries = useMemo(() => {
    let base = FLIGHT_CALENDAR;

    // Role-based scope
    if (!isAdmin) {
      if (isHod) {
        base = base.filter((e) => e.department === user?.department);
      } else if (isManager) {
        const allowed = new Set(
          USERS.filter(
            (u) =>
              u.reportingManager === user?.name || u.userId === user?.userId
          ).map((u) => u.userId)
        );
        base = base.filter((e) => allowed.has(e.userId));
      } else {
        // Employee / Finance: own entries only
        return base.filter((e) => e.userId === user?.userId);
      }
    }

    // Dropdown filters (available to admin/hod/manager)
    if (isAdmin && deptFilter !== "All")
      base = base.filter((e) => e.department === deptFilter);
    if (userFilter !== "All")
      base = base.filter((e) => e.userId === userFilter);
    if (countryFilter !== "All")
      base = base.filter((e) => e.country === countryFilter);

    return base;
  }, [
    user,
    isAdmin,
    isHod,
    isManager,
    deptFilter,
    userFilter,
    countryFilter,
  ]);

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

  const description = isAdmin
    ? "Organisation-wide travel schedule"
    : isHod
    ? `${user?.department} department travel`
    : isManager
    ? "Your team's travel schedule"
    : "Your personal travel schedule";

  return (
    <AppShell title="Travel Calendar" description={description}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <ViewTabs view={view} setView={setView} />

        {/* Department filter — admin only */}
        {isAdmin && (
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setUserFilter("All");
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            {ALL_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d === "All" ? "All Departments" : d}
              </option>
            ))}
          </select>
        )}

        {/* User filter — admin / hod / manager */}
        {canFilter && (
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="All">All Users</option>
            {dropdownUsers.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        {/* Country filter — admin / hod / manager */}
        {canFilter && (
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            {ALL_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Countries" : c}
              </option>
            ))}
          </select>
        )}

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

      {/* Context note for employees */}
      {!canFilter && (
        <p className="mt-2 text-xs text-slate-400">
          Showing your own travel plan only.
        </p>
      )}

      {/* Monthly calendar grid */}
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
                      title={`${t.user} · ${t.department} → ${t.country}`}
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

      {/* Table views */}
      {(view === "daily" || view === "weekly" || view === "annual") && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Airline / PNR</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No travel entries found.
                  </td>
                </tr>
              )}
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
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {e.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">{e.country}</td>
                    <td className="px-4 py-3">{days} days</td>
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
