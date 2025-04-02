import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

interface Transaction {
  id: string;
  type: "bill" | "expense" | "income";
  amount: number;
  description: string;
  date?: string;
}

const BLOB_STORE_ID = "transactions.json";

export async function GET() {
  try {
    // Try to fetch the transactions file directly
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BLOB_STORE_URL}/${BLOB_STORE_ID}`
    );

    if (!response.ok) {
      // If file doesn't exist, return empty array
      return NextResponse.json([]);
    }

    const transactions: Transaction[] = await response.json();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error loading transactions:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const newTransactions: Transaction[] = await request.json();

    // Upload the transactions to Blob storage
    await put(BLOB_STORE_ID, JSON.stringify(newTransactions), {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      success: true,
      transactions: newTransactions,
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
