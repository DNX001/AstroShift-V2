
import { useLocation } from "react-router-dom";
import { ChevronRight, Menu, Orbit } from "lucide-react";

const pageTitles = {
  "/": "Mission Control",
  "/targets": "Target Explorer",
  "/observatory": "Observatory",
  "/science": "Science Lab",
  "/astrobot": "AstroBot",
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();

  const pageTitle = pageTitles[pathname] ?? "Mission Workspace";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0a1119]/85 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        {/* Mobile navigation trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-[#a7b7c2] transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.06] hover:text-[#8ce7f5] lg:hidden"
        >
          <Menu size={19} />
        </button>

        {/* Breadcrumb and page title */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-[9px] font-medium tracking-[0.16em] text-[#718795] sm:text-[10px]">
            <span>ASTROSHIFT</span>
            <ChevronRight size={11} />
            <span className="truncate">WORKSPACE</span>
          </div>

          <h2 className="mt-1 truncate font-display text-lg font-semibold tracking-tight text-[#edf4f7] sm:text-xl">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Workspace identity */}
      <div className="ml-3 flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
        <Orbit size={15} className="text-[#8ce7f5]" />

        <span className="hidden font-mono text-[9px] tracking-[0.13em] text-[#91a5b2] sm:inline">
          DEEP-SKY INTELLIGENCE
        </span>

        <span className="font-mono text-[9px] text-[#8ce7f5] sm:hidden">
          DNX
        </span>
      </div>
    </header>
  );
}
