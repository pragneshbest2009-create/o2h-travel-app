import { NextResponse } from "next/server";
import { getDataSourceLabel, getUsers } from "@/lib/data-source";

export async function GET() {
  try {
    const data = await getUsers();
    return NextResponse.json({ data, source: getDataSourceLabel() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load users" },
      { status: 500 }
    );
  }
}
