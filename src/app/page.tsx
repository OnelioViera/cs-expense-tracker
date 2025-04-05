"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Transaction, loadTransactions } from "@/utils/blob-storage";
import { Receipt, ShoppingCart, DollarSign, Calendar } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

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

  // Calculate totals
  const totals = transactions.reduce(
    (acc, transaction) => {
      acc[transaction.type] += transaction.amount;
      return acc;
    },
    { bill: 0, expense: 0, income: 0 }
  );

  // Calculate monthly totals for the line chart
  const monthlyTotals = months.reduce(
    (acc, month) => {
      const monthTransactions = transactions.filter((t) =>
        t.date?.startsWith(`${selectedMonth.split("-")[0]}-${month.value}`)
      );
      acc[month.label] = monthTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate category totals for the doughnut chart
  const categoryTotals = transactions.reduce(
    (acc, transaction) => {
      acc[transaction.description] =
        (acc[transaction.description] || 0) + transaction.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Prepare chart data
  const lineChartData = {
    labels: months.map((m) => m.label),
    datasets: [
      {
        label: "Monthly Expenses",
        data: months.map((m) => monthlyTotals[m.label] || 0),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels: ["Bills", "Expenses", "Income"],
    datasets: [
      {
        label: "Amount",
        data: [totals.bill, totals.expense, totals.income],
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(239, 68, 68, 0.5)",
          "rgba(34, 197, 94, 0.5)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(239, 68, 68)",
          "rgb(34, 197, 94)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(239, 68, 68, 0.5)",
          "rgba(34, 197, 94, 0.5)",
          "rgba(168, 85, 247, 0.5)",
          "rgba(234, 179, 8, 0.5)",
          "rgba(249, 115, 22, 0.5)",
          "rgba(20, 184, 166, 0.5)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(239, 68, 68)",
          "rgb(34, 197, 94)",
          "rgb(168, 85, 247)",
          "rgb(234, 179, 8)",
          "rgb(249, 115, 22)",
          "rgb(20, 184, 166)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
                Expense Tracker Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Track your expenses and income
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/transactions"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <Receipt className="h-5 w-5 mr-2" />
                Transactions
              </Link>
              <Link
                href="/monthly"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Monthly Summary
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
              <Receipt className="h-6 w-6 text-blue-600" />
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
              <ShoppingCart className="h-6 w-6 text-red-600" />
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
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${totals.income.toFixed(2)}
            </p>
          </div>

          {/* Balance Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Net Balance
              </h2>
              <DollarSign className="h-6 w-6 text-gray-600" />
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

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Expenses Line Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Monthly Expenses Trend
            </h2>
            <div className="h-80">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* Category Distribution Doughnut Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Category Distribution
            </h2>
            <div className="h-80">
              <Doughnut data={doughnutChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Transaction Types Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Transaction Types Overview
          </h2>
          <div className="h-80">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
