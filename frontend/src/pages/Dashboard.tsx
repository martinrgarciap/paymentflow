import StatCard from "@/components/StatCard";
import TransactionDetails from "@/components/TransactionDetails";
import TransactionsTable from "@/components/TransactionsTable";
import {
  fetchPayments,
  filterPayments,
  searchPayments,
} from "@/services/paymentService";
import type { Payment, PaymentStatus } from "@/types/payment";
import { useEffect, useState } from "react";

const STATUS_OPTIONS = [
  "All",
  "PENDING",
  "COMPLETED",
  "FLAGGED",
  "FAILED",
  "REVERSED",
];

const STAT_CARDS = [
  {
    label: "All Transactions",
    status: "All",
    icon: "⊞",
    colorFrom: "#3b82f6",
    colorTo: "#1d4ed8",
    textColor: "text-blue-600",
    borderColor: "ring-blue-500",
  },
  {
    label: "Pending",
    status: "PENDING",
    icon: "⏳",
    colorFrom: "#f97316",
    colorTo: "#c2410c",
    textColor: "text-orange-500",
    borderColor: "ring-orange-400",
  },
  {
    label: "Completed",
    status: "COMPLETED",
    icon: "✓",
    colorFrom: "#22c55e",
    colorTo: "#15803d",
    textColor: "text-green-600",
    borderColor: "ring-green-500",
  },
  {
    label: "Flagged",
    status: "FLAGGED",
    icon: "⚑",
    colorFrom: "#ef4444",
    colorTo: "#b91c1c",
    textColor: "text-red-500",
    borderColor: "ring-red-500",
  },
  {
    label: "Failed",
    status: "FAILED",
    icon: "✕",
    colorFrom: "#6b7280",
    colorTo: "#374151",
    textColor: "text-gray-500",
    borderColor: "ring-gray-400",
  },
  {
    label: "Reversed",
    status: "REVERSED",
    icon: "↺",
    colorFrom: "#8b5cf6",
    colorTo: "#6d28d9",
    textColor: "text-purple-500",
    borderColor: "ring-purple-400",
  },
];

export default function Dashboard() {
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments()
      .then((data) => {
        setAllPayments(data);
        setPayments(data);
        setSelected(
          data.find((p) => p.status === "FLAGGED") ?? data[0] ?? null,
        );
      })
      .catch(() => setError("Failed to load payments. Is the backend running?"))
      .finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    if (initialLoading) return;
    const run = async () => {
      try {
        let data: Payment[];
        if (search.trim()) {
          data = await searchPayments(search.trim());
          if (statusFilter !== "All")
            data = data.filter((p) => p.status === statusFilter);
        } else {
          data = await filterPayments({
            status: statusFilter as PaymentStatus | "All",
          });
        }
        setPayments(data);
        setAllPayments((prev) => {
          const map = new Map(prev.map((p) => [p.transactionId, p]));
          data.forEach((p) => map.set(p.transactionId, p));
          return Array.from(map.values());
        });
      } catch {}
    };
    const debounce = setTimeout(run, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter, initialLoading]);

  function handleStatCardClick(status: string) {
    setStatusFilter(status);
    setSearch("");
  }

  function handleStatusUpdated(updated: Payment) {
    setPayments((prev) =>
      prev.map((p) =>
        p.transactionId === updated.transactionId ? updated : p,
      ),
    );
    setAllPayments((prev) =>
      prev.map((p) =>
        p.transactionId === updated.transactionId ? updated : p,
      ),
    );
    setSelected(updated);
  }

  const countFor = (status: string) =>
    status === "All"
      ? allPayments.length
      : allPayments.filter((p) => p.status === status).length;

  if (initialLoading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading payments...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6 space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-6 gap-3">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.status}
            label={card.label}
            value={countFor(card.status)}
            icon={card.icon}
            colorFrom={card.colorFrom}
            colorTo={card.colorTo}
            textColor={card.textColor}
            borderColor={card.borderColor}
            active={statusFilter === card.status}
            onClick={() => handleStatCardClick(card.status)}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <select
          className="border rounded px-3 py-2 text-sm bg-white shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="border rounded px-3 py-2 text-sm bg-white shadow-sm">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
        </select>
        <input
          className="border rounded px-3 py-2 text-sm bg-white shadow-sm flex-1 max-w-sm"
          placeholder="Search by ID, sender, or recipient"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table + Details */}
      <div>
        <h2 className="font-bold text-gray-800 text-lg mb-3">
          Recent Transactions
        </h2>
        <div className="flex gap-4 items-start">
          <TransactionsTable
            payments={payments}
            selected={selected}
            onSelect={setSelected}
          />
          {selected && (
            <TransactionDetails
              payment={selected}
              onStatusUpdated={handleStatusUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
}
