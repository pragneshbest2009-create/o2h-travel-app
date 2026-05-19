import { NextResponse } from "next/server";
import { getDataSourceLabel } from "@/lib/data-source";
import { isGoogleSheetsEnabled } from "@/lib/google-sheets";

export async function GET() {
  const source = getDataSourceLabel();
  let googleOk = false;
  let googleMessage = "Not configured";

  if (isGoogleSheetsEnabled()) {
    try {
      const url = new URL(process.env.GOOGLE_APPS_SCRIPT_URL!);
      url.searchParams.set("action", "health");
      if (process.env.GOOGLE_APPS_SCRIPT_API_KEY) {
        url.searchParams.set("key", process.env.GOOGLE_APPS_SCRIPT_API_KEY);
      }
      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await res.json();
      googleOk = Boolean(json.success);
      googleMessage = json.message || (googleOk ? "Connected" : "Error");
    } catch (e) {
      googleMessage = e instanceof Error ? e.message : "Connection failed";
    }
  }

  return NextResponse.json({
    app: "o2h-travel-app",
    dataSource: source,
    googleSheets: { enabled: isGoogleSheetsEnabled(), ok: googleOk, message: googleMessage },
  });
}
