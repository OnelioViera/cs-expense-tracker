"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Transaction, loadTransactions } from "@/utils/blob-storage";

export default function MonthlySummary() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState({
    bill: 0,
    expense: 0,
    income: 0,
  });
  const [bills, setBills] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  const expenseCategories = [
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
  ];

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
        console.log("Loaded transactions:", loadedTransactions);
        setTransactions(loadedTransactions);
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const [year, month] = selectedMonth.split("-");
    const filtered = transactions.filter((transaction) => {
      // Include all bills and income
      if (transaction.type === "bill" || transaction.type === "income") {
        return true;
      }
      // For expenses, check the date
      if (transaction.date) {
        const [transactionYear, transactionMonth] = transaction.date.split("-");
        return transactionYear === year && transactionMonth === month;
      }
      return false;
    });
    console.log("Filtered transactions:", filtered);
    setFilteredTransactions(filtered);
  }, [transactions, selectedMonth]);

  useEffect(() => {
    // Calculate monthly totals
    const totals = filteredTransactions.reduce(
      (acc, transaction) => {
        acc[transaction.type] += transaction.amount;
        return acc;
      },
      { bill: 0, expense: 0, income: 0 }
    );
    setMonthlyTotals(totals);

    // Group transactions by type
    setBills(filteredTransactions.filter((t) => t.type === "bill"));
    setExpenses(
      filteredTransactions.filter(
        (t) =>
          t.type === "expense" &&
          (selectedCategory === "all" || t.description === selectedCategory)
      )
    );
    setIncome(filteredTransactions.filter((t) => t.type === "income"));
  }, [filteredTransactions, selectedCategory]);

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Monthly Summary
              </h1>
              <p className="text-gray-600 mt-1">
                View your transactions and totals for each month
              </p>
            </div>
            <div className="flex items-center gap-4">
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
                Monthly Bills
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
              ${monthlyTotals.bill.toFixed(2)}
            </p>
          </div>

          {/* Expenses Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Monthly Expenses
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
              ${monthlyTotals.expense.toFixed(2)}
            </p>
          </div>

          {/* Income Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Monthly Income
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
              ${monthlyTotals.income.toFixed(2)}
            </p>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Monthly Balance
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${
                  monthlyTotals.income -
                    monthlyTotals.expense -
                    monthlyTotals.bill >=
                  0
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
                monthlyTotals.income -
                  monthlyTotals.expense -
                  monthlyTotals.bill >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              $
              {(
                monthlyTotals.income -
                monthlyTotals.expense -
                monthlyTotals.bill
              ).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Transaction Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bills List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Bills</h2>
            <div className="space-y-4">
              {bills.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <p className="font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  <p className="font-semibold text-blue-600">
                    ${transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Expenses</h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-10 px-3"
              >
                <option value="all">All Categories</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {selectedCategory !== "all" && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total for {selectedCategory}:
                </p>
                <p className="text-xl font-bold text-red-600">
                  $
                  {expenses
                    .filter((t) => t.description === selectedCategory)
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
            )}
            <div className="space-y-4">
              {expenses.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="font-semibold text-red-600">
                    ${transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Income List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Income</h2>
            <div className="space-y-4">
              {income.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <p className="font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  <p className="font-semibold text-green-600">
                    ${transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Expense Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
