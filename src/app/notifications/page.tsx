"use client";

import { AppShell } from "@/components/layout/AppShell";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { format } from "date-fns";

const typeColors: Record<string, string> = {
  approval: "bg-blue-100 text-blue-700",
  trip: "bg-emerald-100 text-emerald-700",
  expense: "bg-purple-100 text-purple-700",
  alert: "bg-orange-100 text-orange-700",
  reminder: "bg-amber-100 text-amber-700",
};

export default function NotificationsPage() {
  return (
    <AppShell
      title="Notifications"
      description="Email & WhatsApp alerts (Phase 2)"
    >
      <ul className="space-y-3">
        {NOTIFICATIONS.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border bg-white p-4 shadow-sm ${
              n.read ? "border-slate-200" : "border-blue-200 ring-1 ring-blue-100"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    typeColors[n.type] ?? "bg-slate-100"
                  }`}
                >
                  {n.type}
                </span>
                <p className="mt-2 font-medium text-slate-900">{n.title}</p>
                <p className="mt-1 text-sm text-slate-600">{n.message}</p>
              </div>
              <time className="shrink-0 text-xs text-slate-400">
                {format(new Date(n.createdAt), "dd MMM, HH:mm")}
              </time>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-slate-400">
        Production: approval pending, trip approved/rejected, expense approved, visa expiry, flight reminders
      </p>
    </AppShell>
  );
}
