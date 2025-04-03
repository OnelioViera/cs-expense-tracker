import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

interface Transaction {
  id: string;
  type: "bill" | "expense" | "income";
  amount: number;
  description: string;
  date?: string;
}

// Use a prefix instead of a fixed filename
const BLOB_PREFIX = "transactions-";

export async function GET() {
  try {
    // List all blobs to find our transactions file
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: BLOB_PREFIX,
    });

    // Sort by modified date to get the most recent one
    const sortedBlobs = blobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    // Get the most recent transactions file
    const latestTransactionsBlob = sortedBlobs[0];

    if (!latestTransactionsBlob) {
      console.log("No transactions file found, returning empty array");
      return NextResponse.json([]);
    }

    // Fetch the transactions file using the blob's URL
    const response = await fetch(latestTransactionsBlob.url);

    if (!response.ok) {
      console.error(
        "Failed to fetch transactions:",
        response.status,
        response.statusText
      );
      return NextResponse.json([]);
    }

    const transactions: Transaction[] = await response.json();
    console.log("Successfully loaded transactions:", transactions.length);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error loading transactions:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const newTransactions: Transaction[] = await request.json();
    console.log("Saving transactions:", newTransactions.length);

    // Upload the transactions to Blob storage with a timestamp to ensure uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const blobName = `${BLOB_PREFIX}${timestamp}.json`;

    const { url } = await put(blobName, JSON.stringify(newTransactions), {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log("Successfully saved transactions to:", url);

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
