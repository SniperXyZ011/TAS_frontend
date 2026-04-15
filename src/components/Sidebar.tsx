import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  ArrowLeftRight,
  LogOut,
  Shield,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/nodes", icon: Server, label: "Nodes" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-[264px] flex flex-col border-r z-40 transform transition-transform duration-300 lg:static lg:h-screen lg:shrink-0 lg:translate-x-0 lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
        }}
        id="sidebar"
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-5 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg animate-pulse-glow"
              style={{ background: "var(--color-accent)", color: "#0a0e14" }}
            >
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1
                className="text-sm font-bold tracking-wide"
                style={{ color: "var(--color-text-primary)" }}
              >
                TAS
              </h1>
              <p
                className="text-[0.65rem] font-medium uppercase tracking-widest"
                style={{ color: "var(--color-text-muted)" }}
              >
                Admin Panel
              </p>
            </div>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-md"
            style={{ color: "var(--color-text-muted)" }}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={`nav-${item.label.toLowerCase()}`}
                onClick={handleNavClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: isActive
                    ? "var(--color-accent-muted)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                  border: isActive
                    ? "1px solid var(--color-border-glow)"
                    : "1px solid transparent",
                }}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className="px-3 py-4 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={handleLogout}
            id="btn-logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all duration-200"
            style={{ color: "var(--color-danger)" }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
