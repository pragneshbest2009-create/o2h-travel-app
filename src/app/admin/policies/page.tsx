"use client";

import { AppShell } from "@/components/layout/AppShell";
import { POLICIES } from "@/lib/mock-data";

export default function PoliciesPage() {
  return (
    <AppShell
      title="Policy Management"
      description="Travel, flight class, hotel, meal & forex limits"
    >
      <button
        type="button"
        className="mb-6 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
      >
        + Add policy
      </button>
      <div className="grid gap-4 md:grid-cols-2">
        {POLICIES.map((p) => (
          <article
            key={p.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {p.category}
            </span>
            <h3 className="mt-2 font-semibold text-slate-900">{p.name}</h3>
            <p className="mt-1 text-sm font-medium text-orange-600">{p.limit}</p>
            <p className="mt-2 text-sm text-slate-600">{p.description}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
