import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <Sidebar />
      <main
        className="ml-[240px] p-8 min-h-screen"
        id="main-content"
      >
        <Outlet />
      </main>
    </div>
  );
}
