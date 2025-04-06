import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Summary | Expense Tracker",
  description: "View your monthly transaction summary",
};

export default function MonthlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 