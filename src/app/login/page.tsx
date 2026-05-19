"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { USERS } from "@/lib/mock-data";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.replace("/dashboard");
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(email)) {
      setError("User not found. Use a demo email below.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-800 to-blue-950 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <Plane className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold">o2h Travel App</p>
              <p className="text-sm text-blue-200">
                AI Powered Travel & Expense Management
              </p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Centralized travel approvals, expenses & analytics
          </h2>
          <p className="mt-4 text-blue-200">
            Automate travel requests, approvals, calendar, OCR extraction, and
            FY-wise reporting for all o2h group employees.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-blue-100">
            <li>• Multi-level approval workflow</li>
            <li>• Travel calendar & expense tracking</li>
            <li>• Department-wise analytics (Phase 2+)</li>
          </ul>
        </div>
        <p className="text-xs text-blue-300">Phase 1 MVP Prototype · FY27</p>
      </div>

      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-2xl font-bold text-slate-900">o2h Travel App</p>
            <p className="text-sm text-slate-500">Sign in to continue</p>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in with your o2h email (demo mode)
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="name@o2h.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Sign in
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Demo accounts
            </p>
            <div className="mt-3 space-y-2">
              {USERS.slice(0, 6).map((u) => (
                <button
                  key={u.userId}
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    setError("");
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="font-medium text-slate-800">{u.name}</span>
                  <span className="text-xs text-slate-500 capitalize">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
