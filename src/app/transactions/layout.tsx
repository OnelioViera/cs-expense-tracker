import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions | Expense Tracker",
};

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
