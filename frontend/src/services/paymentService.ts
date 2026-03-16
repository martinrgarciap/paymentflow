import type { Payment, PaymentStatus } from "@/types/payment";

const BASE = "/api/payments";

// GET /api/payments (optional status filter)
export async function fetchPayments(
  status?: PaymentStatus,
): Promise<Payment[]> {
  const query = status ? `?status=${status}` : "";
  const res = await fetch(`${BASE}${query}`);
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

// GET /api/payments/:transactionId
export async function fetchPaymentById(
  transactionId: string,
): Promise<Payment> {
  const res = await fetch(`${BASE}/${transactionId}`);
  if (!res.ok) throw new Error("Failed to fetch payment");
  return res.json();
}

// GET /api/payments/search?query=
export async function searchPayments(query: string): Promise<Payment[]> {
  const res = await fetch(`${BASE}/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search payments");
  return res.json();
}

// GET /api/payments/filter
export async function filterPayments(params: {
  transactionId?: string;
  senderName?: string;
  recipientName?: string;
  status?: PaymentStatus | "All";
}): Promise<Payment[]> {
  const query = new URLSearchParams();
  if (params.transactionId) query.append("transactionId", params.transactionId);
  if (params.senderName) query.append("senderName", params.senderName);
  if (params.recipientName) query.append("recipientName", params.recipientName);
  if (params.status && params.status !== "All")
    query.append("status", params.status);
  const res = await fetch(`${BASE}/filter?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to filter payments");
  return res.json();
}

// POST /api/payments
export async function createPayment(data: {
  senderName: string;
  recipientName: string;
  amount: number;
  currency: string;
  referenceNote?: string;
}): Promise<Payment> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create payment");
  return res.json();
}

// PATCH /api/payments/:transactionId/status
export async function updatePaymentStatus(
  transactionId: string,
  status: PaymentStatus,
): Promise<Payment> {
  const res = await fetch(`${BASE}/${transactionId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update payment status");
  return res.json();
}
