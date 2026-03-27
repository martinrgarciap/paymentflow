import type { PagedResponse, Payment, PaymentStatus } from "@/types/payment";
import { apiFetch, readJsonOrThrow } from "./apiClient";

const BASE = "/api/payments";

export async function fetchPayments(
  page = 0,
  size = 50,
  status?: PaymentStatus,
  riskFlag?: boolean,
): Promise<PagedResponse<Payment>> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (status) query.append("status", status);
  if (riskFlag !== undefined) query.append("riskFlag", String(riskFlag));

  const res = await apiFetch(`${BASE}?${query}`);
  return readJsonOrThrow<PagedResponse<Payment>>(
    res,
    "Failed to fetch payments",
  );
}

export async function fetchPaymentById(
  transactionId: string,
): Promise<Payment> {
  const res = await apiFetch(`${BASE}/${transactionId}`);
  return readJsonOrThrow<Payment>(res, "Failed to fetch payment");
}

export async function searchPayments(
  query: string,
  page = 0,
  size = 50,
  status?: PaymentStatus,
  riskFlag?: boolean,
): Promise<PagedResponse<Payment>> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    size: String(size),
  });

  if (status) params.append("status", status);
  if (riskFlag !== undefined) params.append("riskFlag", String(riskFlag));

  const res = await apiFetch(`${BASE}/search?${params}`);
  return readJsonOrThrow<PagedResponse<Payment>>(
    res,
    "Failed to search payments",
  );
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
  if (params.status && params.status !== "All") {
    query.append("status", params.status);
  }

  query.append("page", String(params.page ?? 0));
  query.append("size", String(params.size ?? 50));

  const res = await apiFetch(`${BASE}/filter?${query}`);
  return readJsonOrThrow<PagedResponse<Payment>>(
    res,
    "Failed to filter payments",
  );
}

export async function createPayment(data: {
  senderName: string;
  recipientName: string;
  amount: number;
  referenceNote?: string;
}): Promise<Payment> {
  const res = await apiFetch(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return readJsonOrThrow<Payment>(res, "Failed to create payment");
}

export async function createAuthenticatedPayment(data: {
  recipientId: number;
  amount: number;
  referenceNote?: string;
}): Promise<Payment> {
  const res = await apiFetch(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return readJsonOrThrow<Payment>(res, "Failed to create payment");
}

export async function updatePaymentStatus(
  transactionId: string,
  status: PaymentStatus,
): Promise<Payment> {
  const res = await apiFetch(`${BASE}/${transactionId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return readJsonOrThrow<Payment>(res, "Failed to update payment status");
}

export async function fetchStatusCounts(
  search?: string,
): Promise<Record<string, number>> {
  const statuses: PaymentStatus[] = [
    "PENDING",
    "COMPLETED",
    "FAILED",
    "REVERSED",
  ];

  const allResults = await Promise.all([
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
