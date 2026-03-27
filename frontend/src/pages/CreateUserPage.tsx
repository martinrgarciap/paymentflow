import { signupUser } from "@/services/authService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type Stage = "form" | "confirm";
type ModalState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

export default function CreateUserPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  function setField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required";

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm the password";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleReview() {
    if (validate()) {
      setStage("confirm");
    }
  }

  async function handleConfirm() {
    setSubmitting(true);

    try {
      await signupUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setModal({
        type: "success",
        message: "User created successfully.",
      });
      setStage("form");
      setForm(EMPTY);
      setErrors({});
    } catch (error: any) {
      setModal({
        type: "error",
        message: error.message ?? "Failed to create user.",
      });
      setStage("form");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="max-w-lg mx-auto px-4 pt-10 pb-16">
        <div className="mb-6">
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              color: "#111827",
              lineHeight: 1.2,
              marginBottom: "0.375rem",
            }}
          >
            {stage === "form" ? "Create User" : "Confirm User Details"}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {stage === "form"
              ? "Create a new PaymentFlow user account."
              : "Please review the user details before confirming."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-1.5 bg-linear-to-r from-blue-500 via-blue-400 to-indigo-500" />

          {stage === "form" && (
            <div className="p-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    First Name
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    placeholder="Enter first name"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                      ${
                        errors.firstName
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Last Name
                  </label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    placeholder="Enter last name"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                      ${
                        errors.lastName
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="Enter email"
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                    ${
                      errors.email
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="Enter password"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                      ${
                        errors.password
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setField("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter password"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                      ${
                        errors.confirmPassword
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-800">
                New users will receive the system default starting balance and
                signup bonus configured by the backend.
              </div>

              <button
                onClick={handleReview}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700
                           hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all
                           shadow-sm hover:shadow-md text-sm tracking-wide"
              >
                Review User →
              </button>
            </div>
          )}

          {stage === "confirm" && (
            <div className="p-8 space-y-5">
              <div className="space-y-0 border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    First Name
                  </span>
                  <span className="font-semibold text-gray-800">
                    {form.firstName}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    Last Name
                  </span>
                  <span className="font-semibold text-gray-800">
                    {form.lastName}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    Email
                  </span>
                  <span className="font-semibold text-gray-800">
                    {form.email}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-white">
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    Password
                  </span>
                  <span className="font-semibold text-gray-800">
                    {"•".repeat(form.password.length)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStage("form")}
                  disabled={submitting}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium
                             py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  ← Go Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700
                             hover:to-blue-800 disabled:opacity-60 text-white font-semibold py-3
                             rounded-lg transition-all shadow-sm text-sm"
                >
                  {submitting ? "Creating..." : "Confirm & Create →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {modal.type === "success" ? (
              <>
                <div className="bg-linear-to-br from-green-500 to-emerald-600 px-8 py-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-3xl">✓</span>
                  </div>
                  <h2 className="text-white font-black text-xl">
                    User Created
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Account created successfully
                  </p>
                </div>
                <div className="px-6 py-5">
                  <p className="text-gray-600 text-sm text-center">
                    {modal.message}
                  </p>
                </div>
                <div className="px-6 pb-6 flex gap-2">
                  <button
                    onClick={() => {
                      setModal(null);
                      setForm(EMPTY);
                    }}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Create Another
                  </button>
                  <button
                    onClick={() => navigate("/users")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Go to Users
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
                    Create User Failed
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-gray-600 text-sm text-center">
                    {modal.message}
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setModal(null)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Close
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
