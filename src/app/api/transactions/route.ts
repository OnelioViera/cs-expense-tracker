import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const BLOB_STORE_PREFIX = "expense-tracker/";

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    // List all blobs with our prefix
    const { blobs } = await list({
      prefix: BLOB_STORE_PREFIX,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Find our transactions file
    const transactionsBlob = blobs.find(
      (blob) => blob.pathname === `${BLOB_STORE_PREFIX}transactions.json`
    );

    if (!transactionsBlob) {
      return NextResponse.json([]);
    }

    // Fetch the transactions file
    const response = await fetch(transactionsBlob.url);
    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading transactions:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    const transactions = await request.json();
    const { url } = await put(
      `${BLOB_STORE_PREFIX}transactions.json`,
      JSON.stringify(transactions),
      {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );
    return NextResponse.json({ success: true, url });
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
