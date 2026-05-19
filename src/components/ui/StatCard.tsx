import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "blue" | "orange" | "slate";
}

const variants = {
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-600",
  slate: "bg-slate-100 text-slate-600",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "blue",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", variants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
