import type { FYPeriod } from "./types";

export const FY_PERIODS: FYPeriod[] = [
  { fy: "FY27", start: "2026-04-01", end: "2027-03-31" },
  { fy: "FY28", start: "2027-04-01", end: "2028-03-31" },
  { fy: "FY29", start: "2028-04-01", end: "2029-03-31" },
  { fy: "FY30", start: "2029-04-01", end: "2030-03-31" },
  { fy: "FY31", start: "2030-04-01", end: "2031-03-31" },
  { fy: "FY32", start: "2031-04-01", end: "2032-03-31" },
  { fy: "FY33", start: "2032-04-01", end: "2033-03-31" },
  { fy: "FY34", start: "2033-04-01", end: "2034-03-31" },
  { fy: "FY35", start: "2034-04-01", end: "2035-03-31" },
];

export function getCurrentFY(date = new Date()): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const startYear = m >= 4 ? y : y - 1;
  const fyNum = (startYear - 1999) % 100;
  return `FY${fyNum}`;
}

export function getFYLabel(fy: string): string {
  const period = FY_PERIODS.find((p) => p.fy === fy);
  if (!period) return fy;
  return `${fy} (${period.start} → ${period.end})`;
}
