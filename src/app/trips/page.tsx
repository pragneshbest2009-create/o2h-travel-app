"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { FLIGHT_CALENDAR, TRAVEL_REQUESTS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TripsPage() {
  const { user } = useAuth();
  const requests = TRAVEL_REQUESTS.filter(
    (r) => r.userId === user?.userId || user?.role === "admin"
  );
  const flights = FLIGHT_CALENDAR.filter(
    (f) => f.userId === user?.userId || user?.role === "admin"
  );

  return (
    <AppShell title="My Trips" description="Travel requests and confirmed bookings">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Travel requests</h2>
        <div className="mt-4 space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm text-slate-500">No travel requests yet.</p>
          ) : (
            requests.map((r) => (
              <article
                key={r.requestId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {r.from} → {r.to}, {r.country}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)} · {r.purpose}
                  </p>
                  <p className="text-xs text-slate-400">{r.requestId} · {r.fy}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(r.estimatedCost)}
                  </p>
                  <Badge status={r.status} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Flight calendar entries</h2>
        <div className="mt-4 space-y-3">
          {flights.map((f) => (
            <article
              key={f.pnr}
              className="rounded-lg border border-slate-100 px-4 py-4"
            >
              <div className="flex justify-between">
                <p className="font-medium">{f.airline}</p>
                <Badge status={f.status} />
              </div>
              <p className="text-sm text-slate-600">
                PNR {f.pnr} · {f.country}
              </p>
              <p className="text-xs text-slate-400">
                {formatDate(f.flightDate)}
                {f.returnDate && ` – ${formatDate(f.returnDate)}`}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold">Manual travel entry</h2>
        <p className="mt-1 text-sm text-slate-600">
          Booked outside MyBiz? Upload PDF or enter airline, PNR, dates, cost, hotel, purpose, country.
        </p>
        <button
          type="button"
          className="mt-3 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          Add manual trip
        </button>
      </section>
    </AppShell>
  );
}
