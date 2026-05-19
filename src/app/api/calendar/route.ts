import { NextResponse } from "next/server";
import { getDataSourceLabel, getFlightCalendar } from "@/lib/data-source";

export async function GET() {
  try {
    const data = await getFlightCalendar();
    return NextResponse.json({ data, source: getDataSourceLabel() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load calendar" },
      { status: 500 }
    );
  }
}
