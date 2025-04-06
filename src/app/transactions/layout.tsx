import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions | Expense Tracker",
  description: "Add and manage your transactions",
};

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 