import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Info,
  LayoutDashboard,
  Microscope,
  Search,
  Telescope,
  X,
} from "lucide-react";

const navigationGroups = [
  {
    label: "MISSION",
    items: [
      { label: "Mission Control", to: "/", icon: LayoutDashboard, end: true },
      { label: "Target Explorer", to: "/targets", icon: Search },
    ],
  },
  {
    label: "OBSERVATION",
    items: [{ label: "Observatory", to: "/observatory", icon: Telescope }],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { label: "Science Lab", to: "/science", icon: Microscope },
      { label: "AstroBot", to: "/astrobot", icon: Bot, badge: "AI" },
    ],
  },
  {
    label: "ABOUT",
    items: [{ label: "About AstroShift", to: "/about", icon: Info }],
  },
];

export default function Sidebar({ mobileOpen = false, onNavigate = () => {} }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onNavigate}
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="astroshift-sidebar"
        aria-label="AstroShift workspace navigation"
        className={`app-sidebar app-sidebar-scroll fixed inset-y-0 left-0 z-50 flex max-h-[100dvh] flex-col overflow-y-auto px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-1">
          <Link
            to="/"
            onClick={onNavigate}
            className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-offset-4"
            aria-label="AstroShift Mission Control"
          >
            <div className="app-brand-mark overflow-hidden">
              <img
                src="/brand/astroshift-symbol.png"
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[17px] font-bold tracking-[0.15em] text-[#edf4f7]">
                ASTROSHIFT
              </h1>
              <p className="mt-0.5 font-mono text-[8px] tracking-[0.2em] text-[#718795]">
                DEEP-SKY INTELLIGENCE
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="app-context-card mt-8">
          <div className="flex items-center gap-2">
            <Activity size={13} className="text-[#8ce7f5]" />
            <span className="font-mono text-[9px] font-medium tracking-[0.17em] text-[#91a5b2]">
              RESEARCH WORKSPACE
            </span>
          </div>
          <p className="mt-2.5 text-[13px] font-semibold tracking-wide text-[#e5eef2]">
            SPHEREx Mission
          </p>
          <p className="mt-1 text-[11px] leading-5 text-[#758996]">
            Astronomy intelligence platform
          </p>
        </div>

        <nav aria-label="Main navigation" className="mt-8 flex-1 space-y-7">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="app-eyebrow mb-2.5 px-3 text-[9px]">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) => `app-nav-link ${isActive ? "is-active" : ""}`}
                    >
                      {({ isActive }) => (
                        <>
                          <span className="flex min-w-0 items-center gap-3">
                            <Icon
                              size={17}
                              strokeWidth={1.8}
                              className={isActive ? "text-[#8ce7f5]" : "text-[#738896]"}
                            />
                            <span className="truncate text-[12px] font-semibold tracking-[0.01em]">
                              {item.label}
                            </span>
                          </span>
                          {item.badge && (
                            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/[0.07] px-1.5 py-0.5 font-mono text-[8px] tracking-wider text-[#8ce7f5]">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-7 border-t border-white/[0.07] pt-5">
          <Link to="/cosmos-preview" onClick={onNavigate} className="app-launch-card group">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cyan-200/15 bg-cyan-200/[0.07]">
              <img src="/brand/astroshift-favicon-48.png" alt="" aria-hidden="true" className="h-full w-full object-contain" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[8px] tracking-[0.15em] text-[#7e9aa6]">
                IMMERSIVE EXPERIENCE
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-[#dcecf1]">
                Enter the cosmos
              </span>
            </span>
            <ArrowUpRight size={15} className="shrink-0 text-[#718795] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#8ce7f5]" />
          </Link>

          <div className="mt-5 px-1.5">
            <p className="font-mono text-[8px] tracking-[0.17em] text-[#8ba2ae]">EXPOLORANGERS</p>
            <p className="mt-1 text-[10px] text-[#718795]">AstroShift project team</p>
          </div>
        </div>
      </aside>
    </>
  );
}
