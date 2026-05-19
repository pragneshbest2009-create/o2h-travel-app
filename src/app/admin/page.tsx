"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { ANALYTICS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, Globe, Users } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { org, byCountry, byDepartment, topTravelers, aiInsights } = ANALYTICS;
  const budgetPct = Math.round((org.actual / org.budget) * 100);

  return (
    <AppShell
      title="Analytics Dashboard"
      description="Organization, country, department & person-wise travel analytics"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Travel Cost" value={formatCurrency(org.totalCost)} icon={BarChart3} />
        <StatCard title="Total Trips" value={String(org.totalTrips)} icon={Globe} variant="orange" />
        <StatCard title="Travelers" value={String(org.totalTravelers)} icon={Users} />
        <StatCard
          title="Budget vs Actual"
          value={`${budgetPct}%`}
          subtitle={`${formatCurrency(org.actual)} / ${formatCurrency(org.budget)}`}
          icon={BarChart3}
          variant="orange"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Country-wise spend" items={byCountry.map((c) => ({ label: c.country, value: c.spend }))} />
        <ChartCard title="Department-wise spend" items={byDepartment.map((d) => ({ label: d.department, value: d.spend }))} />
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Top travelers</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="pb-2">Name</th>
              <th className="pb-2">Trips</th>
              <th className="pb-2">Total cost</th>
            </tr>
          </thead>
          <tbody>
            {topTravelers.map((t) => (
              <tr key={t.name} className="border-t border-slate-50">
                <td className="py-2 font-medium">{t.name}</td>
                <td className="py-2">{t.trips}</td>
                <td className="py-2">{formatCurrency(t.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6 rounded-xl border border-orange-200 bg-orange-50/50 p-5">
        <h2 className="text-sm font-semibold text-orange-900">AI insights (preview)</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {aiInsights.map((text, i) => (
            <li key={i}>• {text}</li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function ChartCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number }[];
}) {
  const max = Math.max(...items.map((i) => i.value));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{item.label}</span>
              <span className="font-medium">{formatCurrency(item.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
