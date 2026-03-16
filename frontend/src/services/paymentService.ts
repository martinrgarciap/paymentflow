import type { Payment } from "@/types/payment";

const BASE = "/api/payments";

export async function fetchPayments(): Promise<Payment[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

export async function fetchPaymentById(
  transactionId: string,
): Promise<Payment> {
  const res = await fetch(`${BASE}/${transactionId}`);
  if (!res.ok) throw new Error("Failed to fetch payment");
  return res.json();
}

export async function fetchFilteredPayments(params: {
  status?: string;
}): Promise<Payment[]> {
  const query = new URLSearchParams();
  if (params.status && params.status !== "All")
    query.append("status", params.status);

  const res = await fetch(`${BASE}/filter?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch filtered payments");
  return res.json();
}
