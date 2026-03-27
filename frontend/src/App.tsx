import AdminLensBar from "@/components/AdminLensBar";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DemoSessionProvider } from "@/context/DemoSessionContext";
import Dashboard from "@/pages/Dashboard";
import SendPayment from "@/pages/SendPayment";
import SettingsPage from "@/pages/SettingsPage";
import UsersPage from "@/pages/UsersPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CreateUserPage from "./pages/CreateUserPage";

function AppShell() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center text-gray-500">
        Loading demo session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <AdminLensBar />
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/payments" replace />} />
        <Route path="/payments" element={<Dashboard />} />
        <Route path="/make-payment" element={<SendPayment />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/create-user" element={<CreateUserPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoSessionProvider>
          <AppShell />
        </DemoSessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
