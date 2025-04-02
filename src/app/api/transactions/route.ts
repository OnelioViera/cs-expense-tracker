import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const BLOB_STORE_PREFIX = "expense-tracker/";

export async function GET() {
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BLOB_STORE_URL}/${BLOB_STORE_PREFIX}transactions.json`
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
