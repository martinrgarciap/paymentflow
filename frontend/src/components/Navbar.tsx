import { useDemoSession } from "@/context/DemoSessionContext";
import {
  ExternalLink,
  Github,
  Home,
  LayoutDashboard,
  Menu,
  Send,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const GITHUB_URL = "https://github.com/martinrgarciap/paymentflow";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdminView } = useDemoSession();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const consoleNavItems: NavItem[] = isAdminView
    ? [
        { to: "/", label: "Home", icon: Home },
        { to: "/payments", label: "Payments", icon: LayoutDashboard },
        { to: "/make-payment", label: "Make Payment", icon: Send },
        { to: "/users", label: "Users", icon: Users },
        { to: "/create-user", label: "Create User", icon: UserPlus },
      ]
    : [
        { to: "/", label: "Home", icon: Home },
        { to: "/payments", label: "Payments", icon: LayoutDashboard },
        { to: "/make-payment", label: "Make Payment", icon: Send },
        { to: "/settings", label: "Settings", icon: Settings },
      ];

  const navItems: NavItem[] = isHomePage
    ? [
        { to: "/", label: "Home", icon: Home },
        {
          to: "/payments",
          label: "Payment Console",
          icon: LayoutDashboard,
        },
      ]
    : consoleNavItems;

  return (
    <nav className="bg-[#1e3a5f] text-white shadow-lg">
      <div className="px-6 py-0 flex items-center justify-between">
        <Link
          to="/"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="flex items-center gap-2 font-bold text-lg py-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-black shadow-md">
              P
            </div>
            <span className="tracking-tight">PaymentFlow</span>
          </div>
        </Link>

        <div className="hidden md:flex h-full">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  isActive
                    ? "border-blue-400 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                }`
              }
            >
              <Icon size={15} /> {label}
            </NavLink>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 border-b-2 border-transparent px-4 py-4 text-sm font-medium text-gray-400 transition-colors duration-150 hover:border-gray-500 hover:text-gray-200"
          >
            <Github size={15} /> GitHub <ExternalLink size={12} />
          </a>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 border-l-4 border-blue-400 text-white"
                    : "text-gray-300 hover:bg-white/5"
                }`
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
          >
            <Github size={17} /> GitHub <ExternalLink size={13} />
          </a>
        </div>
      )}
    </nav>
  );
}
