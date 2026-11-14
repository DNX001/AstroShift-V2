import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AstroBotDrawer from "../AstroBotDrawer";
import { ObservationProvider } from "../../context/ObservationContext.jsx";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppShellContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [astroBotDraft, setAstroBotDraft] = useState("");
  const { pathname } = useLocation();
  const isAstroBotRoute = pathname === "/astrobot";

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setMobileMenuOpen((previous) => !previous);
  }

  return (
    <div className="min-h-screen bg-[#070b10] text-[#edf4f7]">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onNavigate={closeMobileMenu}
      />

      <div className="min-h-screen lg:pl-[264px]">
        <Topbar onMenuClick={toggleMobileMenu} />

        <main className="mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1800px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          <Outlet context={{ setAstroBotDraft }} />

          <div className={isAstroBotRoute ? "mt-8" : ""}>
            <AstroBotDrawer
              mode={isAstroBotRoute ? "workspace" : "drawer"}
              draft={astroBotDraft}
              onDraftChange={setAstroBotDraft}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <ObservationProvider>
      <AppShellContent />
    </ObservationProvider>
  );
}
