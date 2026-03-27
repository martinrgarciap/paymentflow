import type { User } from "@/types/user";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type ViewMode = "admin" | "user";

interface DemoSessionContextValue {
  viewMode: ViewMode;
  selectedUser: User | null;
  viewAsUser: (user: User) => void;
  viewAsAdmin: () => void;
  refreshSelectedUser: (user: User) => void;
  isAdminView: boolean;
  isUserView: boolean;
}

const DemoSessionContext = createContext<DemoSessionContextValue | undefined>(
  undefined,
);

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("admin");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  function viewAsUser(user: User) {
    setSelectedUser(user);
    setViewMode("user");
  }

  function viewAsAdmin() {
    setSelectedUser(null);
    setViewMode("admin");
  }

  function refreshSelectedUser(user: User) {
    setSelectedUser(user);
  }

  const value = useMemo(
    () => ({
      viewMode,
      selectedUser,
      viewAsUser,
      viewAsAdmin,
      refreshSelectedUser,
      isAdminView: viewMode === "admin",
      isUserView: viewMode === "user",
    }),
    [viewMode, selectedUser],
  );

  return (
    <DemoSessionContext.Provider value={value}>
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext);

  if (!context) {
    throw new Error("useDemoSession must be used within DemoSessionProvider");
  }

  return context;
}
