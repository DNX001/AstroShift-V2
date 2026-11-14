import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Database,
  Eye,
  Layers3,
  Microscope,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useObservation } from "../context/useObservation";

function getImageSource(value) {
  if (typeof value !== "string" || !value) return "";
  return value.startsWith("data:image/")
    ? value
    : `data:image/png;base64,${value}`;
}

function formatMetadataValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not supplied";
  }
  return String(value);
}

function MetadataCard({ title, metadata, fileName, accent = "cyan" }) {
  const accentClass = accent === "emerald" ? "text-emerald-300" : "text-[#8ce7f5]";
  const rows = [
    ["Target", metadata?.target_name],
    ["Observation date", metadata?.date_obs],
    ["Telescope", metadata?.telescope],
    ["Instrument", metadata?.instrument],
    ["Spectral filter", metadata?.filter],
    ["Exposure", metadata?.exposure_time !== undefined ? `${metadata.exposure_time} s` : null],
    ["RA centre", Number.isFinite(metadata?.ra_center) ? `${metadata.ra_center.toFixed(5)}°` : null],
    ["Dec centre", Number.isFinite(metadata?.dec_center) ? `${metadata.dec_center.toFixed(5)}°` : null],
  ];

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0c141d] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-mono text-[9px] tracking-[0.16em] ${accentClass}`}>{title}</p>
          <p className="mt-1 truncate text-xs text-[#a4b4bd]" title={fileName || metadata?.target_name || title}>
            {fileName || metadata?.target_name || "Frame metadata"}
          </p>
        </div>
        <Database size={16} className="shrink-0 text-[#718795]" />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="font-mono text-[8px] tracking-[0.12em] text-[#708692]">{label.toUpperCase()}</dt>
            <dd className="mt-1 break-words text-[11px] leading-5 text-[#c1cdd3]">{formatMetadataValue(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function CompareViewer({ data }) {
  const [viewMode, setViewMode] = useState("split");
  const [activeFrame, setActiveFrame] = useState("A");
  const [blinkPaused, setBlinkPaused] = useState(false);
  const [wipePosition, setWipePosition] = useState(50);

  const frameA = getImageSource(data.frame_a_b64 || data.image_a);
  const frameB = getImageSource(data.frame_b_aligned_b64 || data.image_b);

  useEffect(() => {
    if (viewMode !== "blink" || blinkPaused) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveFrame((current) => (current === "A" ? "B" : "A"));
    }, 850);

    return () => window.clearInterval(intervalId);
  }, [viewMode, blinkPaused]);

  function selectMode(nextMode) {
    setViewMode(nextMode);
    if (nextMode === "blink") {
      setActiveFrame("A");
      setBlinkPaused(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c141d]">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-[#8ce7f5]" />
            <p className="font-mono text-[9px] tracking-[0.16em] text-[#a5dce5]">VISUAL COMPARISON</p>
          </div>
          <h2 className="mt-1.5 font-display text-lg font-semibold text-[#edf4f7]">Inspect the registered pair</h2>
          <p className="mt-1 text-[11px] text-[#8193a0]">Frame B is the backend-returned preview registered against Frame A.</p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.07] bg-[#080f17] p-1">
          {[
            ["split", "Side by side"],
            ["blink", "Blink"],
            ["wipe", "Wipe"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => selectMode(value)}
              aria-pressed={viewMode === value}
              className={`rounded-lg px-3 py-2 text-[10px] font-medium transition ${
                viewMode === value
                  ? "bg-cyan-200 text-[#061219]"
                  : "text-[#8da1ac] hover:bg-white/[0.055] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {viewMode === "split" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <figure className="min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-black">
              <figcaption className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2.5">
                <span className="font-mono text-[9px] tracking-[0.14em] text-[#8ce7f5]">FRAME A / REFERENCE</span>
                <span className="text-[9px] text-[#728691]">Original</span>
              </figcaption>
              <div className="flex aspect-[4/3] items-center justify-center p-2">
                {frameA ? <img src={frameA} alt="Frame A reference observation" className="h-full w-full object-contain" /> : <span className="text-xs text-[#8193a0]">Frame A preview unavailable.</span>}
              </div>
            </figure>

            <figure className="min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-black">
              <figcaption className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2.5">
                <span className="font-mono text-[9px] tracking-[0.14em] text-emerald-300">FRAME B / REGISTERED</span>
                <span className="text-[9px] text-[#728691]">Aligned to A</span>
              </figcaption>
              <div className="flex aspect-[4/3] items-center justify-center p-2">
                {frameB ? <img src={frameB} alt="Frame B observation registered to Frame A" className="h-full w-full object-contain" /> : <span className="text-xs text-[#8193a0]">Frame B preview unavailable.</span>}
              </div>
            </figure>
          </div>
        )}

        {viewMode === "blink" && (
          <div>
            <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-black">
              <div className="flex aspect-[4/3] items-center justify-center p-2">
                {activeFrame === "A" ? (
                  <img src={frameA} alt="Blink comparison showing Frame A" className="h-full w-full object-contain" />
                ) : (
                  <img src={frameB} alt="Blink comparison showing aligned Frame B" className="h-full w-full object-contain" />
                )}
              </div>
              <span className={`absolute left-3 top-3 rounded-md border px-2.5 py-1.5 font-mono text-[9px] tracking-[0.13em] backdrop-blur ${activeFrame === "A" ? "border-cyan-200/25 bg-cyan-950/80 text-[#8ce7f5]" : "border-emerald-200/25 bg-emerald-950/80 text-emerald-200"}`}>
                {activeFrame === "A" ? "FRAME A" : "FRAME B · ALIGNED"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-[#8296a1]">The viewer alternates the two returned previews. This is a visual blink, not a pixel-difference calculation.</p>
              <button
                type="button"
                onClick={() => setBlinkPaused((paused) => !paused)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] px-3 py-2 text-[10px] font-semibold text-[#c4d2d9] transition hover:border-cyan-200/25 hover:text-white"
              >
                {blinkPaused ? <Play size={13} /> : <Pause size={13} />}
                {blinkPaused ? "Resume blink" : "Pause blink"}
              </button>
            </div>
          </div>
        )}

        {viewMode === "wipe" && (
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.08] bg-black">
              <img src={frameB} alt="Aligned Frame B underneath the wipe comparison" className="absolute inset-0 h-full w-full object-contain p-2" />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - wipePosition}% 0 0)` }}
              >
                <img src={frameA} alt="Reference Frame A in the wipe comparison" className="absolute inset-0 h-full w-full object-contain p-2" />
              </div>
              <div className="pointer-events-none absolute bottom-0 top-0 w-px bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" style={{ left: `${wipePosition}%` }} />
              <span className="absolute left-3 top-3 rounded-md border border-cyan-200/20 bg-cyan-950/80 px-2.5 py-1.5 font-mono text-[9px] text-[#8ce7f5]">A</span>
              <span className="absolute right-3 top-3 rounded-md border border-emerald-200/20 bg-emerald-950/80 px-2.5 py-1.5 font-mono text-[9px] text-emerald-200">B · ALIGNED</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="font-mono text-[9px] text-[#8ce7f5]">A</span>
              <input
                type="range"
                min="5"
                max="95"
                value={wipePosition}
                onChange={(event) => setWipePosition(Number(event.target.value))}
                aria-label="Adjust comparison wipe position"
                className="h-1.5 min-w-0 flex-1 cursor-pointer accent-cyan-200"
              />
              <span className="font-mono text-[9px] text-emerald-300">B</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AnalysisStatus({ hasObservation }) {
  const modules = [
    {
      title: "Image registration",
      description: hasObservation
        ? "Frame B was returned by the backend aligned to Frame A."
        : "Upload a pair in Observatory to receive registered previews.",
      status: hasObservation ? "AVAILABLE" : "WAITING FOR UPLOAD",
      tone: hasObservation ? "success" : "pending",
      icon: CheckCircle2,
    },
    {
      title: "Pixel-level difference",
      description: "The upload response contains preview images, not the pixel matrices required by the delta-analysis endpoint.",
      status: "DATA HANDOFF REQUIRED",
      tone: "pending",
      icon: Layers3,
    },
    {
      title: "Candidate validation",
      description: "No candidate catalogue or validation result is included in the current response.",
      status: "NOT CONNECTED",
      tone: "pending",
      icon: CircleHelp,
    },
  ];

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0c141d] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/10 bg-cyan-200/[0.05] text-[#8ce7f5]">
          <SlidersHorizontal size={18} />
        </div>
        <div>
          <p className="font-mono text-[9px] tracking-[0.16em] text-[#718795]">ANALYSIS PIPELINE</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-[#edf4f7]">What the current engine provides</h2>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const isSuccess = module.tone === "success";

          return (
            <article key={module.title} className="rounded-xl border border-white/[0.07] bg-[#080f17] p-4">
              <div className="flex items-start justify-between gap-3">
                <Icon size={17} className={isSuccess ? "text-emerald-300" : "text-amber-200"} />
                <span className={`font-mono text-[8px] tracking-[0.1em] ${isSuccess ? "text-emerald-200" : "text-amber-100"}`}>
                  {module.status}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[#e3edf1]">{module.title}</h3>
              <p className="mt-2 text-[11px] leading-5 text-[#879ba6]">{module.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function ScienceLab() {
  const { observation, clearObservation } = useObservation();
  const data = observation?.data;

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <section className="relative isolate overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0b1721] px-5 py-8 sm:px-8 sm:py-10 lg:px-11 lg:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 -z-10 h-[390px] w-[390px] rounded-full border border-cyan-200/[0.08]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-20 -z-10 h-[290px] w-[290px] rounded-full border border-cyan-200/[0.09]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-28 top-20 -z-10 h-2 w-2 rounded-full bg-cyan-200/70 shadow-[0_0_24px_5px_rgba(140,231,245,0.25)]" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2">
            <Microscope size={13} className="text-[#8ce7f5]" />
            <span className="font-mono text-[9px] font-medium tracking-[0.19em] text-[#a5dce5]">ASTROSHIFT / SCIENCE LAB</span>
          </div>
          <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-[#8297a5]">VISUAL INVESTIGATION & SCIENTIFIC CONTEXT</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[#edf4f7] sm:text-5xl lg:text-6xl">
            See what changed.
            <br />
            <span className="text-[#8ce7f5]">Ask what it means.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#a1b1bb] sm:text-base">
            Compare registered observations, inspect the metadata returned with them and separate visible differences from scientific conclusions.
          </p>
        </div>
      </section>

      {data ? (
        <>
          <section className="flex flex-col gap-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300">
                <CheckCircle2 size={19} />
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-[0.15em] text-emerald-200">SESSION OBSERVATION LOADED</p>
                <h2 className="mt-1 text-sm font-semibold text-[#e2eee9]">Your registered image pair is ready to inspect.</h2>
                <p className="mt-1 text-[11px] text-[#93a99f]">
                  {observation.files?.frameA?.name ?? "Frame A"} <span className="px-1 text-[#607a70]">→</span> {observation.files?.frameB?.name ?? "Frame B"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearObservation}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/[0.1] px-3 py-2 text-[10px] font-semibold text-[#b4c3c9] transition hover:border-rose-300/25 hover:text-rose-200 sm:self-auto"
            >
              <RefreshCw size={13} /> Clear session result
            </button>
          </section>

          <CompareViewer data={data} />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <MetadataCard
              title="FRAME A / REFERENCE METADATA"
              metadata={data.metadata_a}
              fileName={observation.files?.frameA?.name}
            />
            <MetadataCard
              title="FRAME B / REGISTERED METADATA"
              metadata={data.metadata_b}
              fileName={observation.files?.frameB?.name}
              accent="emerald"
            />
          </div>
        </>
      ) : (
        <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-[#0c141d] px-5 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.045] text-[#8ce7f5]">
            <Database size={26} />
          </div>
          <p className="mt-6 font-mono text-[9px] tracking-[0.18em] text-[#8ba1ad]">NO ACTIVE OBSERVATION</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-[#edf4f7]">Bring an observation pair into the lab.</h2>
          <p className="mt-3 max-w-lg text-xs leading-6 text-[#879ba6]">
            Upload two FITS files in Observatory. When the backend returns the registered previews, they will appear here automatically for visual comparison.
          </p>
          <Link to="/observatory" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8ce7f5] px-5 py-3 text-xs font-bold text-[#061219] transition hover:bg-[#b7f1f8]">
            Open Observatory <ArrowRight size={15} />
          </Link>
        </section>
      )}

      <AnalysisStatus hasObservation={Boolean(data)} />

      <section className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.025] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck size={19} className="text-emerald-300" />
          <h2 className="font-display text-base font-semibold text-[#dcebe5]">Scientific integrity comes first</h2>
        </div>
        <p className="mt-3 text-xs leading-6 text-[#9aabb7]">
          The side-by-side, blink and wipe tools compare the returned preview images. They do not calculate a pixel-level difference map. The current upload response does not include the raw pixel matrices required by the backend delta-analysis route, and no candidate catalogue is returned. A visible change is a prompt for investigation—not proof of a new object or transient.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
          <Activity size={14} className="text-[#8ce7f5]" />
          <p className="text-[10px] leading-5 text-[#8193a0]">AstroBot can receive the observation metadata from this session, but not the underlying pixel arrays through this connection.</p>
        </div>
      </section>
    </div>
  );
}
