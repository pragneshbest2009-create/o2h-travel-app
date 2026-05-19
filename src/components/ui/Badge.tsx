import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
  clarification: "bg-purple-100 text-purple-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  default: "bg-slate-100 text-slate-700",
};

export function Badge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/.*_/, "");
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[key] ?? styles.default
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
