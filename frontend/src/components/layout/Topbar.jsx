import { useLocation } from "react-router-dom";
import { ChevronRight, Menu } from "lucide-react";

const pageMeta = {
  "/": { title: "Mission Control", section: "MISSION SYSTEMS" },
  "/targets": { title: "Target Explorer", section: "MISSION SYSTEMS" },
  "/observatory": { title: "Observatory", section: "OBSERVATION" },
  "/science": { title: "Science Lab", section: "INTELLIGENCE" },
  "/astrobot": { title: "AstroBot", section: "INTELLIGENCE" },
  "/about": { title: "About AstroShift", section: "PROJECT & TEAM" },
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const currentPage = pageMeta[pathname] ?? {
    title: "Mission Workspace",
    section: "ASTROSHIFT",
  };

  return (
    <header className="app-topbar">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-controls="astroshift-sidebar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.025] text-[#a7b7c2] transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.06] hover:text-[#8ce7f5] focus-visible:outline-offset-2 lg:hidden"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-[8px] font-medium tracking-[0.17em] text-[#718795] sm:text-[9px]">
            <span>ASTROSHIFT</span>
            <ChevronRight size={10} className="shrink-0 text-[#506673]" />
            <span className="truncate">{currentPage.section}</span>
          </div>
          <h2 className="mt-1 truncate font-display text-[17px] font-semibold tracking-tight text-[#edf4f7] sm:text-[19px]">
            {currentPage.title}
          </h2>
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2">
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-cyan-200/10 bg-cyan-200/[0.045]">
          <img src="/brand/astroshift-favicon-48.png" alt="" aria-hidden="true" className="h-full w-full object-contain" />
        </span>
        <span className="hidden sm:block">
          <span className="block font-mono text-[8px] tracking-[0.14em] text-[#7e929e]">
            DEEP-SKY INTELLIGENCE
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold text-[#c4d2d9]">
            Research workspace
          </span>
        </span>
        <span className="font-mono text-[8px] tracking-[0.12em] text-[#8ce7f5] sm:hidden">
          ASTROSHIFT
        </span>
      </div>
    </header>
  );
}
