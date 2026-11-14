import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileImage,
  Info,
  Orbit,
  Telescope,
} from "lucide-react";
import { Link } from "react-router-dom";

import FitsUploadPanel from "../components/FitsUploadPanel";
import { useObservation } from "../context/useObservation";

const workflow = [
  {
    number: "01",
    title: "Load a reference frame",
    description: "Choose the FITS observation that will anchor the comparison.",
  },
  {
    number: "02",
    title: "Add a second observation",
    description: "Select a compatible observation of the same region of sky.",
  },
  {
    number: "03",
    title: "Register the frames",
    description: "The backend attempts to align Frame B against Frame A and returns preview images.",
  },
];

function formatTime(value) {
  if (!value) return "Current browser session";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Current browser session";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Observatory() {
  const { observation, setObservation } = useObservation();
  const hasObservation = Boolean(observation?.data);

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <section className="relative isolate overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0b1721] px-5 py-8 sm:px-8 sm:py-10 lg:px-11 lg:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 -z-10 h-[440px] w-[440px] rounded-full border border-cyan-200/[0.08]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-24 -z-10 h-[310px] w-[310px] rounded-full border border-cyan-200/[0.09]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[18%] top-12 -z-10 h-2 w-2 rounded-full bg-cyan-200/70 shadow-[0_0_28px_8px_rgba(140,231,245,0.24)]" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2">
            <Orbit size={13} className="text-[#8ce7f5]" />
            <span className="font-mono text-[9px] font-medium tracking-[0.19em] text-[#a5dce5]">
              ASTROSHIFT / OBSERVATORY
            </span>
          </div>

          <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-[#8297a5]">
            OBSERVATION ACQUISITION & REGISTRATION
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[#edf4f7] sm:text-5xl lg:text-6xl">
            Bring the sky
            <br />
            <span className="text-[#8ce7f5]">into focus.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#a1b1bb] sm:text-base">
            Load two astronomical FITS observations and register the later frame against a reference. Observatory prepares the image pair for careful visual investigation in Science Lab.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.08] bg-black/15 p-3.5">
              <p className="font-mono text-[9px] tracking-[0.15em] text-[#718795]">INPUT PAIR</p>
              <p className="mt-1.5 text-sm font-semibold text-[#e4eef2]">2 FITS frames</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-black/15 p-3.5">
              <p className="font-mono text-[9px] tracking-[0.15em] text-[#718795]">SUPPORTED FILES</p>
              <p className="mt-1.5 text-sm font-semibold text-[#e4eef2]">.fits · .fit · .fts</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-black/15 p-3.5">
              <p className="font-mono text-[9px] tracking-[0.15em] text-[#718795]">REGISTRATION</p>
              <p className="mt-1.5 text-sm font-semibold text-[#e4eef2]">Frame B → Frame A</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.72fr)]">
        <div className="min-w-0">
          <FitsUploadPanel onResult={setObservation} />
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-white/[0.08] bg-[#0c141d] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/10 bg-cyan-200/[0.055] text-[#8ce7f5]">
                <Telescope size={19} />
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-[0.16em] text-[#718795]">REGISTRATION PATH</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-[#edf4f7]">From file to frame</h2>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {workflow.map((step, index) => (
                <div key={step.number} className="flex gap-3">
                  <div className="flex shrink-0 flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-200/15 bg-cyan-200/[0.055] font-mono text-[10px] text-[#8ce7f5]">
                      {step.number}
                    </span>
                    {index < workflow.length - 1 && (
                      <span className="mt-2 h-7 w-px bg-white/[0.09]" />
                    )}
                  </div>
                  <div className="min-w-0 pb-1">
                    <h3 className="text-sm font-semibold text-[#e4edf1]">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-6 text-[#879ba6]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-200/[0.12] bg-cyan-200/[0.035] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[#8ce7f5]" />
              <p className="font-mono text-[9px] tracking-[0.16em] text-[#a5dce5]">BEFORE YOU COMPARE</p>
            </div>
            <p className="mt-3 text-xs leading-6 text-[#a6b6bf]">
              For a scientifically meaningful comparison, check that both observations cover the same sky region and use compatible spectral bands. Registration helps align images; it does not correct every calibration or instrument difference.
            </p>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c141d] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <CircleDot size={16} className={hasObservation ? "text-emerald-300" : "text-[#7d929e]"} />
              <p className="font-mono text-[9px] tracking-[0.16em] text-[#91a6b2]">CURRENT SESSION</p>
            </div>

            {hasObservation ? (
              <>
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-300" />
                  <p className="text-sm font-semibold text-[#e0eee8]">Registration response available</p>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-[#879ba6]">
                  {observation.files?.frameA?.name ?? "Frame A"} and {observation.files?.frameB?.name ?? "Frame B"}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#718795]">
                  <Clock3 size={12} /> {formatTime(observation.receivedAt)}
                </p>
                <Link
                  to="/science"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#8ce7f5] transition hover:text-white"
                >
                  Continue to Science Lab <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <p className="mt-3 text-xs leading-6 text-[#879ba6]">
                No registration result is stored in this browser session yet. A successful upload will make its previews and metadata available in Science Lab and AstroBot.
              </p>
            )}
          </section>

          <div className="flex items-start gap-2 px-1 text-[10px] leading-5 text-[#6f838f]">
            <FileImage size={13} className="mt-0.5 shrink-0" />
            <p>Observation results are held in app memory for this session. Refreshing the page clears them; files are not uploaded to persistent browser storage.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
