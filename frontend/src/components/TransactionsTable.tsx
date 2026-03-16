import type { Payment, PaymentStatus } from "@/types/payment";

export function statusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-orange-400";
    case "COMPLETED":
      return "bg-green-500";
    case "FLAGGED":
      return "bg-red-500";
    case "FAILED":
      return "bg-red-400";
    case "REVERSED":
      return "bg-blue-400";
  }
}

interface Props {
  payments: Payment[];
  selected: Payment | null;
  onSelect: (p: Payment) => void;
}

export default function TransactionsTable({
  payments,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {[
              "Transaction ID",
              "Sender",
              "Recipient",
              "Amount",
              "Status",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 font-semibold text-gray-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr
              key={p.transactionId}
              className={`border-b hover:bg-gray-50 cursor-pointer ${selected?.transactionId === p.transactionId ? "bg-blue-50" : ""}`}
              onClick={() => onSelect(p)}
            >
              <td className="px-4 py-3 text-blue-600 font-medium">
                {p.transactionId}
              </td>
              <td className="px-4 py-3 text-gray-700">{p.senderName}</td>
              <td className="px-4 py-3 text-gray-700">{p.recipientName}</td>
              <td className="px-4 py-3 text-gray-700">
                $
                {p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 rounded text-white text-xs font-semibold ${statusBadgeClass(p.status)}`}
                >
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded">
                    View
                  </button>
                  {p.status === "PENDING" && (
                    <button className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded">
                      Approve
                    </button>
                  )}
                  {p.status === "FLAGGED" && (
                    <button className="bg-blue-400 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded">
                      Review
                    </button>
                  )}
                  {["Completed", "Failed", "Reversed"].includes(p.status) && (
                    <button className="bg-gray-400 hover:bg-gray-500 text-white text-xs px-3 py-1 rounded">
                      Details
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
