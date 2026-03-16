import type { Payment } from "@/types/payment";

export const mockPayments: Payment[] = [
  {
    transactionId: "TXN123456",
    sender: "John Smith",
    recipient: "Alice Wong",
    amount: 500,
    status: "Pending",
  },
  {
    transactionId: "TXN987654",
    sender: "Michael Lee",
    recipient: "David Chen",
    amount: 1200,
    status: "Completed",
  },
  {
    transactionId: "TXN654321",
    sender: "Sarah Patel",
    recipient: "Tom Brown",
    amount: 5000,
    status: "Flagged",
  },
  {
    transactionId: "TXN112233",
    sender: "Emma Davis",
    recipient: "Karen Li",
    amount: 75,
    status: "Failed",
  },
  {
    transactionId: "TXN778899",
    sender: "Daniel Clark",
    recipient: "Laura Miller",
    amount: 200,
    status: "Reversed",
  },
];
