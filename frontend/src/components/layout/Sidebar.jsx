import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  Bot,
  LayoutDashboard,
  Microscope,
  Orbit,
  Search,
  Telescope,
  X,
} from "lucide-react";

const navigationGroups = [
  {
    label: "MISSION",
    items: [
      {
        label: "Mission Control",
        to: "/",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "Target Explorer",
        to: "/targets",
        icon: Search,
      },
    ],
  },
  {
    label: "OBSERVATION",
    items: [
      {
        label: "Observatory",
        to: "/observatory",
        icon: Telescope,
      },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      {
        label: "Science Lab",
        to: "/science",
        icon: Microscope,
      },
      {
        label: "AstroBot",
        to: "/astrobot",
        icon: Bot,
        badge: "AI",
      },
    ],
  },
];

export default function Sidebar({
  mobileOpen = false,
  onNavigate = () => {},
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onNavigate}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[264px] flex-col
          border-r border-white/[0.07]
          bg-[#091119]/95 px-4 py-5
          backdrop-blur-xl
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-2">
          <Link
            to="/"
            onClick={onNavigate}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08]">
              <Orbit className="h-6 w-6 text-[#8ce7f5]" />
            </div>

            <div>
              <h1 className="font-display text-lg font-bold tracking-[0.16em] text-[#edf4f7]">
                ASTROSHIFT
              </h1>

              <p className="font-mono text-[9px] tracking-[0.22em] text-[#718795]">
                DEEP-SKY INTELLIGENCE
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace identity */}
        <div className="mt-9 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[#8ce7f5]" />

            <span className="font-mono text-[10px] tracking-[0.16em] text-[#91a5b2]">
              RESEARCH WORKSPACE
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-[#e5eef2]">
            SPHEREx Mission
          </p>

          <p className="mt-1 text-xs text-[#718795]">
            Astronomy intelligence platform
          </p>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="mt-9 flex-1 space-y-8"
        >
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-3 px-3 font-mono text-[9px] font-semibold tracking-[0.2em] text-[#617582]">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) => `
                        group flex items-center justify-between
                        rounded-lg px-3 py-3
                        transition-all duration-200
                        ${
                          isActive
                            ? "border border-cyan-300/[0.12] bg-cyan-300/[0.08] text-[#a5edf5]"
                            : "border border-transparent text-[#8b9ca8] hover:bg-white/[0.035] hover:text-white"
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <span className="flex items-center gap-3">
                            <Icon
                              size={17}
                              strokeWidth={1.8}
                              className={
                                isActive
                                  ? "text-[#8ce7f5]"
                                  : "text-[#718795] group-hover:text-[#a5edf5]"
                              }
                            />

                            <span className="text-[13px] font-semibold">
                              {item.label}
                            </span>
                          </span>

                          {item.badge && (
                            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/[0.07] px-1.5 py-0.5 font-mono text-[9px] text-[#8ce7f5]">
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

        {/* Footer */}
        <div className="border-t border-white/[0.07] pt-4">
          <p className="px-2 font-mono text-[9px] tracking-[0.15em] text-[#617582]">
            EXPOLORANGERS
          </p>

          <div className="mt-2 flex items-center justify-between px-2">
            <span className="text-xs text-[#8b9ca8]">
              AstroShift Platform
            </span>

            <span className="font-mono text-[10px] text-[#718795]">
              V2.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}