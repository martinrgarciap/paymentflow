import { useState, useMemo } from "react";
import type { Payment, PaymentStatus } from "@/types/payment";

export function statusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-orange-400";
    case "COMPLETED":
      return "bg-green-500";
    case "FLAGGED":
      return "bg-red-500";
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
  | "updatedAt";
type SortDir = "asc" | "desc";

interface Props {
  payments: Payment[];
  selected: Payment | null;
  onSelect: (p: Payment) => void;
}

const COLUMNS: { label: string; key: SortKey; className?: string }[] = [
  { label: "Transaction ID", key: "transactionId" },
  { label: "Sender", key: "senderName" },
  { label: "Recipient", key: "recipientName" },
  { label: "Amount", key: "amount" },
  { label: "Status", key: "status" },
  { label: "Created", key: "createdAt" },
  { label: "Updated", key: "updatedAt" },
];

export default function TransactionsTable({
  payments,
  selected,
  onSelect,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = useMemo(() => {
    return [...payments].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
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

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap cursor-pointer
                             hover:bg-gray-100 hover:text-gray-800 transition-colors select-none"
                >
                  {col.label}
                  <SortIcon col={col.key} />
                </th>
              ))}
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
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
                  onClick={() => onSelect(p)}
                  className={`border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors
                  ${selected?.transactionId === p.transactionId ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}
                >
                  <td className="px-4 py-3 font-mono text-blue-600 font-medium text-xs whitespace-nowrap">
                    {p.transactionId}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {p.senderName}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {p.recipientName}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                    <span className="text-xs text-gray-400 mr-1">
                      {p.currency}
                    </span>
                    $
                    {p.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap ${statusBadgeClass(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(p.updatedAt)}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.status === "PENDING" && (
                      <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full transition-colors">
                        Review
                      </button>
                    )}
                    {p.status === "FLAGGED" && (
                      <button className="bg-orange-400 hover:bg-orange-500 text-white text-xs px-3 py-1 rounded-full transition-colors">
                        Review
                      </button>
                    )}
                    {["COMPLETED", "FAILED", "REVERSED"].includes(p.status) && (
                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full transition-colors">
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
