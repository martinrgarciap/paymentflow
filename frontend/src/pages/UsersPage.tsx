import { formatDate } from "@/lib/formatDate";
import {
  deactivateUser,
  fetchUsers,
  reactivateUser,
  updateUser,
} from "@/services/userService";
import type { User } from "@/types/user";
import { useEffect, useMemo, useState } from "react";

type SortKey = "fullName" | "email" | "balance";

interface UsersPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

function UsersPagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: UsersPaginationProps) {
  if (totalPages <= 1) return null;

  const PAGE_SIZE = 8;
  const start = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, totalElements);

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
          ? `${start}–${end} of ${totalElements} users`
          : "No results"}
      </div>

      <div className="flex items-center justify-between px-1 py-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
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
              className={`w-7 h-7 text-xs rounded-lg border transition-colors shadow-sm font-medium ${
                p === page
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
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
          disabled={page >= totalPages - 1}
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

function statusBadgeClass(isDeactivated: boolean) {
  return isDeactivated
    ? "bg-red-50 text-red-600"
    : "bg-green-50 text-green-600";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [ascending, setAscending] = useState(true);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  const [detailsUser, setDetailsUser] = useState<User | null>(null);

  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [statusActionError, setStatusActionError] = useState("");
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [pendingStatusAction, setPendingStatusAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchUsers(true);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search, showDeactivated]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setAscending((prev) => !prev);
      return;
    }

    setSortKey(nextKey);
    setAscending(true);
  }

  function handleOpenDetails(user: User) {
    setDetailsUser(user);
    setEditFirstName(user.firstName ?? "");
    setEditLastName(user.lastName ?? "");
    setEditError("");
    setStatusActionError("");
    setPendingStatusAction(null);
  }

  async function handleSaveEdit() {
    if (!detailsUser) return;

    const trimmedFirstName = editFirstName.trim();
    const trimmedLastName = editLastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setEditError("Please enter both a first and last name");
      return;
    }

    try {
      setSavingEdit(true);
      setEditError("");

      const updated = await updateUser(detailsUser.id, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      });

      setDetailsUser(updated);
      await loadUsers();
    } catch {
      setEditError("Failed to update user");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleConfirmStatusAction() {
    if (!detailsUser || !pendingStatusAction) return;

    try {
      setStatusActionLoading(true);
      setStatusActionError("");

      const updated =
        pendingStatusAction === "deactivate"
          ? await deactivateUser(detailsUser.id)
          : await reactivateUser(detailsUser.id);

      setDetailsUser(updated);
      setPendingStatusAction(null);
      await loadUsers();
    } catch {
      setStatusActionError(
        pendingStatusAction === "deactivate"
          ? "Failed to deactivate user"
          : "Failed to reactivate user",
      );
    } finally {
      setStatusActionLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = users.filter((user) =>
      showDeactivated ? user.isDeactivated : !user.isDeactivated,
    );

    if (query) {
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query),
      );
    }

    result.sort((a, b) => {
      const direction = ascending ? 1 : -1;

      if (sortKey === "balance") {
        return (a.balance - b.balance) * direction;
      }

      return a[sortKey].localeCompare(b[sortKey]) * direction;
    });

    return result;
  }, [users, search, showDeactivated, sortKey, ascending]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page]);

  return (
    <div className="bg-[#f0f4f8] p-6 space-y-4">
      <div className="flex flex-col gap-1">
        <div className="text-3xl font-black text-gray-900">Users</div>
        <p className="text-sm text-gray-500">
          View, manage, and reactivate PaymentFlow users.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by first name, last name, or email"
          className="border rounded-lg px-4 py-2.5 text-sm bg-white shadow-sm flex-1"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowDeactivated(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showDeactivated
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active Users
          </button>
          <button
            onClick={() => setShowDeactivated(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showDeactivated
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Deactivated Users
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b bg-gray-50/80">
          <UsersPagination
            page={page}
            totalPages={totalPages}
            totalElements={filteredUsers.length}
            onPageChange={setPage}
          />
        </div>

        <div
          className="overflow-x-auto overflow-y-auto"
          style={{ maxHeight: "520px" }}
        >
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                <th
                  className="px-6 py-3 cursor-pointer"
                  onClick={() => toggleSort("fullName")}
                >
                  Name
                </th>
                <th
                  className="px-6 py-3 cursor-pointer"
                  onClick={() => toggleSort("email")}
                >
                  Email
                </th>
                <th
                  className="px-6 py-3 cursor-pointer"
                  onClick={() => toggleSort("balance")}
                >
                  Balance
                </th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right sticky right-0 bg-gray-50 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70"
                  >
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {user.isDeactivated
                        ? `Deactivated (${user.fullName})`
                        : user.fullName}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{user.email}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">
                      $
                      {user.balance.toLocaleString("en-CA", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                          user.isDeactivated,
                        )}`}
                      >
                        {user.isDeactivated ? "Deactivated" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right sticky right-0 bg-white z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      <button
                        onClick={() => handleOpenDetails(user)}
                        className="text-nowrap rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t bg-gray-50/80 px-3 py-2">
          <UsersPagination
            page={page}
            totalPages={totalPages}
            totalElements={filteredUsers.length}
            onPageChange={setPage}
          />
        </div>
      </div>

      {detailsUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="text-xl font-black text-gray-900">
                User Details
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Review and manage this user account.
              </p>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    First Name
                  </label>
                  <input
                    value={editFirstName}
                    onChange={(e) => {
                      setEditFirstName(e.target.value);
                      setEditError("");
                    }}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Last Name
                  </label>
                  <input
                    value={editLastName}
                    onChange={(e) => {
                      setEditLastName(e.target.value);
                      setEditError("");
                    }}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Full Name
                  </label>
                  <input
                    value={detailsUser.fullName}
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Email
                  </label>
                  <input
                    value={detailsUser.email}
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Balance
                  </label>
                  <input
                    value={`$${detailsUser.balance.toLocaleString("en-CA", {
                      minimumFractionDigits: 2,
                    })}`}
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Status
                  </label>
                  <div className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 min-h-[42px] flex items-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                        detailsUser.isDeactivated,
                      )}`}
                    >
                      {detailsUser.isDeactivated ? "Deactivated" : "Active"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Role
                  </label>
                  <input
                    value={detailsUser.isAdmin ? "Admin" : "User"}
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Created At
                  </label>
                  <input
                    value={formatDate(detailsUser.createdAt)}
                    readOnly
                    className="w-full border border-dashed border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Last Updated
                  </label>
                  <input
                    value={formatDate(detailsUser.updatedAt)}
                    readOnly
                    className="w-full border border-dashed border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {editError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {editError}
                </div>
              )}

              {statusActionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {statusActionError}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex flex-col md:flex-row gap-3 md:justify-between">
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>

                {detailsUser.isDeactivated ? (
                  <button
                    onClick={() => setPendingStatusAction("reactivate")}
                    disabled={statusActionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Reactivate User
                  </button>
                ) : (
                  <button
                    onClick={() => setPendingStatusAction("deactivate")}
                    disabled={statusActionLoading}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Deactivate User
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setDetailsUser(null);
                  setEditFirstName("");
                  setEditLastName("");
                  setEditError("");
                  setStatusActionError("");
                  setPendingStatusAction(null);
                }}
                disabled={savingEdit || statusActionLoading}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsUser && pendingStatusAction && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="text-xl font-black text-gray-900">
                {pendingStatusAction === "deactivate"
                  ? "Deactivate User"
                  : "Reactivate User"}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {pendingStatusAction === "deactivate"
                  ? "This will remove the user from active views, recipient search, and the admin lens."
                  : "This will restore the user to active views, recipient search, and the admin lens."}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div
                className={`rounded-xl px-4 py-4 border ${
                  pendingStatusAction === "deactivate"
                    ? "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <p
                  className={`text-sm ${
                    pendingStatusAction === "deactivate"
                      ? "text-red-700"
                      : "text-green-700"
                  }`}
                >
                  Are you sure you want to{" "}
                  <span className="font-semibold">
                    {pendingStatusAction === "deactivate"
                      ? "deactivate"
                      : "reactivate"}
                  </span>{" "}
                  <span className="font-semibold">{detailsUser.fullName}</span>?
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setPendingStatusAction(null)}
                disabled={statusActionLoading}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusAction}
                disabled={statusActionLoading}
                className={`flex-1 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                  pendingStatusAction === "deactivate"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {statusActionLoading
                  ? pendingStatusAction === "deactivate"
                    ? "Deactivating..."
                    : "Reactivating..."
                  : pendingStatusAction === "deactivate"
                    ? "Confirm Deactivate"
                    : "Confirm Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
