import { useDemoSession } from "@/context/DemoSessionContext";
import { updateUser } from "@/services/userService";
import { useEffect, useMemo, useState } from "react";

interface SettingsFormState {
  firstName: string;
  lastName: string;
}

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

const EMPTY_FORM: SettingsFormState = {
  firstName: "",
  lastName: "",
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SettingsPage() {
  const { selectedUser, isUserView, refreshSelectedUser } = useDemoSession();

  const [form, setForm] = useState<SettingsFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setForm({
      firstName: selectedUser.firstName ?? "",
      lastName: selectedUser.lastName ?? "",
    });

    setFeedback(null);
  }, [selectedUser?.id]);

  const hasChanges = useMemo(() => {
    if (!selectedUser) {
      return false;
    }

    return (
      form.firstName.trim() !== (selectedUser.firstName ?? "") ||
      form.lastName.trim() !== (selectedUser.lastName ?? "")
    );
  }, [form, selectedUser]);

  function updateField<K extends keyof SettingsFormState>(
    field: K,
    value: SettingsFormState[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFeedback(null);
  }

  async function handleSave() {
    if (!selectedUser) {
      return;
    }

    const trimmedFirstName = form.firstName.trim();
    const trimmedLastName = form.lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setFeedback({
        type: "error",
        message: "Please enter both a first and last name",
      });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const updatedUser = await updateUser(selectedUser.id, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      });

      refreshSelectedUser(updatedUser);

      setFeedback({
        type: "success",
        message: "Settings updated successfully.",
      });
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Failed to update settings."),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!isUserView || !selectedUser) {
    return (
      <div className="bg-[#f0f4f8] p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="text-2xl font-black text-gray-900">Settings</div>
          <p className="mt-2 text-sm text-gray-500">
            Switch to a user lens view to see account settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-[#f0f4f8] p-6">
      <div className="flex flex-col gap-1">
        <div className="text-3xl font-black text-gray-900">
          Account Settings
        </div>
        <p className="text-sm text-gray-500">
          Update this user’s profile details.
        </p>
      </div>

      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="h-1.5 bg-linear-to-r from-blue-500 via-blue-400 to-indigo-500" />

        <div className="space-y-5 p-6">
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
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name"
              />
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
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Email
            </label>
            <input
              value={selectedUser.email}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Current Balance
            </label>
            <input
              value={`$${formatCurrency(selectedUser.balance)}`}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
            />
          </div>

          {feedback && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                feedback.type === "success"
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={
                saving ||
                !hasChanges ||
                !form.firstName.trim() ||
                !form.lastName.trim()
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
