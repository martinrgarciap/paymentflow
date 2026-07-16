import AdminLensBar from "@/components/AdminLensBar";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DemoSessionProvider } from "@/context/DemoSessionContext";
import DashboardPage from "@/pages/DashboardPage";
import HomePage from "@/pages/HomePage";
import SendPaymentPage from "@/pages/SendPaymentPage";
import SettingsPage from "@/pages/SettingsPage";
import UsersPage from "@/pages/UsersPage";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import CreateUserPage from "./pages/CreateUserPage";

function AppShell() {
  const { loading } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  if (loading && !isHomePage) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center text-gray-500">
        Loading demo session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {!isHomePage && <AdminLensBar />}
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/payments" element={<DashboardPage />} />
        <Route path="/make-payment" element={<SendPaymentPage />} />
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
