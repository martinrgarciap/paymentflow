import { useState } from "react";
import type { Payment } from "@/types/payment";
import { statusBadgeClass } from "./TransactionsTable";
import { updatePaymentStatus } from "@/services/paymentService";

interface Props {
  payment: Payment;
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

export default function TransactionDetails({
  payment,
  onStatusUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleStatusUpdate(status: "COMPLETED" | "FLAGGED") {
    setLoading(true);
    try {
      const updated = await updatePaymentStatus(payment.transactionId, status);
      onStatusUpdated(updated);
    } catch {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  const canApprove =
    payment.status === "PENDING" || payment.status === "FLAGGED";
  const canFlag = payment.status !== "FLAGGED";

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 w-72 shrink-0">
      <h2 className="font-bold text-gray-900 text-base mb-4 border-b pb-2">
        Transaction Details
      </h2>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-500">Txn ID: </span>
          <span className="font-semibold text-gray-800">
            {payment.transactionId}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Sender: </span>
          <span className="font-semibold text-gray-800">
            {payment.senderName}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Recipient: </span>
          <span className="font-semibold text-gray-800">
            {payment.recipientName}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Amount: </span>
          <span className="font-semibold text-gray-800">
            {payment.currency} $
            {payment.amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Note: </span>
          <span className="font-semibold text-gray-800">
            {payment.referenceNote}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Status: </span>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold text-white ${statusBadgeClass(payment.status)}`}
          >
            {payment.status}
          </span>
        </div>
        <div className="pt-2 border-t space-y-1">
          <div>
            <span className="text-gray-400 text-xs">Created: </span>
            <span className="text-xs text-gray-600">
              {formatDate(payment.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Updated: </span>
            <span className="text-xs text-gray-600">
              {formatDate(payment.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {payment.status === "FLAGGED" && (
        <div className="mt-3 text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded">
          ⚠ Risk Alert: High Amount — Requires Review
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button
          disabled={loading || !canApprove}
          onClick={() => handleStatusUpdate("COMPLETED")}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm py-2 rounded font-medium transition-colors"
        >
          Approve
        </button>
        <button
          disabled={loading || !canFlag}
          onClick={() => handleStatusUpdate("FLAGGED")}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm py-2 rounded font-medium transition-colors"
        >
          Flag
        </button>
      </div>
    </div>
  );
}
