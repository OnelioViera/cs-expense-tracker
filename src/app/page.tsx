"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import {
  Transaction,
  saveTransactions,
  loadTransactions,
} from "@/utils/blob-storage";
import { Receipt, ShoppingCart, DollarSign, Trash2 } from "lucide-react";

interface NewTransaction {
  type: "bill" | "expense" | "income";
  amount: string;
  description: string;
}

const descriptionOptions: Record<"bill" | "expense" | "income", string[]> = {
  bill: [
    "Utilities",
    "Progressive",
    "Mint Mobile",
    "Internet",
    "Car Payment",
    "Mortgage",
    "Car Wash",
    "CPAP Supplies",
    "Hulu",
    "Netflix",
    "Spotify",
    "Medical",
    "Gas",
  ],
  expense: [
    "Groceries",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Healthcare",
    "Clothes",
    "Dog Expenses",
    "Holidays",
    "Gifts",
    "Projects",
    "Maintenance",
    "Alcohol",
    "Gas",
    "Other",
  ],
  income: ["Salary", "Gifts", "Annuity", "Daniel's Rent", "Other"],
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    type: "expense",
    amount: "",
    description: "",
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [filter, setFilter] = useState<"all" | "bill" | "expense" | "income">(
    "all"
  );

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return year.toString();
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedTransactions = await loadTransactions();
        setTransactions(loadedTransactions);
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const transactionType = submitButton
      ?.closest(".bg-white")
      ?.querySelector("h2")
      ?.textContent?.toLowerCase()
      .includes("bill")
      ? "bill"
      : submitButton
          ?.closest(".bg-white")
          ?.querySelector("h2")
          ?.textContent?.toLowerCase()
          .includes("income")
      ? "income"
      : "expense";

    // Validate amount
    if (!newTransaction.amount || newTransaction.amount === "0.00") {
      toast.error("Please enter an amount");
      return;
    }

    // Validate description
    if (!newTransaction.description) {
      toast.error("Please select a description");
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      date:
        transactionType === "expense"
          ? new Date().toISOString().split("T")[0]
          : undefined,
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);

    try {
      const savedTransactions = await saveTransactions(updatedTransactions);
      setTransactions(savedTransactions);
      toast.success("Transaction added successfully!");
      setNewTransaction({
        type: "expense",
        amount: "",
        description: "",
      });
    } catch (error) {
      console.error("Error saving transaction:", error);
      // Revert the state if saving fails
      setTransactions(transactions);
      toast.error("Failed to save transaction");
    }
  };

  const handleDelete = async (id: string) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTransactions);

    try {
      await saveTransactions(updatedTransactions);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      // Revert the state if saving fails
      setTransactions(transactions);
    }

    // Show success toast
    toast.success("Transaction deleted successfully!");
  };

  // Calculate totals
  const totals = transactions.reduce(
    (acc, transaction) => {
      acc[transaction.type] += transaction.amount;
      return acc;
    },
    { bill: 0, expense: 0, income: 0 }
  );

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        {/* Month Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Expense Tracker
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/monthly"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                Monthly Summary
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <select
                value={selectedMonth.split("-")[1]}
                onChange={(e) =>
                  setSelectedMonth(
                    `${selectedMonth.split("-")[0]}-${e.target.value}`
                  )
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-10 px-3"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedMonth.split("-")[0]}
                onChange={(e) =>
                  setSelectedMonth(
                    `${e.target.value}-${selectedMonth.split("-")[1]}`
                  )
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-10 px-3"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Bills Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Total Bills
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              ${totals.bill.toFixed(2)}
            </p>
          </div>

          {/* Expenses Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Total Expenses
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-red-600">
              ${totals.expense.toFixed(2)}
            </p>
          </div>

          {/* Income Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Total Income
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${totals.income.toFixed(2)}
            </p>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Current Balance
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${
                  totals.income - totals.expense - totals.bill >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p
              className={`text-3xl font-bold ${
                totals.income - totals.expense - totals.bill >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ${(totals.income - totals.expense - totals.bill).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Input Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Bills Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add Bill
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-12 px-4 text-gray-900 placeholder:text-gray-400"
                  value={
                    newTransaction.type === "bill"
                      ? newTransaction.amount
                      : "0.00"
                  }
                  placeholder="0.00"
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: "bill",
                      amount: e.target.value,
                    })
                  }
                  onFocus={(e) => {
                    if (e.target.value === "0.00") {
                      e.target.value = "";
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      e.target.value = "0.00";
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-12 px-4"
                  value={
                    newTransaction.type === "bill"
                      ? newTransaction.description
                      : ""
                  }
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: "bill",
                      description: e.target.value,
                    })
                  }
                >
                  <option value="" className="text-gray-900">
                    Select a bill type
                  </option>
                  <option value="Utilities" className="text-gray-900">
                    Utilities
                  </option>
                  <option value="Progressive" className="text-gray-900">
                    Progressive
                  </option>
                  <option value="Mint Mobile" className="text-gray-900">
                    Mint Mobile
                  </option>
                  <option value="Internet" className="text-gray-900">
                    Internet
                  </option>
                  <option value="Car Payment" className="text-gray-900">
                    Car Payment
                  </option>
                  <option value="Mortgage" className="text-gray-900">
                    Mortgage
                  </option>
                  <option value="Car Wash" className="text-gray-900">
                    Car Wash
                  </option>
                  <option value="CPAP Supplies" className="text-gray-900">
                    CPAP Supplies
                  </option>
                  <option value="Hulu" className="text-gray-900">
                    Hulu
                  </option>
                  <option value="Netflix" className="text-gray-900">
                    Netflix
                  </option>
                  <option value="Spotify" className="text-gray-900">
                    Spotify
                  </option>
                  <option value="Medical" className="text-gray-900">
                    Medical
                  </option>
                  <option value="Gas" className="text-gray-900">
                    Gas
                  </option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Bill
              </button>
            </form>
          </div>

          {/* Expenses Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add Expense
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-12 px-4 text-gray-900 placeholder:text-gray-400"
                  value={
                    newTransaction.type === "expense"
                      ? newTransaction.amount
                      : "0.00"
                  }
                  placeholder="0.00"
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: "expense",
                      amount: e.target.value,
                    })
                  }
                  onFocus={(e) => {
                    if (e.target.value === "0.00") {
                      e.target.value = "";
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      e.target.value = "0.00";
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-12 px-4"
                  value={
                    newTransaction.type === "expense"
                      ? newTransaction.description
                      : ""
                  }
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: "expense",
                      description: e.target.value,
                    })
                  }
                >
                  <option value="" className="text-gray-900">
                    Select an expense type
                  </option>
                  {descriptionOptions.expense.map((option) => (
                    <option
                      key={option}
                      value={option}
                      className="text-gray-900"
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Add Expense
              </button>
            </form>
          </div>

          {/* Income Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add Income
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-12 px-4 text-gray-900 placeholder:text-gray-400"
                  value={
                    newTransaction.type === "income"
                      ? newTransaction.amount
                      : "0.00"
                  }
                  placeholder="0.00"
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: "income",
                      amount: e.target.value,
                    })
                  }
                  onFocus={(e) => {
                    if (e.target.value === "0.00") {
                      e.target.value = "";
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      e.target.value = "0.00";
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-12 px-4"
                  value={
                    newTransaction.type === "income"
                      ? newTransaction.description
                      : ""
                  }
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: "income",
                      description: e.target.value,
                    })
                  }
                >
                  <option value="" className="text-gray-900">
                    Select an income type
                  </option>
                  {descriptionOptions.income.map((option) => (
                    <option
                      key={option}
                      value={option}
                      className="text-gray-900"
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Add Income
              </button>
            </form>
          </div>
        </div>

        {/* Transactions List */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Recent Transactions
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("bill")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === "bill"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Bills
              </button>
              <button
                onClick={() => setFilter("expense")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === "expense"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setFilter("income")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === "income"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Income
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No transactions found
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "bill"
                            ? "bg-red-100"
                            : transaction.type === "expense"
                            ? "bg-yellow-100"
                            : "bg-green-100"
                        }`}
                      >
                        {transaction.type === "bill" ? (
                          <Receipt className="w-5 h-5 text-red-600" />
                        ) : transaction.type === "expense" ? (
                          <ShoppingCart className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.date || "No date"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}$
                        {transaction.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
