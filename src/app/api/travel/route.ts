import { NextResponse } from "next/server";
import { getDataSourceLabel, getTravelRequests, submitTravelRequest } from "@/lib/data-source";

export async function GET() {
  try {
    const data = await getTravelRequests();
    return NextResponse.json({ data, source: getDataSourceLabel() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load travel data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await submitTravelRequest(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create travel request" },
      { status: 500 }
    );
  }
}
