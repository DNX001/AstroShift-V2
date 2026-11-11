
import {
  Activity,
  ArrowUpRight,
  Database,
  Info,
  Layers3,
  Microscope,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

const analysisModules = [
  {
    number: "01",
    title: "Difference Imaging",
    description:
      "Examine differences between registered astronomical observations to identify potential changes.",
    icon: Layers3,
    status: "AWAITING SCIENCE ENGINE",
  },
  {
    number: "02",
    title: "Anomaly Ledger",
    description:
      "Review candidate detections and their associated scientific evidence when analysis becomes available.",
    icon: Activity,
    status: "AWAITING DETECTION DATA",
  },
  {
    number: "03",
    title: "Scientific Interpretation",
    description:
      "Understand observed changes through evidence-based explanations and astronomical context.",
    icon: Sparkles,
    status: "AWAITING ANALYSIS",
  },
];

export default function ScienceLab() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-8">

      {/* Page introduction */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1721] p-6 sm:p-9 lg:p-12">

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
          className="pointer-events-none absolute right-28 top-20 h-2 w-2 rounded-full bg-cyan-200/70 shadow-[0_0_24px_5px_rgba(140,231,245,0.25)]"
        />

        <div className="max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2">
            <Orbit size={13} className="text-[#8ce7f5]" />

            <span className="font-mono text-[9px] font-medium tracking-[0.19em] text-[#a5dce5]">
              ASTROSHIFT / SCIENCE LAB
            </span>
          </div>

          <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-[#8297a5]">
            SCIENTIFIC INVESTIGATION ENVIRONMENT
          </p>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-[#edf4f7] sm:text-5xl lg:text-6xl">
            Beyond observation.
            <br />

            <span className="text-[#8ce7f5]">
              Into discovery.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-[#9aabb7] sm:text-base">
            Investigate changes in astronomical observations,
            examine candidate anomalies and explore the
            scientific evidence behind potential discoveries.
          </p>

        </div>
      </section>

      {/* Scientific modules */}
      <section>

        <div className="mb-5">
          <p className="font-mono text-[9px] tracking-[0.2em] text-[#718795]">
            ANALYTICAL ENVIRONMENT
          </p>

          <h2 className="mt-2 font-display text-2xl font-semibold text-[#edf4f7]">
            Scientific workspaces
          </h2>

          <p className="mt-2 text-sm text-[#8193a0]">
            The analytical modules planned for AstroShift.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {analysisModules.map((module) => {
            const Icon = module.icon;

            return (
              <article
                key={module.number}
                className="rounded-xl border border-white/[0.07] bg-[#0c141c] p-5 transition hover:border-cyan-200/20 sm:p-6"
              >

                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.055]">
                    <Icon
                      size={20}
                      className="text-[#8ce7f5]"
                    />
                  </div>

                  <span className="font-mono text-[10px] text-[#647684]">
                    {module.number}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-lg font-semibold text-[#edf4f7]">
                  {module.title}
                </h3>

                <p className="mt-3 min-h-20 text-sm leading-6 text-[#899ba7]">
                  {module.description}
                </p>

                <div className="mt-5 border-t border-white/[0.07] pt-4">

                  <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/15 bg-amber-300/[0.045] px-2.5 py-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />

                    <span className="font-mono text-[9px] tracking-wider text-[#c5ad83]">
                      {module.status}
                    </span>

                  </div>

                </div>

              </article>
            );
          })}

        </div>

      </section>

      {/* Current analysis state */}
      <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0c141c]">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-200/10 bg-cyan-200/[0.05]">
              <Microscope size={19} className="text-[#8ce7f5]" />
            </div>

            <div>
              <p className="font-mono text-[9px] tracking-[0.16em] text-[#718795]">
                SCIENTIFIC ANALYSIS
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-[#edf4f7]">
                Analysis workspace
              </h2>
            </div>

          </div>

          <span className="rounded-md border border-amber-300/15 bg-amber-300/[0.045] px-3 py-2 font-mono text-[9px] tracking-wider text-[#c5ad83]">
            BACKEND INTEGRATION PENDING
          </span>

        </div>

        <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-12 text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.045]">
            <Database
              size={27}
              className="text-[#8ce7f5]"
            />
          </div>

          <h3 className="mt-6 font-display text-xl font-semibold text-[#edf4f7]">
            Awaiting scientific observations
          </h3>

          <p className="mt-3 max-w-lg text-sm leading-7 text-[#899ba7]">
            No validated difference-image or anomaly-analysis
            result is connected to this workspace yet.
            Scientific outputs will appear here when the
            corresponding backend capabilities are integrated.
          </p>

          <Link
            to="/observatory"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#8ce7f5] px-5 py-3 text-sm font-bold text-[#071016] transition hover:bg-[#b3f1f8]"
          >
            Open Observatory
            <ArrowUpRight size={16} />
          </Link>

        </div>

      </section>

      {/* Scientific integrity */}
      <section className="rounded-xl border border-emerald-300/10 bg-emerald-300/[0.025] p-5 sm:p-6">

        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-emerald-300" />

          <h2 className="font-display text-base font-semibold text-[#dcebe5]">
            Scientific integrity
          </h2>
        </div>

        <p className="mt-4 text-sm leading-7 text-[#9aabb7]">
          Image alignment and astronomical anomaly detection
          are different operations. A change between two
          observations is a candidate observation, not
          automatically a confirmed celestial discovery.
          AstroShift will present scientific findings only
          when supported by actual analysis outputs.
        </p>

        <div className="mt-4 flex items-start gap-2 border-t border-white/[0.06] pt-4">

          <Info
            size={15}
            className="mt-0.5 shrink-0 text-[#8ce7f5]"
          />

          <p className="text-xs leading-6 text-[#8193a0]">
            Detection algorithms, confidence values and
            scientific classifications will be sourced from
            the integrated analysis engine, not generated
            as decorative dashboard statistics.
          </p>

        </div>

      </section>

    </div>
  );
}
