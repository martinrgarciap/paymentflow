import { useDemoSession } from "@/context/DemoSessionContext";
import { createAuthenticatedPayment } from "@/services/paymentService";
import { searchUsers } from "@/services/userService";
import type { Payment } from "@/types/payment";
import type { UserSearchResult } from "@/types/user";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface FormState {
  recipientId: number | null;
  recipientName: string;
  amount: string;
  referenceNote: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;
type Stage = "form" | "confirm";
type ModalState =
  | { type: "success"; payment: Payment }
  | { type: "error"; message: string }
  | null;

const EMPTY_FORM: FormState = {
  recipientId: null,
  recipientName: "",
  amount: "",
  referenceNote: "",
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getFullName(user: UserSearchResult): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

function validatePaymentForm(
  form: FormState,
  isUserView: boolean,
  availableBalance: number | null,
): FormErrors {
  const errors: FormErrors = {};
  const amount = Number(form.amount);

  if (!form.recipientId || !form.recipientName.trim()) {
    errors.recipientName = "Please select a recipient";
  }

  if (!form.amount || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Enter a valid amount greater than 0";
  }

  if (isUserView && availableBalance !== null && amount > availableBalance) {
    errors.amount = "Amount exceeds this user's available balance";
  }

  return errors;
}

export default function SendPayment() {
  const navigate = useNavigate();
  const { isAdminView, isUserView, selectedUser } = useDemoSession();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const [recipientResults, setRecipientResults] = useState<UserSearchResult[]>(
    [],
  );
  const [recipientQuery, setRecipientQuery] = useState("");
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [recipientLoading, setRecipientLoading] = useState(false);

  const senderDisplayName = useMemo(() => {
    return isAdminView
      ? "PaymentFlow"
      : (selectedUser?.fullName ?? "Selected User");
  }, [isAdminView, selectedUser?.fullName]);

  const availableBalance = useMemo(() => {
    return isUserView ? (selectedUser?.balance ?? 0) : null;
  }, [isUserView, selectedUser?.balance]);

  const parsedAmount = useMemo(() => Number(form.amount) || 0, [form.amount]);
  const isHighValue = parsedAmount >= 5000;

  useEffect(() => {
    if (!showRecipientDropdown) {
      setRecipientResults([]);
      setRecipientLoading(false);
      return;
    }

    let ignore = false;
    const trimmedQuery = recipientQuery.trim();

    const timeoutId = window.setTimeout(async () => {
      try {
        setRecipientLoading(true);

        const results = await searchUsers(trimmedQuery);

        if (ignore) {
          return;
        }

        const filteredResults = results.filter((user) => {
          if (isUserView && selectedUser && user.id === selectedUser.id) {
            return false;
          }

          return true;
        });

        setRecipientResults(filteredResults);
      } catch {
        if (!ignore) {
          setRecipientResults([]);
        }
      } finally {
        if (!ignore) {
          setRecipientLoading(false);
        }
      }
    }, 200);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [recipientQuery, showRecipientDropdown, isUserView, selectedUser]);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  }

  function resetFlow() {
    setForm(EMPTY_FORM);
    setErrors({});
    setStage("form");
    setRecipientQuery("");
    setRecipientResults([]);
    setShowRecipientDropdown(false);
  }

  function handleRecipientSelect(user: UserSearchResult) {
    const fullName = getFullName(user);

    setForm((previous) => ({
      ...previous,
      recipientId: user.id,
      recipientName: fullName,
    }));

    setRecipientQuery(fullName);
    setShowRecipientDropdown(false);
    setErrors((previous) => ({ ...previous, recipientName: "" }));
  }

  function handleReview() {
    const nextErrors = validatePaymentForm(form, isUserView, availableBalance);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setStage("confirm");
    }
  }

  async function handleConfirm() {
    const nextErrors = validatePaymentForm(form, isUserView, availableBalance);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || form.recipientId === null) {
      setStage("form");
      return;
    }

    setSubmitting(true);

    try {
      const payment = await createAuthenticatedPayment({
        recipientId: form.recipientId,
        amount: Number(form.amount),
        referenceNote: form.referenceNote.trim() || undefined,
      });

      setModal({ type: "success", payment });
      resetFlow();
    } catch (error: unknown) {
      setModal({
        type: "error",
        message: getErrorMessage(error, "Something went wrong"),
      });
      setStage("form");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSendAnother() {
    resetFlow();
    setModal(null);
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="mx-auto max-w-lg px-4 pb-16 pt-10">
        <div className="mb-6">
          <div className="text-[1.75rem] font-black leading-tight text-gray-900">
            {stage === "form"
              ? isAdminView
                ? "Send Funds as PaymentFlow"
                : "Send a Payment"
              : "Confirm Payment"}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {stage === "form"
              ? isAdminView
                ? "Issue demo funds from PaymentFlow to a selected user"
                : "Fill in the details below to initiate a transfer"
              : "Please review the details before confirming"}
          </p>
        </div>

        {isUserView && selectedUser && (
          <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Available Balance
            </p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              ${formatCurrency(availableBalance ?? 0)}
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-1.5 bg-linear-to-r from-blue-500 via-blue-400 to-indigo-500" />

          {stage === "form" && (
            <div className="space-y-5 p-8">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  From
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {senderDisplayName}
                </p>
                {isAdminView && (
                  <p className="mt-1 text-xs text-gray-500">
                    Admin-issued payments display as PaymentFlow.
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Recipient
                </label>

                <input
                  value={recipientQuery}
                  onChange={(event) => {
                    const value = event.target.value;

                    setRecipientQuery(value);
                    setShowRecipientDropdown(true);

                    setForm((previous) => ({
                      ...previous,
                      recipientId: null,
                      recipientName: value,
                    }));

                    setErrors((previous) => ({
                      ...previous,
                      recipientName: "",
                    }));
                  }}
                  onFocus={() => setShowRecipientDropdown(true)}
                  placeholder="Search users by name or email"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                    errors.recipientName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />

                {recipientQuery && showRecipientDropdown && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    {recipientLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Searching users...
                      </div>
                    ) : recipientResults.length > 0 ? (
                      recipientResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleRecipientSelect(user)}
                          className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {getFullName(user)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {user.email}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No active users found.
                      </div>
                    )}
                  </div>
                )}

                {errors.recipientName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.recipientName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    updateField("amount", event.target.value)
                  }
                  placeholder="0.00"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                    errors.amount
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />

                {errors.amount && (
                  <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
                )}

                {isHighValue && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <span className="mt-0.5 text-amber-500">⚠</span>
                    <p className="text-xs text-amber-700">
                      <span className="font-semibold">
                        High-value transfer.
                      </span>{" "}
                      Amounts of $5,000 or more will be set to{" "}
                      <span className="font-semibold">PENDING</span> and require
                      admin approval before processing.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Reference Note{" "}
                  <span className="font-normal normal-case text-gray-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={form.referenceNote}
                  onChange={(event) =>
                    updateField("referenceNote", event.target.value)
                  }
                  placeholder="e.g. Invoice payment, Monthly rent..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition-all hover:border-gray-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {form.recipientName && parsedAmount > 0 && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <span className="font-semibold">{senderDisplayName}</span>
                  <span className="mx-2 text-blue-400">→</span>
                  <span className="font-semibold">{form.recipientName}</span>
                  <span className="ml-2 text-blue-500">
                    ${formatCurrency(parsedAmount)}
                  </span>
                </div>
              )}

              <button
                onClick={handleReview}
                className="w-full rounded-lg bg-linear-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold tracking-wide text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-md"
              >
                Review Payment →
              </button>
            </div>
          )}

          {stage === "confirm" && (
            <div className="space-y-5 p-8">
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    From
                  </span>
                  <span className="font-semibold text-gray-800">
                    {senderDisplayName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    To
                  </span>
                  <span className="font-semibold text-gray-800">
                    {form.recipientName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Amount
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${formatCurrency(parsedAmount)}
                  </span>
                </div>

                {form.referenceNote && (
                  <div className="flex items-center justify-between bg-white px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Note
                    </span>
                    <span className="max-w-xs text-right text-sm text-gray-600">
                      {form.referenceNote}
                    </span>
                  </div>
                )}
              </div>

              {isHighValue && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <span className="mt-0.5 text-amber-500">⚠</span>
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">
                      Admin approval required.
                    </span>{" "}
                    This payment will be created with{" "}
                    <span className="font-semibold">PENDING</span> status and
                    must be reviewed before it processes.
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                <p className="text-sm text-gray-600">
                  Are you sure you want to send{" "}
                  <span className="font-semibold text-gray-900">
                    ${formatCurrency(parsedAmount)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900">
                    {form.recipientName}
                  </span>
                  ?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStage("form")}
                  disabled={submitting}
                  className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  ← Go Back
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Confirm & Send →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            {modal.type === "success" ? (
              <>
                <div
                  className={`px-8 py-8 text-center ${
                    modal.payment.status === "PENDING"
                      ? "bg-linear-to-br from-orange-400 to-orange-500"
                      : "bg-linear-to-br from-green-500 to-emerald-600"
                  }`}
                >
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <span className="text-3xl text-white">
                      {modal.payment.status === "PENDING" ? "⏳" : "✓"}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-white">
                    {modal.payment.status === "PENDING"
                      ? "Pending Approval"
                      : "Payment Sent!"}
                  </h2>

                  <p className="mt-1 text-sm text-white/80">
                    {modal.payment.status === "PENDING"
                      ? "Awaiting admin review before processing"
                      : "Transaction created successfully"}
                  </p>
                </div>

                <div className="space-y-2 px-6 py-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="text-xs font-semibold text-gray-800 font-mono">
                      {modal.payment.transactionId}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">From</span>
                    <span className="font-semibold text-gray-800">
                      {modal.payment.senderName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">To</span>
                    <span className="font-semibold text-gray-800">
                      {modal.payment.recipientName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-gray-800">
                      ${formatCurrency(modal.payment.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                        modal.payment.status === "COMPLETED"
                          ? "bg-green-500"
                          : ""
                      } ${
                        modal.payment.status === "PENDING"
                          ? "bg-orange-400"
                          : ""
                      } ${modal.payment.status === "FAILED" ? "bg-red-400" : ""} ${
                        modal.payment.status === "REVERSED" ? "bg-blue-400" : ""
                      }`}
                    >
                      {modal.payment.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 px-6 pb-6">
                  <button
                    onClick={handleSendAnother}
                    className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Send Another
                  </button>

                  <button
                    onClick={() => navigate("/payments")}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Go to Payments
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-linear-to-br from-red-500 to-rose-600 px-8 py-8 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <span className="text-3xl text-white">✕</span>
                  </div>

                  <h2 className="text-xl font-black text-white">
                    Payment Failed
                  </h2>

                  <p className="mt-1 text-sm text-red-100">
                    Something went wrong
                  </p>
                </div>

                <div className="px-6 py-5">
                  <p className="text-center text-sm text-gray-600">
                    {modal.message}
                  </p>
                </div>

                <div className="flex gap-2 px-6 pb-6">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={() => navigate("/payments")}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Go to Payments
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
