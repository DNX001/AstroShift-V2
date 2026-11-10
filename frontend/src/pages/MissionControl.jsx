
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Bot,
  ChevronRight,
  Crosshair,
  Microscope,
  Orbit,
  Telescope,
} from "lucide-react";

const workspaces = [
  {
    number: "01",
    title: "Target Explorer",
    description:
      "Resolve celestial objects and examine their astronomical coordinates.",
    path: "/targets",
    icon: Crosshair,
    label: "TARGET RESOLUTION",
  },
  {
    number: "02",
    title: "Observatory",
    description:
      "Upload FITS observations and align two frames for comparison.",
    path: "/observatory",
    icon: Telescope,
    label: "IMAGE PROCESSING",
  },
  {
    number: "03",
    title: "Science Lab",
    description:
      "Enter the scientific analysis workspace for processed observations.",
    path: "/science",
    icon: Microscope,
    label: "SCIENTIFIC ANALYSIS",
  },
  {
    number: "04",
    title: "AstroBot",
    description:
      "Explore astronomy and SPHEREx science with your AI companion.",
    path: "/astrobot",
    icon: Bot,
    label: "AI ASSISTANCE",
  },
];

export default function MissionControl() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-8">

      {/* Page introduction */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1721] p-6 sm:p-9 lg:p-12">

        {/* Decorative orbital elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 -z-10 h-[390px] w-[390px] rounded-full border border-cyan-200/[0.08]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-20 -z-10 h-[290px] w-[290px] rounded-full border border-cyan-200/[0.09]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-28 top-20 -z-10 h-2 w-2 rounded-full bg-cyan-200/70 shadow-[0_0_24px_5px_rgba(140,231,245,0.25)]"
        />

        <div className="max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2">
            <Orbit size={13} className="text-[#8ce7f5]" />

            <span className="font-mono text-[9px] font-medium tracking-[0.19em] text-[#a5dce5]">
              ASTROSHIFT / MISSION CONTROL
            </span>
          </div>

          <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-[#8297a5]">
            EXPLORE THE UNIVERSE DIFFERENTLY
          </p>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-[#edf4f7] sm:text-5xl lg:text-6xl">
            Read the sky.
            <br />
            <span className="text-[#8ce7f5]">
              Find what changes.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-[#9aabb7] sm:text-base">
            An astronomical intelligence workspace for exploring
            celestial targets, processing FITS observations and
            investigating changes between images.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/observatory"
              className="inline-flex items-center gap-2 rounded-lg bg-[#8ce7f5] px-5 py-3 text-sm font-bold text-[#071016] transition hover:bg-[#b3f1f8]"
            >
              Open Observatory
              <ArrowUpRight size={16} />
            </Link>

            <Link
              to="/targets"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.025] px-5 py-3 text-sm font-semibold text-[#d7e2e8] transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.05]"
            >
              Explore Targets
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Workspace directory */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-[#718795]">
              PLATFORM DIRECTORY
            </p>

            <h2 className="mt-2 font-display text-2xl font-semibold text-[#edf4f7]">
              Research workspaces
            </h2>

            <p className="mt-2 text-sm text-[#8193a0]">
              Choose where you want to begin.
            </p>
          </div>

          <span className="hidden font-mono text-[10px] text-[#647684] sm:block">
            04 WORKSPACES
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {workspaces.map((workspace) => {
            const Icon = workspace.icon;

            return (
              <Link
                key={workspace.path}
                to={workspace.path}
                className="group rounded-xl border border-white/[0.07] bg-[#0c141c] p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-200/20 hover:bg-[#101c26] sm:p-6"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.055]">
                    <Icon size={20} className="text-[#8ce7f5]" />
                  </div>

                  <span className="font-mono text-[10px] text-[#647684]">
                    {workspace.number}
                  </span>
                </div>

                <p className="mt-6 font-mono text-[9px] tracking-[0.17em] text-[#718795]">
                  {workspace.label}
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-[#e8f0f4]">
                    {workspace.title}
                  </h3>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-[#718795] transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#8ce7f5]"
                  />
                </div>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#899ba7]">
                  {workspace.description}
                </p>
              </Link>
            );
          })}

        </div>
      </section>

      {/* Observation workflow */}
      <section className="rounded-xl border border-white/[0.07] bg-[#0c141c] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
            <Telescope size={17} className="text-[#8ce7f5]" />
          </div>

          <div>
            <p className="font-mono text-[9px] tracking-[0.16em] text-[#718795]">
              OBSERVATION WORKFLOW
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold">
              From target to comparison
            </h2>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">

          {[
            {
              number: "01",
              title: "Locate",
              description:
                "Search for a celestial target and retrieve its coordinates.",
            },
            {
              number: "02",
              title: "Process",
              description:
                "Submit two FITS observations for image registration.",
            },
            {
              number: "03",
              title: "Investigate",
              description:
                "Compare the returned frames and investigate observed changes.",
            },
          ].map((step, index) => (
            <div key={step.number} className="relative">
              <span className="font-mono text-[10px] text-[#8ce7f5]">
                STEP {step.number}
              </span>

              <h3 className="mt-2 text-sm font-semibold text-[#e3edf1]">
                {step.title}
              </h3>

              <p className="mt-2 max-w-xs text-xs leading-6 text-[#8294a0]">
                {step.description}
              </p>

              {index < 2 && (
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-1 hidden h-full border-r border-dashed border-white/[0.08] sm:block"
                />
              )}
            </div>
          ))}

        </div>
      </section>

    </div>
  );
}
