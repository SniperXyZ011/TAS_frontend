import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen app-shell" style={{ background: "var(--color-bg-primary)" }}>
      <div className="lg:flex lg:min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="min-w-0 flex-1 lg:flex lg:flex-col">
          <header
            className="sticky top-0 z-20 lg:hidden flex items-center justify-between px-4 py-3 border-b"
            style={{
              background:
                "color-mix(in srgb, var(--color-bg-primary) 86%, transparent)",
              borderColor: "var(--color-border)",
              backdropFilter: "blur(8px)",
            }}
          >
            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                TAS Admin
              </p>
            </div>
          </header>

          <main className="min-h-screen p-4 sm:p-6 lg:p-8" id="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
