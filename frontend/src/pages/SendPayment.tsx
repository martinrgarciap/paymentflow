import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPayment } from "@/services/paymentService";
import type { Payment } from "@/types/payment";

const CURRENCIES = ["CAD", "USD", "EUR", "GBP"];

interface FormState {
  senderName: string;
  recipientName: string;
  amount: string;
  currency: string;
  referenceNote: string;
}

const EMPTY: FormState = {
  senderName: "",
  recipientName: "",
  amount: "",
  currency: "CAD",
  referenceNote: "",
};

type ModalState =
  | { type: "success"; payment: Payment }
  | { type: "error"; message: string }
  | null;

export default function SendPayment() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.senderName.trim()) e.senderName = "Sender name is required";
    if (!form.recipientName.trim())
      e.recipientName = "Recipient name is required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payment = await createPayment({
        senderName: form.senderName.trim(),
        recipientName: form.recipientName.trim(),
        amount: Number(form.amount),
        currency: form.currency,
        referenceNote: form.referenceNote.trim() || undefined,
      });
      setModal({ type: "success", payment });
    } catch (err: any) {
      setModal({
        type: "error",
        message: err.message ?? "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleSendAnother() {
    setForm(EMPTY);
    setErrors({});
    setModal(null);
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Send a Payment
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details below to initiate a transfer
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-1.5 bg-linear-to-r from-blue-500 via-blue-400 to-indigo-500" />

          <div className="p-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Sender Name
              </label>
              <input
                value={form.senderName}
                onChange={(e) => set("senderName", e.target.value)}
                placeholder="e.g. John Smith"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                  ${errors.senderName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
              />
              {errors.senderName && (
                <p className="text-red-500 text-xs mt-1">{errors.senderName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Recipient Name
              </label>
              <input
                value={form.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
                placeholder="e.g. Alice Wong"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                  ${errors.recipientName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
              />
              {errors.recipientName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.recipientName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Amount
              </label>
              <div className="flex gap-2">
                <select
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  className="border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2.5 text-sm
                             text-gray-800 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  placeholder="0.00"
                  className={`flex-1 border rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                    ${errors.amount ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Reference Note{" "}
                <span className="text-gray-400 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                value={form.referenceNote}
                onChange={(e) => set("referenceNote", e.target.value)}
                placeholder="e.g. Invoice payment, Monthly rent..."
                rows={3}
                className="w-full border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2.5
                           text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition-all resize-none"
              />
            </div>

            {form.senderName && form.recipientName && form.amount && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-800">
                <span className="font-semibold">{form.senderName}</span>
                <span className="text-blue-400 mx-2">→</span>
                <span className="font-semibold">{form.recipientName}</span>
                <span className="ml-2 text-blue-500">
                  {form.currency} $
                  {Number(form.amount || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                         disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg
                         transition-all shadow-sm hover:shadow-md text-sm tracking-wide"
            >
              {submitting ? "Sending..." : "Send Payment →"}
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in">
            {modal.type === "success" ? (
              <>
                <div className="bg-linear-to-br from-green-500 to-emerald-600 px-8 py-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-3xl">✓</span>
                  </div>
                  <h2 className="text-white font-black text-xl">
                    Payment Sent!
                  </h2>
                  <p className="text-green-100 text-sm mt-1">
                    Transaction created successfully
                  </p>
                </div>

                <div className="px-6 py-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono font-semibold text-gray-800 text-xs">
                      {modal.payment.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">From</span>
                    <span className="font-semibold text-gray-800">
                      {modal.payment.senderName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">To</span>
                    <span className="font-semibold text-gray-800">
                      {modal.payment.recipientName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-gray-800">
                      {modal.payment.currency} $
                      {modal.payment.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      {modal.payment.status}
                    </span>
                  </div>
                </div>

                <div className="px-6 pb-6 flex gap-2">
                  <button
                    onClick={handleSendAnother}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Send Another
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-linear-to-br from-red-500 to-rose-600 px-8 py-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-3xl">✕</span>
                  </div>
                  <h2 className="text-white font-black text-xl">
                    Payment Failed
                  </h2>
                  <p className="text-red-100 text-sm mt-1">
                    Something went wrong
                  </p>
                </div>

                <div className="px-6 py-5">
                  <p className="text-gray-600 text-sm text-center">
                    {modal.message}
                  </p>
                </div>

                <div className="px-6 pb-6 flex gap-2">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Go to Dashboard
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
