export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";

export interface Payment {
  transactionId: string;
  senderName: string;
  recipientName: string;
  amount: number;
  status: PaymentStatus;
  riskFlag: boolean;
  referenceNote: string;
  createdAt: string;
  updatedAt: string;

  // optional fields for the newer backend shape
  senderId?: number;
  recipientId?: number;
  failureReason?: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}
