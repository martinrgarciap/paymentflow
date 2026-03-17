export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";

export type Currency = "CAD" | "USD" | "EUR" | "GBP";

export interface Payment {
  transactionId: string;
  senderName: string;
  recipientName: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  riskFlag: boolean;
  referenceNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}
