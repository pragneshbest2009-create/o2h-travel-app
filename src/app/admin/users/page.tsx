"use client";

import { AppShell } from "@/components/layout/AppShell";
import { USERS, DEPARTMENT_APPROVERS } from "@/lib/mock-data";

export default function UsersPage() {
  return (
    <AppShell title="User Management" description="Create users, roles, and approval hierarchy">
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          + Create user
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3">UserID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Manager</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.userId} className="border-b border-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{u.userId}</td>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.department}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">{u.reportingManager}</td>
                <td className="px-4 py-3">
                  <button type="button" className="text-xs text-blue-600 hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Department approvers</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {Object.entries(DEPARTMENT_APPROVERS).map(([dept, approver]) => (
            <li key={dept} className="flex justify-between border-b border-slate-50 py-2">
              <span className="font-medium">{dept}</span>
              <span className="text-slate-600">{approver}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
