import { put, del, list } from "@vercel/blob";

const BLOB_STORE_PREFIX = "expense-tracker/";

export interface Transaction {
  id: string;
  type: "bill" | "expense" | "income";
  amount: number;
  description: string;
  date?: string;
}

export async function saveTransactions(transactions: Transaction[]) {
  try {
    const { url } = await put(
      `${BLOB_STORE_PREFIX}transactions.json`,
      JSON.stringify(transactions),
      {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );
    return url;
  } catch (error) {
    console.error("Error saving transactions:", error);
    throw error;
  }
}

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BLOB_STORE_URL}/${BLOB_STORE_PREFIX}transactions.json`
    );
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading transactions:", error);
    return [];
  }
}

export async function deleteTransactions() {
  try {
    const { blobs } = await list({
      prefix: BLOB_STORE_PREFIX,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    for (const blob of blobs) {
      await del(blob.url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }
  } catch (error) {
    console.error("Error deleting transactions:", error);
    throw error;
  }
}
