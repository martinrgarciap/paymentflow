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
  totalElements: number;
  reloading: boolean;
  onPageChange: (p: number) => void;
}

function Pagination({
  page,
  totalPages,
  totalElements,
  reloading,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = page * 50 + 1;
  const end = Math.min((page + 1) * 50, totalElements);

  function getPageNumbers() {
    const range: number[] = [];
    const s = Math.max(0, page - 2);
    const e = Math.min(totalPages - 1, page + 2);
    for (let i = s; i <= e; i++) range.push(i);
    return range;
  }

  const pages = getPageNumbers();

  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-400 px-1">
        {totalElements > 0
          ? `${start}–${end} of ${totalElements} transactions`
          : "No results"}
      </div>
      <div className="flex items-center justify-between px-1 py-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0 || reloading}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg border bg-white
                     text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors shadow-sm"
        >
          ← Prev
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
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg border bg-white
                     text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors shadow-sm"
        >
          Next →
        </button>
      </div>
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

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return (
      <span className="text-blue-500 ml-1">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  const thClass =
    "text-left px-3 py-2.5 font-semibold text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none";

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-3 py-2 border-b bg-gray-50/80">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          reloading={reloading}
          onPageChange={onPageChange}
        />
      </div>

      <div
        className={`overflow-x-auto overflow-y-auto transition-opacity duration-150 ${reloading ? "opacity-50 pointer-events-none" : ""}`}
        style={{ height: "calc(100vh - 450px)", minHeight: "200px" }}
      >
        <table className="w-full text-xs" style={{ minWidth: "700px" }}>
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                onClick={() => handleSort("transactionId")}
                className={thClass}
              >
                Transaction ID <SortIcon col="transactionId" />
              </th>
              <th onClick={() => handleSort("senderName")} className={thClass}>
                Sender <SortIcon col="senderName" />
              </th>
              <th
                onClick={() => handleSort("recipientName")}
                className={thClass}
              >
                Recipient <SortIcon col="recipientName" />
              </th>
              <th onClick={() => handleSort("amount")} className={thClass}>
                Amount <SortIcon col="amount" />
              </th>
              <th onClick={() => handleSort("status")} className={thClass}>
                Status <SortIcon col="status" />
              </th>
              <th onClick={() => handleSort("riskFlag")} className={thClass}>
                Risk <SortIcon col="riskFlag" />
              </th>
              <th onClick={() => handleSort("createdAt")} className={thClass}>
                Created <SortIcon col="createdAt" />
              </th>
              <th onClick={() => handleSort("updatedAt")} className={thClass}>
                Updated <SortIcon col="updatedAt" />
              </th>
              <th className="sticky right-0 z-20 bg-gray-50 text-left px-3 py-2.5 font-semibold text-gray-600 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              sorted.map((p) => (
                <tr
                  key={p.transactionId}
                  onClick={() => {
                    if (window.innerWidth < 768) onAction(p);
                  }}
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
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
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
                  <td className="sticky right-0 z-10 bg-slate-100 px-3 py-2 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(p);
                      }}
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

      <div className="border-t bg-gray-50/80 px-3 py-2">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          reloading={reloading}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
