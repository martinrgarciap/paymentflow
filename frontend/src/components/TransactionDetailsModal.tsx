import { useState } from "react";
import type { Payment } from "@/types/payment";
import { statusBadgeClass } from "./TransactionsTable";
import { updatePaymentStatus } from "@/services/paymentService";

interface Props {
  payment: Payment | null;
  onClose: () => void;
  onStatusUpdated: (updated: Payment) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ActionConfig {
  label: string;
  newStatus: "COMPLETED" | "FAILED" | "PENDING" | "REVERSED";
  className: string;
}

function getActions(status: Payment["status"]): ActionConfig[] {
  switch (status) {
    case "PENDING":
      return [
        {
          label: "Approve",
          newStatus: "COMPLETED",
          className: "bg-green-600 hover:bg-green-700 text-white",
        },
        {
          label: "Deny",
          newStatus: "FAILED",
          className: "bg-red-500 hover:bg-red-600 text-white",
        },
      ];
    case "COMPLETED":
      return [
        {
          label: "Reverse",
          newStatus: "REVERSED",
          className: "bg-purple-600 hover:bg-purple-700 text-white",
        },
      ];
    case "FAILED":
      return [
        {
          label: "Try Again",
          newStatus: "PENDING",
          className: "bg-blue-600 hover:bg-blue-700 text-white",
        },
      ];
    case "REVERSED":
      return [];
  }
}

const STATUS_DESCRIPTIONS: Record<Payment["status"], string> = {
  PENDING: "Awaiting review and approval.",
  COMPLETED: "This payment has been successfully processed.",
  FAILED: "This payment failed to process.",
  REVERSED: "This payment has been reversed. No further actions available.",
};

export default function TransactionDetailsModal({
  payment,
  onClose,
  onStatusUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ActionConfig | null>(null);

  if (!payment) return null;

  const actions = getActions(payment.status);

  async function executeAction(action: ActionConfig) {
    setLoading(true);
    try {
      const updated = await updatePaymentStatus(
        payment!.transactionId,
        action.newStatus,
      );
      onStatusUpdated(updated);
      onClose();
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-gray-900 text-base">
              Transaction Details
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {payment.transactionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div
          className={`px-6 py-3 text-xs font-medium text-white ${statusBadgeClass(payment.status)}`}
        >
          {STATUS_DESCRIPTIONS[payment.status]}
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                Sender
              </p>
              <p className="font-semibold text-gray-800">
                {payment.senderName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                Recipient
              </p>
              <p className="font-semibold text-gray-800">
                {payment.recipientName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                Amount
              </p>
              <p className="font-semibold text-gray-800">
                {payment.currency} $
                {payment.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                Status
              </p>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-white text-xs font-semibold ${statusBadgeClass(payment.status)}`}
              >
                {payment.status}
              </span>
            </div>
            {payment.referenceNote && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                  Reference Note
                </p>
                <p className="font-semibold text-gray-800">
                  {payment.referenceNote}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                Created
              </p>
              <p className="text-xs text-gray-600">
                {formatDate(payment.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                Updated
              </p>
              <p className="text-xs text-gray-600">
                {formatDate(payment.updatedAt)}
              </p>
            </div>
          </div>

          {payment.riskFlag && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-xs text-red-600 font-medium">
              ⚠ Risk flag detected on this transaction
            </div>
          )}
        </div>

        {actions.length > 0 && (
          <div className="px-6 pb-6">
            <div className="border-t pt-4">
              {confirmAction ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Are you sure you want to{" "}
                    <span className="font-semibold">{confirmAction.label}</span>{" "}
                    this payment?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => executeAction(confirmAction)}
                      disabled={loading}
                      className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${confirmAction.className}`}
                    >
                      {loading
                        ? "Processing..."
                        : `Confirm ${confirmAction.label}`}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setConfirmAction(action)}
                      className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${action.className}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {payment.status === "REVERSED" && (
          <div className="px-6 pb-6">
            <div className="border-t pt-4 text-center text-xs text-gray-400">
              No further actions available for reversed payments.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
