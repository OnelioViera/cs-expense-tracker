import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const BLOB_STORE_PREFIX = "expense-tracker/";
const BLOB_STORE_URL = "https://blob.vercel-storage.com";

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    // Fetch directly from the Blob storage URL
    const response = await fetch(
      `${BLOB_STORE_URL}/${process.env.BLOB_READ_WRITE_TOKEN}/${BLOB_STORE_PREFIX}transactions.json`
    );

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
