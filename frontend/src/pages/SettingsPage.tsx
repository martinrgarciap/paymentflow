import { useDemoSession } from "@/context/DemoSessionContext";
import { updateUser } from "@/services/userService";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { selectedUser, isUserView, refreshSelectedUser } = useDemoSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedUser) return;

    setFirstName(selectedUser.firstName ?? "");
    setLastName(selectedUser.lastName ?? "");
    setMessage("");
    setError("");
  }, [selectedUser?.id]);

  async function handleSave() {
    if (!selectedUser) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setError("Please enter both a first and last name");
      setMessage("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated = await updateUser(selectedUser.id, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      });

      refreshSelectedUser(updated);
      setMessage("Settings updated successfully.");
    } catch {
      setError("Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  if (!isUserView || !selectedUser) {
    return (
      <div className="bg-[#f0f4f8] p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto">
          <div className="text-2xl font-black text-gray-900">Settings</div>
          <p className="text-sm text-gray-500 mt-2">
            Switch to a user lens view to see account settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f4f8] p-6 space-y-4">
      <div className="flex flex-col gap-1">
        <div className="text-3xl font-black text-gray-900">
          Account Settings
        </div>
        <p className="text-sm text-gray-500">
          Update this user’s profile details.
        </p>
      </div>

      <div className="mx-auto max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-blue-500 via-blue-400 to-indigo-500" />

        <div className="p-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setError("");
                  setMessage("");
                }}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setError("");
                  setMessage("");
                }}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              value={selectedUser.email}
              readOnly
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Current Balance
            </label>
            <input
              value={`$${selectedUser.balance.toLocaleString("en-CA", {
                minimumFractionDigits: 2,
              })}`}
              readOnly
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
            />
          </div>

          {message && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
