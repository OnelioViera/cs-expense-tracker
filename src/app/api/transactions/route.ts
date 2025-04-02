import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const BLOB_STORE_PREFIX = "expense-tracker/";

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    // Fetch from the Blob storage using the token
    const response = await fetch(
      `https://api.vercel.com/v2/blobs/${BLOB_STORE_PREFIX}transactions.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        },
      }
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

    // Return the transactions data along with the URL
    return NextResponse.json({
      success: true,
      url,
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
