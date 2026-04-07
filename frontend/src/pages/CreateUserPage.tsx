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

type FormErrors = Partial<Record<keyof FormState, string>>;
type Stage = "form" | "confirm";
type ModalState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function validateCreateUserForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!form.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Enter a valid email";
  }

  if (!form.password.trim()) {
    errors.password = "Password is required";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!form.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm the password";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

function maskPassword(password: string): string {
  return "•".repeat(password.length);
}

export default function CreateUserPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setErrors({});
    setStage("form");
  }

  function handleReview() {
    const nextErrors = validateCreateUserForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setStage("confirm");
    }
  }

  async function handleConfirm() {
    const nextErrors = validateCreateUserForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStage("form");
      return;
    }

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

      resetForm();
    } catch (error: unknown) {
      setModal({
        type: "error",
        message: getErrorMessage(error, "Failed to create user."),
      });
      setStage("form");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="mx-auto max-w-lg px-4 pb-16 pt-10">
        <div className="mb-6">
          <div className="text-[1.75rem] font-black leading-tight text-gray-900">
            {stage === "form" ? "Create User" : "Confirm User Details"}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {stage === "form"
              ? "Create a new PaymentFlow user account."
              : "Please review the user details before confirming."}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-1.5 bg-linear-to-r from-blue-500 via-blue-400 to-indigo-500" />

          {stage === "form" && (
            <div className="space-y-5 p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    First Name
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    placeholder="Enter first name"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Last Name
                  </label>
                  <input
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    placeholder="Enter last name"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="Enter email"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="Enter password"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                      errors.password
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    placeholder="Re-enter password"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                New users will receive the system default starting balance and
                signup bonus configured by the backend.
              </div>

              <button
                onClick={handleReview}
                className="w-full rounded-lg bg-linear-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold tracking-wide text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-md"
              >
                Review User →
              </button>
            </div>
          )}

          {stage === "confirm" && (
            <div className="space-y-5 p-8">
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    First Name
                  </span>
                  <span className="font-semibold text-gray-800">
                    {form.firstName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Last Name
                  </span>
                  <span className="font-semibold text-gray-800">
                    {form.lastName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Email
                  </span>
                  <span className="font-semibold text-gray-800">
                    {form.email}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Password
                  </span>
                  <span className="font-semibold text-gray-800">
                    {maskPassword(form.password)}
                  </span>
                </div>
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
                  {submitting ? "Creating..." : "Confirm & Create →"}
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
                <div className="bg-linear-to-br from-green-500 to-emerald-600 px-8 py-8 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <span className="text-3xl text-white">✓</span>
                  </div>
                  <h2 className="text-xl font-black text-white">
                    User Created
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    Account created successfully
                  </p>
                </div>

                <div className="px-6 py-5">
                  <p className="text-center text-sm text-gray-600">
                    {modal.message}
                  </p>
                </div>

                <div className="flex gap-2 px-6 pb-6">
                  <button
                    onClick={() => {
                      setModal(null);
                      resetForm();
                    }}
                    className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Create Another
                  </button>

                  <button
                    onClick={() => navigate("/users")}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Go to Users
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
                    Create User Failed
                  </h2>
                </div>

                <div className="px-6 py-5">
                  <p className="text-center text-sm text-gray-600">
                    {modal.message}
                  </p>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => setModal(null)}
                    className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
