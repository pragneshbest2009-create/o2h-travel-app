"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-context";
import { DEPARTMENT_APPROVERS } from "@/lib/mock-data";
import { getCurrentFY } from "@/lib/fy";

const EXPENSE_CATEGORIES = [
  "Flight",
  "Hotel",
  "Taxi",
  "Meals",
  "Visa",
  "Forex",
  "Insurance",
  "Client Entertainment",
  "Miscellaneous",
];

export default function TravelRequestPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    from: "",
    to: "",
    country: "",
    startDate: "",
    endDate: "",
    purpose: "",
    clientName: "",
    estimatedCost: "",
    hotelRequired: false,
    visaRequired: false,
    forexRequired: false,
    advanceRequired: false,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.userId,
          userName: user?.name,
          department: user?.department,
          reportingManager: user?.reportingManager,
          fy: getCurrentFY(),
          ...form,
          estimatedCost: Number(form.estimatedCost) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }
      setRequestId(data.requestId ?? null);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AppShell title="Travel Request" description="Request submitted">
        <div className="mx-auto max-w-lg rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <p className="text-lg font-semibold text-emerald-800">
            Travel request submitted
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            Routed to: Reporting Manager →{" "}
            {DEPARTMENT_APPROVERS[user?.department ?? ""] ?? "Department HOD"}{" "}
            → Finance → Admin (Pragnesh)
          </p>
          <p className="mt-1 text-xs text-emerald-600">FY: {getCurrentFY()}</p>
          {requestId && (
            <p className="mt-2 font-mono text-sm text-emerald-800">ID: {requestId}</p>
          )}
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setRequestId(null);
            }}
            className="mt-6 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white"
          >
            Submit another request
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="New Travel Request"
      description="Employee → Manager → HOD → Finance → Admin"
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <section>
          <h2 className="text-sm font-semibold text-slate-900">Trip details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="From City" name="from" value={form.from} onChange={handleChange} required />
            <Field label="To City" name="to" value={form.to} onChange={handleChange} required />
            <Field label="Country" name="country" value={form.country} onChange={handleChange} required />
            <Field label="Department" value={user?.department ?? ""} disabled />
            <Field label="Travel Date" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
            <Field label="Return Date" name="endDate" type="date" value={form.endDate} onChange={handleChange} required />
            <div className="sm:col-span-2">
              <Field label="Purpose" name="purpose" value={form.purpose} onChange={handleChange} required />
            </div>
            <Field label="Client Name" name="clientName" value={form.clientName} onChange={handleChange} />
            <Field label="Estimated Cost (INR)" name="estimatedCost" type="number" value={form.estimatedCost} onChange={handleChange} required />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-900">Requirements</h2>
          <div className="mt-4 flex flex-wrap gap-6">
            <Checkbox label="Hotel Required" name="hotelRequired" checked={form.hotelRequired} onChange={handleChange} />
            <Checkbox label="Visa Required" name="visaRequired" checked={form.visaRequired} onChange={handleChange} />
            <Checkbox label="Forex Required" name="forexRequired" checked={form.forexRequired} onChange={handleChange} />
            <Checkbox label="Advance Required" name="advanceRequired" checked={form.advanceRequired} onChange={handleChange} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-900">Attachments</h2>
          <p className="mt-1 text-xs text-slate-500">
            Flight quote, hotel quote, visa docs, supporting PDF (Google Drive in production)
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {["Flight Quote", "Hotel Quote", "Visa Documents", "Supporting PDF"].map(
              (label) => (
                <label
                  key={label}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 px-4 py-6 text-center hover:border-blue-300"
                >
                  <span className="text-sm font-medium text-slate-600">{label}</span>
                  <span className="mt-1 text-xs text-slate-400">PDF, PNG, JPG</span>
                  <input type="file" className="hidden" accept=".pdf,image/*" />
                </label>
              )
            )}
          </div>
        </section>

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Save draft
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-700 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit for approval"}
          </button>
        </div>
      </form>

      <p className="mx-auto mt-4 max-w-3xl text-xs text-slate-400">
        Expense categories reference: {EXPENSE_CATEGORIES.join(", ")}
      </p>
    </AppShell>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  disabled,
}: {
  label: string;
  name?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
      />
    </label>
  );
}

function Checkbox({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="rounded border-slate-300 text-blue-600"
      />
      {label}
    </label>
  );
}
