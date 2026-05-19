"use client";

import { getCurrentFY } from "@/lib/fy";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { user } = useAuth();
  const fy = getCurrentFY();

  return (
    <header className="border-b border-slate-200 bg-white px-8 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {fy}
          </span>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 capitalize">
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
}
