import { NextResponse } from "next/server";
import { createExpenseInSheets, isGoogleSheetsEnabled } from "@/lib/google-sheets";
import { getDataSourceLabel, getExpenses } from "@/lib/data-source";

export async function GET() {
  try {
    const data = await getExpenses();
    return NextResponse.json({ data, source: getDataSourceLabel() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (isGoogleSheetsEnabled()) {
      const result = await createExpenseInSheets(body);
      return NextResponse.json({ ...result, source: "google-sheets" });
    }
    return NextResponse.json({
      success: true,
      expenseId: `E${Date.now()}`,
      source: "mock",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create expense" },
      { status: 500 }
    );
  }
}
