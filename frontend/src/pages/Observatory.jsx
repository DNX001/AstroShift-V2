
import {
  Activity,
  Info,
  Orbit,
  Telescope,
} from "lucide-react";

import FitsUploadPanel from "../components/FitsUploadPanel";

export default function Observatory() {
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

        <div className="max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2">
            <Orbit size={13} className="text-[#8ce7f5]" />

            <span className="font-mono text-[9px] font-medium tracking-[0.19em] text-[#a5dce5]">
              ASTROSHIFT / OBSERVATORY
            </span>
          </div>

          <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-[#8297a5]">
            ASTRONOMICAL IMAGE PROCESSING
          </p>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-[#edf4f7] sm:text-5xl lg:text-6xl">
            Observe the sky.
            <br />
            <span className="text-[#8ce7f5]">
              Compare its moments.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-[#9aabb7] sm:text-base">
            Upload astronomical FITS observations and
            align successive image frames to prepare
            them for further scientific investigation.
          </p>

        </div>
      </section>

      {/* Observatory workspace */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">

        {/* Existing FITS processing component */}
        <div className="min-w-0">
          <FitsUploadPanel />
        </div>

        {/* Information panels */}
        <aside className="space-y-5">

          <div className="rounded-xl border border-white/[0.07] bg-[#0c141c] p-5 sm:p-6">

            <div className="flex items-center gap-2">
              <Telescope size={18} className="text-[#8ce7f5]" />

              <p className="font-mono text-[10px] tracking-[0.16em] text-[#a5dce5]">
                OBSERVATION WORKFLOW
              </p>
            </div>

            <div className="mt-6 space-y-6">

              <div>
                <p className="font-mono text-xs text-[#8ce7f5]">
                  01 / REFERENCE FRAME
                </p>

                <h3 className="mt-2 text-sm font-semibold text-[#edf4f7]">
                  Establish the baseline
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#899ba7]">
                  Upload Frame A to serve as the reference
                  observation.
                </p>
              </div>

              <div className="border-t border-white/[0.07] pt-5">
                <p className="font-mono text-xs text-[#8ce7f5]">
                  02 / SECOND OBSERVATION
                </p>

                <h3 className="mt-2 text-sm font-semibold text-[#edf4f7]">
                  Introduce Frame B
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#899ba7]">
                  Upload the second FITS observation
                  for comparison.
                </p>
              </div>

              <div className="border-t border-white/[0.07] pt-5">
                <p className="font-mono text-xs text-[#8ce7f5]">
                  03 / IMAGE REGISTRATION
                </p>

                <h3 className="mt-2 text-sm font-semibold text-[#edf4f7]">
                  Align the observations
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#899ba7]">
                  The configured AstroShift backend
                  processes the frames and returns
                  the reference and aligned previews.
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.035] p-5">

            <div className="flex items-center gap-2">
              <Info size={17} className="text-[#8ce7f5]" />

              <p className="font-mono text-[10px] tracking-[0.15em] text-[#a5dce5]">
                SCIENTIFIC NOTE
              </p>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#a8b7c2]">
              Successful image alignment does not
              automatically establish the presence
              of an astronomical transient or anomaly.
              Further scientific analysis is necessary.
            </p>

          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#0c141c] p-5">

            <div className="flex items-center gap-2">
              <Activity size={17} className="text-[#8ce7f5]" />

              <p className="font-mono text-[10px] tracking-[0.15em] text-[#a5dce5]">
                PROCESSING REQUIREMENTS
              </p>
            </div>

            <p className="mt-4 text-xs leading-6 text-[#899ba7]">
              Supported extensions: .fits, .fit and .fts.
              Both observation files are required before
              processing can begin.
            </p>

          </div>

        </aside>

      </section>

    </div>
  );
}
