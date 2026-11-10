
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setMobileMenuOpen((previous) => !previous);
  }

  return (
    <div className="min-h-screen bg-[#070b10] text-[#edf4f7]">
      {/* Shared navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onNavigate={closeMobileMenu}
      />

      {/* Main workspace */}
      <div className="min-h-screen lg:pl-[264px]">
        <Topbar onMenuClick={toggleMobileMenu} />

        <main className="mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1800px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
