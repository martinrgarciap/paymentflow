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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STATUS_OPTIONS = [
  "All",
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REVERSED",
] as const;

const USER_TABS = ["all", "sent", "received"] as const;

type DashboardStatus = (typeof STATUS_OPTIONS)[number];
type UserTab = (typeof USER_TABS)[number];

const PAGE_SIZE = 50;
const USER_LENS_PAGE_SIZE = 500;

const STAT_CARDS: Array<{
  label: string;
  status: DashboardStatus;
  icon: string;
  colorFrom: string;
  colorTo: string;
  borderColor: string;
}> = [
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

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function matchesUserSearch(payment: Payment, searchTerm: string): boolean {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return (
    payment.transactionId.toLowerCase().includes(query) ||
    payment.senderName.toLowerCase().includes(query) ||
    payment.recipientName.toLowerCase().includes(query) ||
    (payment.referenceNote ?? "").toLowerCase().includes(query)
  );
}

async function fetchAdminPage(
  page: number,
  size: number,
  status: DashboardStatus,
  search: string,
  flagged: boolean,
) {
  const riskFlag = flagged ? true : undefined;
  const normalizedSearch = search.trim();
  const paymentStatus =
    status !== "All" ? (status as PaymentStatus) : undefined;

  if (normalizedSearch) {
    return searchPayments(
      normalizedSearch,
      page,
      size,
      paymentStatus,
      riskFlag,
    );
  }

  return fetchPayments(page, size, paymentStatus, riskFlag);
}

export default function Dashboard() {
  const { isAdminView, isUserView, selectedUser } = useDemoSession();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [modalPayment, setModalPayment] = useState<Payment | null>(null);

  const [statusFilter, setStatusFilter] = useState<DashboardStatus>("All");
  const [search, setSearch] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [userTab, setUserTab] = useState<UserTab>("all");

  const [initialLoading, setInitialLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTotal, setSearchTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [deactivatedUserNames, setDeactivatedUserNames] = useState<string[]>(
    [],
  );

  const isFirstLoad = useRef(true);

  const selectedUserFullName = selectedUser?.fullName ?? "";

  const loadStatusCounts = useCallback(
    async (searchTerm: string) => {
      if (!isAdminView) {
        return;
      }

      try {
        const counts = await fetchStatusCounts(searchTerm || undefined);
        setStatusCounts(counts);
      } catch {
        setStatusCounts({});
      }
    },
    [isAdminView],
  );

  const loadPage = useCallback(
    async (
      pageNumber: number,
      status: DashboardStatus,
      searchTerm: string,
      flagged: boolean,
    ) => {
      setError(null);

      if (isFirstLoad.current) {
        setInitialLoading(true);
      } else {
        setReloading(true);
      }

      try {
        if (isAdminView) {
          const response = await fetchAdminPage(
            pageNumber,
            PAGE_SIZE,
            status,
            searchTerm,
            flagged,
          );

          setPayments(response.content);
          setPage(pageNumber);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);

          const totalResponse = searchTerm.trim()
            ? await searchPayments(searchTerm.trim(), 0, 1)
            : await fetchPayments(0, 1);

          setSearchTotal(totalResponse.totalElements);
        } else {
          const response = await fetchPayments(0, USER_LENS_PAGE_SIZE);

          setPayments(response.content);
          setPage(0);
          setTotalPages(1);
          setTotalElements(response.content.length);
          setSearchTotal(response.totalElements);
        }
      } catch {
        setError("Failed to load payments. Is the backend running?");
      } finally {
        setInitialLoading(false);
        setReloading(false);
        isFirstLoad.current = false;
      }
    },
    [isAdminView],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPage(0, statusFilter, search, flaggedOnly);
      void loadStatusCounts(search);
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [
    statusFilter,
    search,
    flaggedOnly,
    isAdminView,
    selectedUser?.id,
    loadPage,
    loadStatusCounts,
  ]);

  useEffect(() => {
    setPage(0);
    setModalPayment(null);
    setUserTab("all");
  }, [selectedUser?.id, isAdminView]);

  useEffect(() => {
    let ignore = false;

    async function loadDeactivatedUsers() {
      try {
        const users = await fetchDeactivatedUsers();

        if (!ignore) {
          setDeactivatedUserNames(users.map((user) => user.fullName));
        }
      } catch {
        if (!ignore) {
          setDeactivatedUserNames([]);
        }
      }
    }

    void loadDeactivatedUsers();

    window.addEventListener("focus", loadDeactivatedUsers);

    return () => {
      ignore = true;
      window.removeEventListener("focus", loadDeactivatedUsers);
    };
  }, []);

  const userScopedPayments = useMemo(() => {
    if (!isUserView || !selectedUserFullName) {
      return payments;
    }

    return payments.filter((payment) => {
      const isSender = payment.senderName === selectedUserFullName;
      const isRecipient = payment.recipientName === selectedUserFullName;

      if (!isSender && !isRecipient) {
        return false;
      }

      if (!matchesUserSearch(payment, search)) {
        return false;
      }

      if (flaggedOnly && !payment.riskFlag) {
        return false;
      }

      if (statusFilter !== "All" && payment.status !== statusFilter) {
        return false;
      }

      if (userTab === "sent") {
        return isSender;
      }

      if (userTab === "received") {
        return isRecipient;
      }

      return true;
    });
  }, [
    payments,
    isUserView,
    selectedUserFullName,
    search,
    flaggedOnly,
    statusFilter,
    userTab,
  ]);

  const userSentCount = useMemo(() => {
    if (!selectedUserFullName) {
      return 0;
    }

    return payments.filter(
      (payment) => payment.senderName === selectedUserFullName,
    ).length;
  }, [payments, selectedUserFullName]);

  const userReceivedCount = useMemo(() => {
    if (!selectedUserFullName) {
      return 0;
    }

    return payments.filter(
      (payment) => payment.recipientName === selectedUserFullName,
    ).length;
  }, [payments, selectedUserFullName]);

  const userTotalCount = useMemo(() => {
    if (!selectedUserFullName) {
      return 0;
    }

    return payments.filter(
      (payment) =>
        payment.senderName === selectedUserFullName ||
        payment.recipientName === selectedUserFullName,
    ).length;
  }, [payments, selectedUserFullName]);

  const displayPayments = isAdminView ? payments : userScopedPayments;
  const displayTotalElements = isAdminView
    ? totalElements
    : displayPayments.length;
  const displayTotalPages = isAdminView ? totalPages : 1;

  function handleStatusUpdated() {
    setModalPayment(null);
    void loadPage(isAdminView ? page : 0, statusFilter, search, flaggedOnly);
    void loadStatusCounts(search);
  }

  if (initialLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Loading payments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-[#f0f4f8] p-6">
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
            <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Current Balance
              </p>
              <p className="mt-2 text-4xl font-black text-gray-900 md:text-5xl">
                ${formatCurrency(selectedUser?.balance ?? 0)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {[
                { key: "all", label: "All", icon: "⊞", value: userTotalCount },
                {
                  key: "received",
                  label: "Received",
                  icon: "↓",
                  value: userReceivedCount,
                },
                { key: "sent", label: "Sent", icon: "↑", value: userSentCount },
              ].map((card) => {
                const isActive = userTab === card.key;

                return (
                  <button
                    key={card.key}
                    onClick={() => setUserTab(card.key as UserTab)}
                    className={`rounded-2xl border text-left shadow-sm transition-all ${
                      isActive
                        ? "border-blue-200 bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                        : "border-gray-100 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex min-h-[92px] flex-col gap-4 p-3 md:min-h-[104px] md:gap-5 md:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-base font-bold md:h-11 md:w-11 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {card.icon}
                        </div>

                        <div
                          className={`text-2xl font-black leading-none md:text-3xl ${
                            isActive ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {card.value}
                        </div>
                      </div>

                      <div
                        className={`text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] sm:text-xs md:text-sm md:tracking-[0.16em] ${
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
              value={searchTotal}
              icon="⊞"
              colorFrom="#3b82f6"
              colorTo="#1d4ed8"
              textColor=""
              borderColor="ring-blue-500"
              active={statusFilter === "All"}
              onClick={() => {
                setStatusFilter("All");
                setFlaggedOnly(false);
              }}
              onFlaggedClick={() => {
                setStatusFilter("All");
                setFlaggedOnly(true);
              }}
              flaggedCount={statusCounts.ALL_FLAGGED ?? 0}
            />

            <div className="grid grid-cols-2 gap-2">
              {STAT_CARDS.filter((card) => card.status !== "All").map(
                (card) => (
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
                      setStatusFilter(card.status);
                      setFlaggedOnly(false);
                    }}
                    onFlaggedClick={() => {
                      setStatusFilter(card.status);
                      setFlaggedOnly(true);
                    }}
                    flaggedCount={statusCounts[`${card.status}_FLAGGED`] ?? 0}
                  />
                ),
              )}
            </div>
          </div>

          <div className="hidden w-full grid-cols-5 gap-3 md:grid">
            {STAT_CARDS.map((card) => (
              <StatCard
                key={card.status}
                label={card.label}
                value={
                  card.status === "All"
                    ? searchTotal
                    : (statusCounts[card.status] ?? 0)
                }
                icon={card.icon}
                colorFrom={card.colorFrom}
                colorTo={card.colorTo}
                textColor=""
                borderColor={card.borderColor}
                active={statusFilter === card.status}
                onClick={() => {
                  setStatusFilter(card.status);
                  setFlaggedOnly(false);
                }}
                onFlaggedClick={() => {
                  setStatusFilter(card.status);
                  setFlaggedOnly(true);
                }}
                flaggedCount={
                  card.status === "All"
                    ? (statusCounts.ALL_FLAGGED ?? 0)
                    : (statusCounts[`${card.status}_FLAGGED`] ?? 0)
                }
              />
            ))}
          </div>
        </>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <select
            className="rounded border bg-white px-3 py-2 text-sm shadow-sm"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as DashboardStatus)
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <input
            className="flex-1 rounded border bg-white px-3 py-2 text-sm shadow-sm"
            placeholder={
              isAdminView
                ? "Search by ID, sender, or recipient"
                : "Search this user's payments"
            }
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {reloading && (
            <span className="hidden whitespace-nowrap text-xs text-blue-400 animate-pulse md:block">
              Updating...
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label
            className={`flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              flaggedOnly
                ? "border-red-300 bg-red-50 font-medium text-red-600"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(event) => setFlaggedOnly(event.target.checked)}
              className="h-3.5 w-3.5 accent-red-500"
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
        onPageChange={(nextPage) => {
          if (isAdminView) {
            void loadPage(nextPage, statusFilter, search, flaggedOnly);
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
