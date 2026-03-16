import type { Payment } from "@/types/payment";
import { statusBadgeClass } from "./TransactionsTable";

interface Props {
  payment: Payment;
}

export default function TransactionDetails({ payment }: Props) {
  const isFlagged = payment.status === "FLAGGED";

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 w-72 shrink-0">
      <h2 className="font-bold text-gray-800 text-base mb-4">
        Transaction Details
      </h2>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-500">Txn ID: </span>
          <span className="font-semibold">{payment.transactionId}</span>
        </div>
        <div>
          <span className="text-gray-500">Sender: </span>
          <span className="font-semibold">{payment.senderName}</span>
        </div>
        <div>
          <span className="text-gray-500">Recipient: </span>
          <span className="font-semibold">{payment.recipientName}</span>
        </div>
        <div>
          <span className="text-gray-500">Amount: </span>
          <span className="font-semibold">
            {payment.currency} $
            {payment.amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Note: </span>
          <span className="font-semibold">{payment.referenceNote}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Status: </span>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold text-white ${statusBadgeClass(payment.status)}`}
          >
            {payment.status}
          </span>
        </div>
      </div>
      {isFlagged && (
        <div className="mt-3 text-xs text-red-500 font-medium">
          ⚠ Risk Alert: High Amount — Requires Review
        </div>
      )}
      <div className="mt-5 flex gap-2">
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded font-medium">
          Approve
        </button>
        <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded font-medium">
          Flag for Review
        </button>
      </div>
    </div>
  );
}
