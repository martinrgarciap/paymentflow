import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import TransactionsTable from "@/components/TransactionsTable";
import TransactionDetails from "@/components/TransactionDetails";
import { fetchPayments } from "@/services/paymentService";
import type { Payment } from "@/types/payment";

export default function Dashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments()
      .then((data) => {
        setPayments(data);
        setSelected(
          data.find((p) => p.status === "FLAGGED") ?? data[0] ?? null,
        );
      })
      .catch(() => setError("Failed to load payments. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter((p) => {
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchSearch =
      p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const total = payments.length;
  const pending = payments.filter((p) => p.status === "PENDING").length;
  const flagged = payments.filter((p) => p.status === "FLAGGED").length;
  const successful = payments.filter((p) => p.status === "COMPLETED").length;

  if (loading)
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
      <div className="flex gap-4">
        <StatCard
          label="Total Transactions"
          value={total}
          iconBg="bg-blue-500"
          icon="≡"
        />
        <StatCard
          label="Pending Payments"
          value={pending}
          iconBg="bg-orange-400"
          icon="$"
        />
        <StatCard
          label="Flagged Transactions"
          value={flagged}
          iconBg="bg-red-500"
          icon="⚠"
        />
        <StatCard
          label="Successful Payments"
          value={successful}
          iconBg="bg-green-500"
          icon="✓"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <select
          className="border rounded px-3 py-2 text-sm bg-white shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {["All", "PENDING", "COMPLETED", "FLAGGED", "FAILED", "REVERSED"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
        <select className="border rounded px-3 py-2 text-sm bg-white shadow-sm">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
        </select>
        <input
          className="border rounded px-3 py-2 text-sm bg-white shadow-sm flex-1 max-w-sm"
          placeholder="Search by ID or Recipient"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium">
          Search
        </button>
      </div>

      {/* Table + Details */}
      <div>
        <h2 className="font-bold text-gray-800 text-lg mb-3">
          Recent Transactions
        </h2>
        <div className="flex gap-4 items-start">
          <TransactionsTable
            payments={filtered}
            selected={selected}
            onSelect={setSelected}
          />
          {selected && <TransactionDetails payment={selected} />}
        </div>
      </div>
    </div>
  );
}
