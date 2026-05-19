"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Calendar,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Plane,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const employeeNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/travel-request", label: "Travel Request", icon: Plane },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/trips", label: "My Trips", icon: FileText },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const adminNav = [
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/admin/approvals", label: "Approval Center", icon: CheckSquare },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/policies", label: "Policies", icon: Settings },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/fy-analysis", label: "FY Analysis", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">
            o2h
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Travel App</p>
            <p className="text-xs text-slate-500">Expense Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Employee
        </p>
        {employeeNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <p className="mt-4 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin
            </p>
            {adminNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-orange-50 text-orange-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.department}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
