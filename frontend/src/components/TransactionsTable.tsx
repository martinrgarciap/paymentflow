import type { Payment, PaymentStatus } from '@/types/payment'

export function statusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case 'PENDING':   return 'bg-orange-400'
    case 'COMPLETED': return 'bg-green-500'
    case 'FLAGGED':   return 'bg-red-500'
    case 'FAILED':    return 'bg-red-400'
    case 'REVERSED':  return 'bg-blue-400'
  }
}

interface Props {
  payments: Payment[]
  selected: Payment | null
  onSelect: (p: Payment) => void
}

export default function TransactionsTable({ payments, selected, onSelect }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {['Transaction ID', 'Sender', 'Recipient', 'Amount', 'Status', 'Action'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">No transactions found</td>
            </tr>
          ) : payments.map(p => (
            <tr
              key={p.transactionId}
              onClick={() => onSelect(p)}
              className={`border-b hover:bg-gray-50 cursor-pointer transition-colors
                ${selected?.transactionId === p.transactionId ? 'bg-blue-50' : ''}`}
            >
              <td className="px-4 py-3 text-blue-600 font-medium">{p.transactionId}</td>
              <td className="px-4 py-3 text-gray-700">{p.senderName}</td>
              <td className="px-4 py-3 text-gray-700">{p.recipientName}</td>
              <td className="px-4 py-3 text-gray-700">
                {p.currency} ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3">
                <span className={`px-3 py-1 rounded text-white text-xs font-semibold ${statusBadgeClass(p.status)}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                {p.status === 'PENDING' && (
                  <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded">
                    Review
                  </button>
                )}
                {p.status === 'FLAGGED' && (
                  <button className="bg-orange-400 hover:bg-orange-500 text-white text-xs px-3 py-1 rounded">
                    Review
                  </button>
                )}
                {['COMPLETED', 'FAILED', 'REVERSED'].includes(p.status) && (
                  <button className="bg-gray-400 hover:bg-gray-500 text-white text-xs px-3 py-1 rounded">
                    Details
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}