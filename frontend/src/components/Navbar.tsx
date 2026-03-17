import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-[#1e3a5f] text-white px-8 py-0 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2 font-bold text-lg py-4">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-black shadow-md">
            P
          </div>
          <span className="tracking-tight">PaymentFlow</span>
        </div>

        <div className="flex h-full">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors duration-150
               ${
                 isActive
                   ? "border-blue-400 text-white"
                   : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
               }`
            }
          >
            <span>⊞</span> Dashboard
          </NavLink>
          <NavLink
            to="/send"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors duration-150
               ${
                 isActive
                   ? "border-blue-400 text-white"
                   : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
               }`
            }
          >
            <span>↗</span> Send Payment
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
