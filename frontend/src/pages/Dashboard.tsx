import StatCard from "@/components/StatCard";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import TransactionsTable from "@/components/TransactionsTable";
import {
  fetchPayments,
  fetchStatusCounts,
  searchPayments,
} from "@/services/paymentService";
import type { Payment, PaymentStatus } from "@/types/payment";
import { useEffect, useRef, useState } from "react";

const STATUS_OPTIONS = [
  "All",
  "PENDING",
  "COMPLETED",
  "FLAGGED",
  "FAILED",
  "REVERSED",
];
const PAGE_SIZE = 50;

const STAT_CARDS = [
  {
    label: "All Transactions",
    status: "All",
    icon: "⊞",
    colorFrom: "#3b82f6",
    colorTo: "#1d4ed8",
    borderColor: "ring-blue-500",
  },
  {
    label: "Pending",
    status: "PENDING",
    icon: "⏳",
    colorFrom: "#f97316",
    colorTo: "#c2410c",
    borderColor: "ring-orange-400",
  },
  {
    label: "Completed",
    status: "COMPLETED",
    icon: "✓",
    colorFrom: "#22c55e",
    colorTo: "#15803d",
    borderColor: "ring-green-500",
  },
  {
    label: "Flagged",
    status: "FLAGGED",
    icon: "⚑",
    colorFrom: "#ef4444",
    colorTo: "#b91c1c",
    borderColor: "ring-red-500",
  },
  {
    label: "Failed",
    status: "FAILED",
    icon: "✕",
    colorFrom: "#6b7280",
    colorTo: "#374151",
    borderColor: "ring-gray-400",
  },
  {
    label: "Reversed",
    status: "REVERSED",
    icon: "↺",
    colorFrom: "#8b5cf6",
    colorTo: "#6d28d9",
    borderColor: "ring-purple-400",
  },
];

async function fetchPage(page: number, status: string, search: string) {
  if (search.trim()) {
    const res = await searchPayments(
      search.trim(),
      page,
      PAGE_SIZE,
      status !== "All" ? (status as PaymentStatus) : undefined,
    );
    return {
      content: res.content,
      totalPages: res.totalPages,
      totalElements: res.totalElements,
    };
  }
  const res = await fetchPayments(
    page,
    PAGE_SIZE,
    status !== "All" ? (status as PaymentStatus) : undefined,
  );
  return {
    content: res.content,
    totalPages: res.totalPages,
    totalElements: res.totalElements,
  };
}

export default function Dashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [modalPayment, setModalPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalForSearch, setTotalForSearch] = useState(0);

  const isFirstLoad = useRef(true);
  const isFirstRender = useRef(true);

  async function loadStatusCounts(searchTerm: string) {
    try {
      const counts = await fetchStatusCounts(searchTerm || undefined);
      setStatusCounts(counts);
    } catch {}
  }

  async function loadPage(pageNum: number, status: string, searchTerm: string) {
    if (isFirstLoad.current) setInitialLoading(true);
    else setReloading(true);
    try {
      const { content, totalPages, totalElements } = await fetchPage(
        pageNum,
        status,
        searchTerm,
      );
      setPayments(content);
      setPage(pageNum);
      setTotalPages(totalPages);
      setTotalElements(totalElements);

      if (searchTerm.trim()) {
        const allRes = await searchPayments(searchTerm.trim(), 0, 1);
        setTotalForSearch(allRes.totalElements);
      } else {
        const allRes = await fetchPayments(0, 1);
        setTotalForSearch(allRes.totalElements);
      }
    } catch {
      setError("Failed to load payments. Is the backend running?");
    } finally {
      setInitialLoading(false);
      setReloading(false);
      isFirstLoad.current = false;
    }
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const t = setTimeout(() => {
      loadPage(0, statusFilter, search);
      loadStatusCounts(search);
    }, 150);

    return () => clearTimeout(t);
  }, [search, statusFilter]);

  useEffect(() => {
    Promise.all([loadPage(0, "All", ""), loadStatusCounts("")]);
  }, []);

  function handleStatCardClick(status: string) {
    setStatusFilter(status);
  }

  function handleStatusUpdated(updated: Payment) {
    setPayments((prev) =>
      prev.map((p) =>
        p.transactionId === updated.transactionId ? updated : p,
      ),
    );
    setModalPayment(null);
    loadStatusCounts(search);
  }

  function countFor(status: string) {
    if (status === "All") return totalForSearch;
    return statusCounts[status] ?? 0;
  }

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
    <div className="bg-[#f0f4f8] p-6 space-y-4">
      <div className="grid grid-cols-6 gap-3">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.status}
            label={card.label}
            value={countFor(card.status)}
            icon={card.icon}
            colorFrom={card.colorFrom}
            colorTo={card.colorTo}
            textColor=""
            borderColor={card.borderColor}
            active={statusFilter === card.status}
            onClick={() => handleStatCardClick(card.status)}
          />
        ))}
      </div>

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
        <input
          className="border rounded px-3 py-2 text-sm bg-white shadow-sm flex-1 max-w-sm"
          placeholder="Search by ID, sender, or recipient"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <TransactionsTable
        payments={payments}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        reloading={reloading}
        onPageChange={(p) => loadPage(p, statusFilter, search)}
        onAction={setModalPayment}
      />

      <TransactionDetailsModal
        payment={modalPayment}
        onClose={() => setModalPayment(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
