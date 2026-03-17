import type { Payment, PaymentStatus } from "@/types/payment";
import { useMemo, useState } from "react";

export function statusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-orange-400";
    case "COMPLETED":
      return "bg-green-500";
    case "FAILED":
      return "bg-red-400";
    case "REVERSED":
      return "bg-blue-400";
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SortKey =
  | "transactionId"
  | "senderName"
  | "recipientName"
  | "amount"
  | "status"
  | "createdAt"
  | "riskFlag"
  | "updatedAt";
type SortDir = "asc" | "desc";

interface PaginationProps {
  page: number;
  totalPages: number;
  reloading: boolean;
  onPageChange: (p: number) => void;
}

function Pagination({
  page,
  totalPages,
  reloading,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function getPageNumbers() {
    const range: number[] = [];
    const start = Math.max(0, page - 2);
    const end = Math.min(totalPages - 1, page + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0 || reloading}
        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border bg-white
                   text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors shadow-sm"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-1">
        {pages[0] > 0 && (
          <>
            <button
              onClick={() => onPageChange(0)}
              className="w-7 h-7 text-xs rounded-lg border bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
            >
              1
            </button>
            {pages[0] > 1 && (
              <span className="text-gray-400 text-xs px-0.5">…</span>
            )}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={reloading}
            className={`w-7 h-7 text-xs rounded-lg border transition-colors shadow-sm font-medium
              ${p === page ? "bg-blue-600 border-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            {p + 1}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages - 1 && (
          <>
            {pages[pages.length - 1] < totalPages - 2 && (
              <span className="text-gray-400 text-xs px-0.5">…</span>
            )}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              className="w-7 h-7 text-xs rounded-lg border bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1 || reloading}
        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border bg-white
                   text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors shadow-sm"
      >
        Next →
      </button>
    </div>
  );
}

interface Props {
  payments: Payment[];
  page: number;
  totalPages: number;
  totalElements: number;
  reloading: boolean;
  onPageChange: (p: number) => void;
  onAction: (payment: Payment) => void;
}

const COLUMNS: { label: string; key: SortKey }[] = [
  { label: "Transaction ID", key: "transactionId" },
  { label: "Sender", key: "senderName" },
  { label: "Recipient", key: "recipientName" },
  { label: "Amount", key: "amount" },
  { label: "Status", key: "status" },
  { label: "Risk", key: "riskFlag" },
  { label: "Created", key: "createdAt" },
  { label: "Updated", key: "updatedAt" },
];

export default function TransactionsTable({
  payments,
  page,
  totalPages,
  totalElements,
  reloading,
  onPageChange,
  onAction,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = useMemo(() => {
    return [...payments].sort((a, b) => {
      const av = a[sortKey],
        bv = b[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [payments, sortKey, sortDir]);

  const start = page * 50 + 1;
  const end = Math.min((page + 1) * 50, totalElements);

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50/80">
        <span className="text-xs text-gray-400">
          {totalElements > 0
            ? `${start}–${end} of ${totalElements} transactions`
            : "No results"}
        </span>
        <Pagination
          page={page}
          totalPages={totalPages}
          reloading={reloading}
          onPageChange={onPageChange}
        />
      </div>

      <div
        className={`overflow-auto transition-opacity duration-150 ${reloading ? "opacity-50 pointer-events-none" : ""}`}
        style={{ height: "calc(100vh - 450px)", minHeight: "200px" }}
      >
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-3 py-2.5 font-semibold text-gray-600 whitespace-nowrap
                             cursor-pointer hover:bg-gray-100 hover:text-gray-800 transition-colors select-none"
                >
                  {col.label}
                  {sortKey === col.key ? (
                    <span className="text-blue-500 ml-1">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  ) : (
                    <span className="text-gray-300 ml-1">↕</span>
                  )}
                </th>
              ))}
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              sorted.map((p) => (
                <tr
                  key={p.transactionId}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-3 py-2 font-mono text-blue-600 font-medium whitespace-nowrap">
                    {p.transactionId}
                  </td>
                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    {p.senderName}
                  </td>
                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    {p.recipientName}
                  </td>
                  <td className="px-3 py-2 text-gray-800 font-medium whitespace-nowrap">
                    <span className="text-gray-400 mr-1">{p.currency}</span>$
                    {p.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold whitespace-nowrap ${statusBadgeClass(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {p.riskFlag && (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        ⚑ Flagged
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    {formatDate(p.updatedAt)}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onAction(p)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap
                      ${p.status === "PENDING" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                      ${p.status === "COMPLETED" ? "bg-gray-100 hover:bg-gray-200 text-gray-600" : ""}
                      ${p.status === "FAILED" ? "bg-gray-100 hover:bg-gray-200 text-gray-600" : ""}
                      ${p.status === "REVERSED" ? "bg-gray-100 hover:bg-gray-200 text-gray-600" : ""}
                    `}
                    >
                      {p.status === "PENDING" ? "Review" : ""}
                      {p.status === "COMPLETED" ? "Details" : ""}
                      {p.status === "FAILED" ? "Details" : ""}
                      {p.status === "REVERSED" ? "Details" : ""}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-gray-50/80 px-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          reloading={reloading}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
