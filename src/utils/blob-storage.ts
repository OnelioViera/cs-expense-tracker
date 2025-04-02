export interface Transaction {
  id: string;
  type: "bill" | "expense" | "income";
  amount: number;
  description: string;
  date?: string;
}

export async function saveTransactions(transactions: Transaction[]) {
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactions),
    });

    if (!response.ok) {
      throw new Error("Failed to save transactions");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error saving transactions:", error);
    throw error;
  }
}

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const response = await fetch("/api/transactions");
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading transactions:", error);
    return [];
  }
}
