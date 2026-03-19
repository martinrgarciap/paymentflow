import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1e3a5f] text-white shadow-lg">
      <div className="px-6 py-0 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg py-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-black shadow-md">
            P
          </div>
          <span className="tracking-tight">PaymentFlow</span>
        </div>

        <div className="hidden md:flex h-full">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors duration-150
               ${isActive ? "border-blue-400 text-white" : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"}`
            }
          >
            <span>⊞</span> Dashboard
          </NavLink>
          <NavLink
            to="/send"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors duration-150
               ${isActive ? "border-blue-400 text-white" : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"}`
            }
          >
            <span>↗</span> Send Payment
          </NavLink>
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span
            className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10">
          <NavLink
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors
               ${isActive ? "bg-white/10 border-l-4 border-blue-400 text-white" : "text-gray-300 hover:bg-white/5"}`
            }
          >
            <span>⊞</span> Dashboard
          </NavLink>
          <NavLink
            to="/send"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors
               ${isActive ? "bg-white/10 border-l-4 border-blue-400 text-white" : "text-gray-300 hover:bg-white/5"}`
            }
          >
            <span>↗</span> Send Payment
          </NavLink>
        </div>
      )}
    </nav>
  );
}
