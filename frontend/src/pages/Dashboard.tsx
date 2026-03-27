import StatCard from "@/components/StatCard";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import TransactionsTable from "@/components/TransactionsTable";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  fetchPayments,
  fetchStatusCounts,
  searchPayments,
} from "@/services/paymentService";
import { fetchDeactivatedUsers } from "@/services/userService";
import type { Payment, PaymentStatus } from "@/types/payment";
import { useEffect, useMemo, useRef, useState } from "react";

const STATUS_OPTIONS = ["All", "PENDING", "COMPLETED", "FAILED", "REVERSED"];
const USER_TABS = ["all", "sent", "received"] as const;
type UserTab = (typeof USER_TABS)[number];

const PAGE_SIZE = 50;
const USER_LENS_PAGE_SIZE = 500;

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

async function fetchPage(
  page: number,
  size: number,
  status: string,
  search: string,
  flagged: boolean,
) {
  const riskFlag = flagged ? true : undefined;

  if (search.trim()) {
    const res = await searchPayments(
      search.trim(),
      page,
      size,
      status !== "All" ? (status as PaymentStatus) : undefined,
      riskFlag,
    );

    return {
      content: res.content,
      totalPages: res.totalPages,
      totalElements: res.totalElements,
    };
  }

  const res = await fetchPayments(
    page,
    size,
    status !== "All" ? (status as PaymentStatus) : undefined,
    riskFlag,
  );

  return {
    content: res.content,
    totalPages: res.totalPages,
    totalElements: res.totalElements,
  };
}

function matchesUserSearch(payment: Payment, search: string) {
  if (!search.trim()) return true;

  const q = search.trim().toLowerCase();

  return (
    payment.transactionId.toLowerCase().includes(q) ||
    payment.senderName.toLowerCase().includes(q) ||
    payment.recipientName.toLowerCase().includes(q) ||
    payment.referenceNote.toLowerCase().includes(q)
  );
}

export default function Dashboard() {
  const { isAdminView, isUserView, selectedUser } = useDemoSession();

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
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [userTab, setUserTab] = useState<UserTab>("all");
  const [deactivatedUserNames, setDeactivatedUserNames] = useState<string[]>(
    [],
  );

  const isFirstLoad = useRef(true);
  const isFirstRender = useRef(true);

  const activePageSize = isAdminView ? PAGE_SIZE : USER_LENS_PAGE_SIZE;

  async function loadStatusCounts(searchTerm: string) {
    try {
      const counts = await fetchStatusCounts(searchTerm || undefined);
      setStatusCounts(counts);
    } catch {
      // ignore counts load failures for now
    }
  }

  async function loadPage(
    pageNum: number,
    status: string,
    searchTerm: string,
    flagged: boolean,
  ) {
    if (isFirstLoad.current) setInitialLoading(true);
    else setReloading(true);

    try {
      const { content, totalPages, totalElements } = await fetchPage(
        pageNum,
        activePageSize,
        status,
        searchTerm,
        flagged,
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
      loadPage(0, statusFilter, search, flaggedOnly);
      loadStatusCounts(search);
    }, 150);

    return () => clearTimeout(t);
  }, [search, statusFilter, flaggedOnly, isAdminView, selectedUser?.id]);

  useEffect(() => {
    Promise.all([loadPage(0, "All", "", false), loadStatusCounts("")]);
  }, [isAdminView, selectedUser?.id]);

  useEffect(() => {
    setPage(0);
    setModalPayment(null);
    setUserTab("all");
  }, [selectedUser?.id, isAdminView]);

  useEffect(() => {
    function loadDeactivatedUsers() {
      fetchDeactivatedUsers()
        .then((users) =>
          setDeactivatedUserNames(users.map((user) => user.fullName)),
        )
        .catch(() => setDeactivatedUserNames([]));
    }

    loadDeactivatedUsers();

    window.addEventListener("focus", loadDeactivatedUsers);
    return () => window.removeEventListener("focus", loadDeactivatedUsers);
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

  const userScopedPayments = useMemo(() => {
    if (!isUserView || !selectedUser) return payments;

    return payments.filter((payment) => {
      const fullName = selectedUser.fullName;
      const isSender = payment.senderName === fullName;
      const isRecipient = payment.recipientName === fullName;

      if (!isSender && !isRecipient) return false;
      if (!matchesUserSearch(payment, search)) return false;
      if (flaggedOnly && !payment.riskFlag) return false;
      if (statusFilter !== "All" && payment.status !== statusFilter)
        return false;

      if (userTab === "sent") return isSender;
      if (userTab === "received") return isRecipient;

      return true;
    });
  }, [
    payments,
    isUserView,
    selectedUser,
    search,
    flaggedOnly,
    statusFilter,
    userTab,
  ]);

  const userSentCount = useMemo(() => {
    if (!selectedUser) return 0;
    return payments.filter((p) => p.senderName === selectedUser.fullName)
      .length;
  }, [payments, selectedUser]);

  const userReceivedCount = useMemo(() => {
    if (!selectedUser) return 0;
    return payments.filter((p) => p.recipientName === selectedUser.fullName)
      .length;
  }, [payments, selectedUser]);

  const userTotalCount = useMemo(() => {
    if (!selectedUser) return 0;
    return payments.filter(
      (p) =>
        p.senderName === selectedUser.fullName ||
        p.recipientName === selectedUser.fullName,
    ).length;
  }, [payments, selectedUser]);

  const displayPayments = isAdminView ? payments : userScopedPayments;
  const displayTotalElements = isAdminView
    ? totalElements
    : displayPayments.length;
  const displayTotalPages = isAdminView ? totalPages : 1;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading payments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-[#f0f4f8] p-6 space-y-4">
      {isAdminView ? (
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-black text-gray-900">Welcome Admin</div>
          <p className="text-sm text-gray-500">
            Review all payment activity across the platform.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-3xl font-black text-gray-900">
              Welcome {selectedUser?.fullName}
            </div>
            <p className="text-sm text-gray-500">
              View this user’s payments and current balance.
            </p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-gray-400">
                Current Balance
              </p>
              <p className="mt-2 text-4xl md:text-5xl font-black text-gray-900">
                $
                {(selectedUser?.balance ?? 0).toLocaleString("en-CA", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {[
                {
                  key: "all",
                  label: "All",
                  icon: "⊞",
                  value: userTotalCount,
                },
                {
                  key: "received",
                  label: "Received",
                  icon: "↓",
                  value: userReceivedCount,
                },
                {
                  key: "sent",
                  label: "Sent",
                  icon: "↑",
                  value: userSentCount,
                },
              ].map((card) => {
                const isActive = userTab === card.key;

                return (
                  <button
                    key={card.key}
                    onClick={() => setUserTab(card.key as UserTab)}
                    className={`rounded-2xl border shadow-sm transition-all text-left ${
                      isActive
                        ? "border-blue-200 bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                        : "border-gray-100 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="p-3 md:p-4 flex flex-col gap-4 md:gap-5 min-h-[92px] md:min-h-[104px]">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`w-8 h-8 md:w-11 md:h-11 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {card.icon}
                        </div>

                        <div
                          className={`text-2xl md:text-3xl font-black leading-none ${
                            isActive ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {card.value}
                        </div>
                      </div>

                      <div
                        className={`text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.14em] md:tracking-[0.16em] font-semibold leading-tight ${
                          isActive ? "text-white/85" : "text-gray-400"
                        }`}
                      >
                        {card.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isAdminView && (
        <>
          <div className="space-y-2 md:hidden">
            <StatCard
              label="All Transactions"
              value={totalForSearch}
              icon="⊞"
              colorFrom="#3b82f6"
              colorTo="#1d4ed8"
              textColor=""
              borderColor="ring-blue-500"
              active={statusFilter === "All"}
              onClick={() => {
                handleStatCardClick("All");
                setFlaggedOnly(false);
              }}
              onFlaggedClick={() => {
                handleStatCardClick("All");
                setFlaggedOnly(true);
              }}
              flaggedCount={statusCounts["ALL_FLAGGED"] ?? 0}
            />
            <div className="grid grid-cols-2 gap-2">
              {STAT_CARDS.filter((c) => c.status !== "All").map((card) => (
                <StatCard
                  key={card.status}
                  label={card.label}
                  value={statusCounts[card.status] ?? 0}
                  icon={card.icon}
                  colorFrom={card.colorFrom}
                  colorTo={card.colorTo}
                  textColor=""
                  borderColor={card.borderColor}
                  active={statusFilter === card.status}
                  onClick={() => {
                    handleStatCardClick(card.status);
                    setFlaggedOnly(false);
                  }}
                  onFlaggedClick={() => {
                    handleStatCardClick(card.status);
                    setFlaggedOnly(true);
                  }}
                  flaggedCount={statusCounts[`${card.status}_FLAGGED`] ?? 0}
                />
              ))}
            </div>
          </div>

          <div className="hidden md:grid grid-cols-5 gap-3 w-full">
            {STAT_CARDS.map((card) => (
              <StatCard
                key={card.status}
                label={card.label}
                value={
                  card.status === "All"
                    ? totalForSearch
                    : (statusCounts[card.status] ?? 0)
                }
                icon={card.icon}
                colorFrom={card.colorFrom}
                colorTo={card.colorTo}
                textColor=""
                borderColor={card.borderColor}
                active={statusFilter === card.status}
                onClick={() => {
                  handleStatCardClick(card.status);
                  setFlaggedOnly(false);
                }}
                onFlaggedClick={() => {
                  handleStatCardClick(card.status);
                  setFlaggedOnly(true);
                }}
                flaggedCount={
                  card.status === "All"
                    ? (statusCounts["ALL_FLAGGED"] ?? 0)
                    : (statusCounts[`${card.status}_FLAGGED`] ?? 0)
                }
              />
            ))}
          </div>
        </>
      )}

      <div className="space-y-2">
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
            className="border rounded px-3 py-2 text-sm bg-white shadow-sm flex-1"
            placeholder={
              isAdminView
                ? "Search by ID, sender, or recipient"
                : "Search this user's payments"
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {reloading && (
            <span className="text-xs text-blue-400 animate-pulse whitespace-nowrap hidden md:block">
              Updating...
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer select-none transition-colors ${
              flaggedOnly
                ? "bg-red-50 border-red-300 text-red-600 font-medium"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="accent-red-500 w-3.5 h-3.5"
            />
            ⚑ Flagged Only
          </label>

          {reloading && (
            <span className="text-xs text-blue-400 animate-pulse md:hidden">
              Updating...
            </span>
          )}
        </div>
      </div>

      <TransactionsTable
        payments={displayPayments}
        page={isAdminView ? page : 0}
        totalPages={displayTotalPages}
        totalElements={displayTotalElements}
        reloading={reloading}
        onPageChange={(p) => {
          if (isAdminView) {
            loadPage(p, statusFilter, search, flaggedOnly);
          }
        }}
        onAction={setModalPayment}
        deactivatedUserNames={deactivatedUserNames}
        isUserLensView={isUserView}
        selectedUserFullName={selectedUser?.fullName}
      />

      <TransactionDetailsModal
        payment={modalPayment}
        onClose={() => setModalPayment(null)}
        onStatusUpdated={handleStatusUpdated}
        canManage={isAdminView}
      />
    </div>
  );
}
