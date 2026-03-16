import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import SendPayment from "@/pages/SendPayment";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f0f4f8]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<SendPayment />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
