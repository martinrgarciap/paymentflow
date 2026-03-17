import type { PagedResponse, Payment, PaymentStatus } from "@/types/payment";

const BASE = `${import.meta.env.VITE_API_BASE_URL}/api/payments`;

export async function fetchPayments(
  page = 0,
  size = 50,
  status?: PaymentStatus,
  riskFlag?: boolean,
): Promise<PagedResponse<Payment>> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) query.append("status", status);
  if (riskFlag !== undefined) query.append("riskFlag", String(riskFlag));
  const res = await fetch(`${BASE}?${query}`);
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

export async function searchPayments(
  query: string,
  page = 0,
  size = 50,
  status?: PaymentStatus,
  riskFlag?: boolean,
): Promise<PagedResponse<Payment>> {
  const params = new URLSearchParams({
    query: query,
    page: String(page),
    size: String(size),
  });
  if (status) params.append("status", status);
  if (riskFlag) params.append("riskFlag", String(riskFlag));
  const res = await fetch(`${BASE}/search?${params}`);
  if (!res.ok) throw new Error("Failed to search payments");
  return res.json();
}

export async function filterPayments(params: {
  transactionId?: string;
  senderName?: string;
  recipientName?: string;
  status?: PaymentStatus | "All";
  page?: number;
  size?: number;
}): Promise<PagedResponse<Payment>> {
  const query = new URLSearchParams();
  if (params.transactionId) query.append("transactionId", params.transactionId);
  if (params.senderName) query.append("senderName", params.senderName);
  if (params.recipientName) query.append("recipientName", params.recipientName);
  if (params.status && params.status !== "All")
    query.append("status", params.status);
  query.append("page", String(params.page ?? 0));
  query.append("size", String(params.size ?? 50));
  const res = await fetch(`${BASE}/filter?${query}`);
  if (!res.ok) throw new Error("Failed to filter payments");
  return res.json();
}

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

export async function fetchStatusCounts(
  search?: string,
): Promise<Record<string, number>> {
  const statuses = [
    "PENDING",
    "COMPLETED",
    "FAILED",
    "REVERSED",
  ] as PaymentStatus[];

  const allResults = await Promise.all([
    // Total count per status
    ...statuses.map((s) =>
      search?.trim()
        ? searchPayments(search.trim(), 0, 1, s).then((r) => ({
            key: s,
            count: r.totalElements,
          }))
        : fetchPayments(0, 1, s).then((r) => ({
            key: s,
            count: r.totalElements,
          })),
    ),
    // Flagged count per status
    ...statuses.map((s) =>
      search?.trim()
        ? searchPayments(search.trim(), 0, 1, s, true).then((r) => ({
            key: `${s}_FLAGGED`,
            count: r.totalElements,
          }))
        : fetchPayments(0, 1, s, true).then((r) => ({
            key: `${s}_FLAGGED`,
            count: r.totalElements,
          })),
    ),
    // Total flagged across all statuses
    search?.trim()
      ? searchPayments(search.trim(), 0, 1, undefined, true).then((r) => ({
          key: "ALL_FLAGGED",
          count: r.totalElements,
        }))
      : fetchPayments(0, 1, undefined, true).then((r) => ({
          key: "ALL_FLAGGED",
          count: r.totalElements,
        })),
  ]);

  const counts: Record<string, number> = {};
  allResults.forEach((r) => {
    counts[r.key] = r.count;
  });
  return counts;
}
