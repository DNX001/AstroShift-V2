import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Clipboard,
  Crosshair,
  Info,
  Orbit,
  Search,
  Telescope,
} from "lucide-react";
import { searchCelestialTarget } from "../services/astroshiftApi";

function normalizeRightAscension(value) {
  return ((value % 360) + 360) % 360;
}

function formatRaHms(degrees) {
  const hours = normalizeRightAscension(degrees) / 15;
  const h = Math.floor(hours);
  const minuteValue = (hours - h) * 60;
  const m = Math.floor(minuteValue);
  const seconds = ((minuteValue - m) * 60).toFixed(1);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(seconds).padStart(4, "0")}s`;
}

function formatDecDms(degrees) {
  const sign = degrees < 0 ? "−" : "+";
  const absolute = Math.abs(degrees);
  const d = Math.floor(absolute);
  const minuteValue = (absolute - d) * 60;
  const m = Math.floor(minuteValue);
  const seconds = ((minuteValue - m) * 60).toFixed(1);
  return `${sign}${String(d).padStart(2, "0")}° ${String(m).padStart(2, "0")}′ ${String(seconds).padStart(4, "0")}″`;
}

function CoordinatePlot({ target }) {
  const left = 62;
  const right = 620;
  const top = 28;
  const bottom = 330;
  const width = right - left;
  const height = bottom - top;
  const raTicks = [0, 45, 90, 135, 180, 225, 270, 315, 360];
  const raLabels = [360, 270, 180, 90, 0];
  const decTicks = [-90, -45, 0, 45, 90];

  const xForRa = (degrees) => left + (1 - degrees / 360) * width;
  const yForDec = (degrees) => top + ((90 - degrees) / 180) * height;

  const markerX = target ? xForRa(normalizeRightAscension(target.ra)) : null;
  const markerY = target ? yForDec(Math.max(-90, Math.min(90, target.dec))) : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b141d]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.055]">
            <Crosshair size={18} className="text-[#8ce7f5]" />
          </span>
          <div>
            <p className="font-mono text-[8px] tracking-[0.17em] text-[#718795]">EQUATORIAL COORDINATES</p>
            <h2 className="mt-1 font-display text-base font-semibold text-[#edf4f7]">Celestial position</h2>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.12em] ${target ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200" : "border-white/[0.08] bg-white/[0.025] text-[#718795]"}`}>
          {target ? "TARGET PLOTTED" : "AWAITING TARGET"}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <svg
          viewBox="0 0 680 405"
          role="img"
          aria-label={target ? `Coordinate plot for ${target.query}, right ascension ${target.ra.toFixed(4)} degrees and declination ${target.dec.toFixed(4)} degrees` : "Empty right ascension and declination coordinate grid"}
          className="h-auto w-full"
        >
          <defs>
            <linearGradient id="coordinate-panel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0d2230" />
              <stop offset="100%" stopColor="#071019" />
            </linearGradient>
            <radialGradient id="target-glow">
              <stop offset="0%" stopColor="#b9f7ff" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#49d7eb" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#49d7eb" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width="680" height="405" rx="14" fill="url(#coordinate-panel)" />
          <rect x={left} y={top} width={width} height={height} rx="5" fill="#07131c" stroke="#315061" strokeOpacity="0.75" />

          {raTicks.map((tick) => {
            const x = xForRa(tick);
            return (
              <line
                key={`ra-${tick}`}
                x1={x}
                y1={top}
                x2={x}
                y2={bottom}
                stroke={tick === 180 ? "#7ccfdf" : "#557585"}
                strokeOpacity={tick === 180 ? "0.38" : "0.2"}
                strokeDasharray={tick === 180 ? "none" : "3 7"}
              />
            );
          })}

          {decTicks.map((tick) => {
            const y = yForDec(tick);
            return (
              <line
                key={`dec-${tick}`}
                x1={left}
                y1={y}
                x2={right}
                y2={y}
                stroke={tick === 0 ? "#7ccfdf" : "#557585"}
                strokeOpacity={tick === 0 ? "0.38" : "0.2"}
                strokeDasharray={tick === 0 ? "none" : "3 7"}
              />
            );
          })}

          <g fill="#7894a3" fontFamily="monospace" fontSize="10">
            {raLabels.map((tick) => (
              <text key={`ra-label-${tick}`} x={xForRa(tick)} y="352" textAnchor={tick === 360 ? "start" : tick === 0 ? "end" : "middle"}>
                {tick}°
              </text>
            ))}
            {decTicks.slice().reverse().map((tick) => (
              <text key={`dec-label-${tick}`} x="48" y={yForDec(tick) + 3} textAnchor="end">
                {tick > 0 ? `+${tick}°` : `${tick}°`}
              </text>
            ))}
          </g>

          <text x={(left + right) / 2} y="385" textAnchor="middle" fill="#8aa3b0" fontFamily="monospace" fontSize="9" letterSpacing="1.4">
            RIGHT ASCENSION · RA
          </text>
          <text x="13" y={(top + bottom) / 2} transform={`rotate(-90 13 ${(top + bottom) / 2})`} textAnchor="middle" fill="#8aa3b0" fontFamily="monospace" fontSize="9" letterSpacing="1.2">
            DECLINATION · DEC
          </text>

          {target ? (
            <g>
              <line x1={markerX} y1={top} x2={markerX} y2={bottom} stroke="#72e7f3" strokeOpacity="0.3" strokeDasharray="4 5" />
              <line x1={left} y1={markerY} x2={right} y2={markerY} stroke="#72e7f3" strokeOpacity="0.3" strokeDasharray="4 5" />
              <circle cx={markerX} cy={markerY} r="34" fill="url(#target-glow)" />
              <circle cx={markerX} cy={markerY} r="10" fill="none" stroke="#b8f7ff" strokeWidth="1.3" />
              <circle cx={markerX} cy={markerY} r="3.5" fill="#d9fbff" />
              <path d={`M ${markerX - 19} ${markerY} H ${markerX - 11} M ${markerX + 11} ${markerY} H ${markerX + 19} M ${markerX} ${markerY - 19} V ${markerY - 11} M ${markerX} ${markerY + 11} V ${markerY + 19}`} stroke="#b8f7ff" strokeWidth="1.4" strokeLinecap="round" />
              <rect x={Math.min(right - 174, Math.max(left + 5, markerX - 84))} y={Math.max(top + 7, markerY - 48)} width="168" height="25" rx="7" fill="#102634" stroke="#65dbea" strokeOpacity="0.45" />
              <text x={Math.min(right - 174, Math.max(left + 5, markerX - 84)) + 84} y={Math.max(top + 7, markerY - 48) + 16} fill="#d5f8fc" textAnchor="middle" fontSize="10" fontFamily="sans-serif">
                {target.query.length > 22 ? `${target.query.slice(0, 20)}…` : target.query}
              </text>
            </g>
          ) : (
            <g opacity="0.65">
              <circle cx={(left + right) / 2} cy={(top + bottom) / 2} r="20" fill="none" stroke="#5c8797" strokeDasharray="3 5" />
              <path d={`M ${(left + right) / 2 - 32} ${(top + bottom) / 2} H ${(left + right) / 2 + 32} M ${(left + right) / 2} ${(top + bottom) / 2 - 32} V ${(top + bottom) / 2 + 32}`} stroke="#5c8797" strokeOpacity="0.45" />
              <text x={(left + right) / 2} y={(top + bottom) / 2 + 48} fill="#718795" textAnchor="middle" fontSize="10" fontFamily="monospace" letterSpacing="1">
                NO TARGET RESOLVED
              </text>
            </g>
          )}
        </svg>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] leading-5 text-[#718795]">
          <span>RA increases toward the left; declination runs north to south.</span>
          <span className="font-mono tracking-[0.1em]">COORDINATE LOCATOR · NOT A SKY IMAGE</span>
        </div>
      </div>
    </section>
  );
}

export default function TargetExplorer() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();
    const targetName = query.trim();
    if (!targetName || isSearching) return;

    setIsSearching(true);
    setError("");
    setTarget(null);
    setCopyState("idle");

    try {
      const result = await searchCelestialTarget(targetName);
      setTarget(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Celestial search failed. Please try again.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleQueryChange(event) {
    setQuery(event.target.value);
    setError("");
    setTarget(null);
    setCopyState("idle");
  }

  function useExampleTarget() {
    setQuery("Messier 31");
    setError("");
    setTarget(null);
    setCopyState("idle");
  }

  async function copyCoordinates() {
    if (!target) return;
    const text = [
      target.query,
      `RA: ${target.ra.toFixed(6)}° (${formatRaHms(target.ra)})`,
      `Dec: ${target.dec.toFixed(6)}° (${formatDecDms(target.dec)})`,
      `Formatted: ${target.formatted}`,
    ].join("\n");

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable in this browser context.");
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("unavailable");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7 pb-8">
      <section className="relative isolate overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#0b1721] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-9 lg:p-11">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 h-[430px] w-[430px] rounded-full border border-cyan-100/[0.07]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-20 -z-10 h-[300px] w-[300px] rounded-full border border-cyan-100/[0.08]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[17%] top-[24%] -z-10 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_25px_7px_rgba(140,231,245,0.25)]" />

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/[0.16] bg-cyan-200/[0.07] px-3 py-1.5">
            <Orbit size={13} className="text-[#8ce7f5]" />
            <span className="font-mono text-[9px] font-semibold tracking-[0.19em] text-[#b5eaf1]">ASTROSHIFT / TARGET EXPLORER</span>
          </div>
          <p className="mt-8 font-mono text-[10px] font-medium tracking-[0.2em] text-[#8297a5]">CELESTIAL OBJECT RESOLUTION</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#f0f7fa] sm:text-5xl lg:text-[3.55rem]">
            Find your place.
            <br />
            <span className="bg-gradient-to-r from-[#9deaf4] via-[#75d8e8] to-[#9bb9f4] bg-clip-text text-transparent">In the universe.</span>
          </h1>
          <p className="mt-5 max-w-[650px] text-sm leading-7 text-[#a0b1bc] sm:text-[15px]">
            Resolve a celestial object, inspect its equatorial coordinates and locate it on an interactive right-ascension and declination grid.
          </p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-white/[0.08] bg-[#0b141d] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.055]">
                <Search size={18} className="text-[#8ce7f5]" />
              </span>
              <div>
                <p className="font-mono text-[8px] tracking-[0.17em] text-[#718795]">CELESTIAL CATALOGUE</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-[#edf4f7]">Resolve a target</h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#899ba7]">
              Search by a recognised celestial object name. AstroShift will request its coordinates from the connected astronomy service.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
              <label htmlFor="target-query" className="mb-2.5 block font-mono text-[9px] font-semibold tracking-[0.15em] text-[#9aabb7]">
                TARGET IDENTIFIER
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="target-query"
                  type="search"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="e.g. Messier 31"
                  autoComplete="off"
                  maxLength={120}
                  required
                  disabled={isSearching}
                  aria-describedby="target-search-help"
                  className="min-w-0 flex-1 rounded-xl border border-white/[0.11] bg-[#070d13] px-4 py-3.5 text-sm text-[#edf4f7] outline-none transition placeholder:text-[#586b78] focus:border-cyan-200/45 focus:ring-2 focus:ring-cyan-200/10 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  aria-busy={isSearching}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#8ce7f5] px-5 py-3 text-[11px] font-extrabold tracking-[0.08em] text-[#06131b] shadow-[0_8px_25px_rgba(80,204,225,0.13)] transition hover:-translate-y-0.5 hover:bg-[#b3f1f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8ce7f5] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isSearching ? "RESOLVING" : "RESOLVE TARGET"}
                  <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p id="target-search-help" className="text-[10px] leading-5 text-[#718795]">
                  Enter an object name; the result is supplied by the AstroShift API.
                </p>
                <button
                  type="button"
                  onClick={useExampleTarget}
                  disabled={isSearching}
                  className="font-mono text-[9px] font-semibold tracking-[0.08em] text-[#8ce7f5] transition hover:text-white disabled:opacity-50"
                >
                  TRY MESSIER 31 →
                </button>
              </div>
            </form>

            {isSearching && (
              <div role="status" className="mt-5 flex items-center gap-3 rounded-xl border border-cyan-200/10 bg-cyan-200/[0.035] p-4">
                <Orbit size={17} className="animate-spin text-[#8ce7f5]" />
                <div>
                  <p className="text-xs font-semibold text-[#b3f1f8]">Resolving celestial coordinates</p>
                  <p className="mt-1 text-[10px] text-[#8193a0]">Waiting for the astronomy service...</p>
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-300/[0.045] p-4">
                <p className="font-mono text-[9px] font-semibold tracking-[0.15em] text-rose-200">RESOLUTION FAILED</p>
                <p className="mt-2 break-words text-xs leading-6 text-rose-100">{error}</p>
              </div>
            )}
          </section>

          {target ? (
            <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.035] p-5 sm:p-6" aria-label="Resolved target details">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3 py-1.5 font-mono text-[8px] tracking-[0.12em] text-emerald-200">
                  <Crosshair size={12} /> TARGET RESOLVED
                </span>
                <span className="font-mono text-[8px] tracking-[0.12em] text-[#718795]">ASTROSHIFT API RESULT</span>
              </div>

              <h2 className="mt-4 break-words font-display text-2xl font-semibold text-[#edf4f7]">{target.query}</h2>
              <p className="mt-1 text-xs text-[#899ba7]">Equatorial coordinates returned successfully.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-[#080f16] p-4">
                  <p className="font-mono text-[8px] tracking-[0.14em] text-[#718795]">RIGHT ASCENSION · RA</p>
                  <p className="mt-2 font-mono text-xl font-medium text-[#8ce7f5]">{target.ra.toFixed(6)}°</p>
                  <p className="mt-2 text-[10px] text-[#8294a0]">{formatRaHms(target.ra)}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#080f16] p-4">
                  <p className="font-mono text-[8px] tracking-[0.14em] text-[#718795]">DECLINATION · DEC</p>
                  <p className="mt-2 font-mono text-xl font-medium text-[#8ce7f5]">{target.dec.toFixed(6)}°</p>
                  <p className="mt-2 text-[10px] text-[#8294a0]">{formatDecDms(target.dec)}</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#080f16] p-4">
                <p className="font-mono text-[8px] tracking-[0.14em] text-[#718795]">BACKEND-FORMATTED COORDINATES</p>
                <p className="mt-2 break-words font-mono text-xs leading-6 text-[#d5e3e9]">{target.formatted}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={copyCoordinates}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.035] px-3.5 py-2.5 text-[10px] font-semibold text-[#c7d8df] transition hover:border-cyan-200/25 hover:text-[#8ce7f5]"
                >
                  {copyState === "copied" ? <Check size={14} /> : <Clipboard size={14} />}
                  {copyState === "copied" ? "COPIED" : "COPY COORDINATES"}
                </button>
                {copyState === "unavailable" && <span role="status" className="text-[10px] text-amber-200">Clipboard access is unavailable in this browser context.</span>}
                {copyState === "copied" && <span role="status" className="text-[10px] text-emerald-200">Coordinates copied to clipboard.</span>}
                <Link to="/observatory" className="ml-auto inline-flex items-center gap-2 text-[10px] font-semibold text-[#a8eaf2] transition hover:text-white">
                  Continue to Observatory <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-white/[0.07] bg-[#0b141d] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Info size={17} className="mt-0.5 shrink-0 text-[#8ce7f5]" />
                <div>
                  <h3 className="text-sm font-semibold text-[#e7f0f4]">What happens after a search?</h3>
                  <p className="mt-2 text-xs leading-6 text-[#899ba7]">
                    AstroShift requests the object's equatorial coordinates. When a result is returned, the locator plots the position using right ascension and declination. It is a coordinate view, not a photographic sky survey.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <CoordinatePlot target={target} />
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-2xl border border-white/[0.07] bg-[#0b141d] p-5">
              <p className="font-mono text-[8px] font-semibold tracking-[0.16em] text-[#8ce7f5]">RIGHT ASCENSION · RA</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#edf4f7]">Position along the sky</h3>
              <p className="mt-2 text-xs leading-6 text-[#899ba7]">RA measures angular position eastward along the celestial equator, expressed in degrees or hours.</p>
            </article>
            <article className="rounded-2xl border border-white/[0.07] bg-[#0b141d] p-5">
              <p className="font-mono text-[8px] font-semibold tracking-[0.16em] text-[#8ce7f5]">DECLINATION · DEC</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#edf4f7]">North or south of the equator</h3>
              <p className="mt-2 text-xs leading-6 text-[#899ba7]">Declination measures angular distance north or south of the celestial equator, from +90° to −90°.</p>
            </article>
          </section>
          <section className="rounded-2xl border border-cyan-200/[0.12] bg-cyan-200/[0.035] p-5">
            <div className="flex items-center gap-3">
              <Telescope size={19} className="text-[#8ce7f5]" />
              <p className="font-mono text-[8px] font-semibold tracking-[0.15em] text-[#a5dce5]">NEXT · OBSERVATION</p>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold text-[#edf4f7]">Continue your investigation</h3>
            <p className="mt-2 text-xs leading-6 text-[#899ba7]">After resolving a target, move to the FITS observation workspace to prepare and inspect image frames.</p>
            <Link to="/observatory" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-200/20 bg-cyan-200/[0.07] px-4 py-2.5 text-[10px] font-semibold text-[#b7edf4] transition hover:bg-cyan-200/[0.13]">
              Open Observatory <ArrowUpRight size={14} />
            </Link>
          </section>
        </div>
      </section>
    </div>
  );
}
