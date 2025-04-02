import { NextResponse } from "next/server";

interface Transaction {
  id: string;
  type: "bill" | "expense" | "income";
  amount: number;
  description: string;
  date?: string;
}

// In-memory storage
let transactions: Transaction[] = [];

export async function GET() {
  try {
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error loading transactions:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const newTransactions = await request.json();
    transactions = newTransactions;
    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error saving transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save transactions",
      },
      { status: 500 }
    );
  }
}
