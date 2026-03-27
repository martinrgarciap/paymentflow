import { useDemoSession } from "@/context/DemoSessionContext";
import { fetchUserById, fetchUsers, searchUsers } from "@/services/userService";
import type { User, UserSearchResult } from "@/types/user";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLensBar() {
  const { selectedUser, viewAsUser, viewAsAdmin, isAdminView } =
    useDemoSession();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectingUserId, setSelectingUserId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers(false);
        setActiveUsers(data);
      } catch {
        setActiveUsers([]);
      }
    }

    loadUsers();

    window.addEventListener("focus", loadUsers);
    return () => window.removeEventListener("focus", loadUsers);
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const stillExists = activeUsers.some((user) => user.id === selectedUser.id);

    if (!stillExists) {
      viewAsAdmin();
    }
  }, [activeUsers, selectedUser, viewAsAdmin]);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || !showDropdown) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await searchUsers(trimmed);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, showDropdown]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayResults = useMemo(() => {
    return searchResults.map((user) => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    }));
  }, [searchResults]);

  async function handleSelectUser(user: UserSearchResult) {
    try {
      setSelectingUserId(user.id);

      const fullUser = await fetchUserById(user.id);
      viewAsUser(fullUser);

      setQuery("");
      setSearchResults([]);
      setShowDropdown(false);
      navigate("/payments");
    } catch {
      // ignore for now
    } finally {
      setSelectingUserId(null);
    }
  }

  return (
    <div className="bg-slate-900 text-white border-b border-white/10">
      <div className="px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-blue-300 font-semibold">
            Admin Lens
          </span>
          <span className="text-sm text-white/90">
            {isAdminView
              ? "Viewing as Admin"
              : `Viewing as ${selectedUser?.fullName ?? "User"}`}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
          <div ref={containerRef} className="relative w-full md:w-80">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (query.trim()) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Search users by name..."
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:border-blue-400"
            />

            {showDropdown && query.trim().length > 0 && (
              <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 shadow-xl overflow-hidden">
                {searching ? (
                  <div className="px-3 py-3 text-sm text-slate-300">
                    Searching users...
                  </div>
                ) : displayResults.length > 0 ? (
                  displayResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      disabled={selectingUserId === user.id}
                      className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 disabled:opacity-60"
                    >
                      <div className="text-sm font-medium text-white">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-slate-300">
                        {selectingUserId === user.id
                          ? "Loading user..."
                          : user.email}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-sm text-slate-300">
                    No active users found.
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              viewAsAdmin();
              navigate("/payments");
            }}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium transition-colors"
          >
            View as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
