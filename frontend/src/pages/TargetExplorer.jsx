
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Crosshair,
  Info,
  Orbit,
  Telescope,
} from "lucide-react";
import { searchCelestialTarget } from "../services/astroshiftApi";

export default function TargetExplorer() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const targetName = query.trim();

    if (!targetName || isSearching) return;

    setIsSearching(true);
    setError("");
    setTarget(null);

    try {
      const result = await searchCelestialTarget(targetName);
      setTarget(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Celestial search failed. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleQueryChange(event) {
    setQuery(event.target.value);
    setError("");
    setTarget(null);
  }

  function useExampleTarget() {
    setQuery("Messier 31");
    setError("");
    setTarget(null);
  }

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
              ASTROSHIFT / TARGET EXPLORER
            </span>
          </div>

          <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-[#8297a5]">
            CELESTIAL OBJECT RESOLUTION
          </p>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-[#edf4f7] sm:text-5xl lg:text-6xl">
            Find your place.
            <br />
            <span className="text-[#8ce7f5]">
              In the universe.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-[#9aabb7] sm:text-base">
            Explore celestial objects, resolve their astronomical
            coordinates and prepare targets for further
            observation and scientific investigation.
          </p>

        </div>
      </section>

      {/* Search workspace */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">

        {/* Main search panel */}
        <div className="rounded-xl border border-white/[0.07] bg-[#0c141c] p-5 sm:p-7">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.055]">
              <Crosshair size={20} className="text-[#8ce7f5]" />
            </div>

            <div>
              <p className="font-mono text-[9px] tracking-[0.17em] text-[#718795]">
                CELESTIAL CATALOGUE
              </p>

              <h2 className="mt-1 font-display text-xl font-semibold text-[#edf4f7]">
                Resolve a target
              </h2>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-[#899ba7]">
            Enter the name of a celestial object to retrieve
            its coordinates through the AstroShift backend.
          </p>

          <form onSubmit={handleSubmit} className="mt-7">

            <label
              htmlFor="target-query"
              className="mb-3 block font-mono text-[10px] font-medium tracking-[0.15em] text-[#9aabb7]"
            >
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
                className="min-w-0 flex-1 rounded-lg border border-white/[0.1] bg-[#070d13] px-4 py-3.5 text-sm text-[#edf4f7] outline-none placeholder:text-[#586b78] transition focus:border-cyan-200/40 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8ce7f5] px-6 py-3.5 text-sm font-bold text-[#071016] transition hover:bg-[#b3f1f8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSearching ? "RESOLVING..." : "RESOLVE TARGET"}

                <ArrowUpRight size={16} />
              </button>

            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">

              <p className="text-xs text-[#647684]">
                Search by recognised celestial object name.
              </p>

              <button
                type="button"
                onClick={useExampleTarget}
                disabled={isSearching}
                className="font-mono text-[10px] text-[#8ce7f5] transition hover:text-white disabled:opacity-50"
              >
                TRY MESSIER 31 →
              </button>

            </div>

          </form>

          {/* Loading state */}
          {isSearching && (
            <div
              role="status"
              className="mt-7 flex items-center gap-3 rounded-lg border border-cyan-200/10 bg-cyan-200/[0.035] p-4"
            >
              <Orbit
                size={18}
                className="animate-spin text-[#8ce7f5]"
              />

              <div>
                <p className="text-sm font-semibold text-[#b3f1f8]">
                  Resolving celestial coordinates
                </p>

                <p className="mt-1 text-xs text-[#8193a0]">
                  Communicating with AstroShift services...
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div
              role="alert"
              className="mt-7 rounded-lg border border-red-400/20 bg-red-400/[0.05] p-4"
            >
              <p className="font-mono text-[10px] font-semibold tracking-[0.15em] text-red-300">
                RESOLUTION FAILED
              </p>

              <p className="mt-2 break-words text-sm leading-6 text-red-200">
                {error}
              </p>
            </div>
          )}

          {/* Successful search result */}
          {target && (
            <div
              aria-label="Celestial search result"
              className="mt-7 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.035] p-5 sm:p-6"
            >

              <div className="flex flex-wrap items-center justify-between gap-3">

                <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/[0.07] px-3 py-1.5 font-mono text-[9px] tracking-[0.12em] text-emerald-300">
                  <Crosshair size={12} />
                  TARGET RESOLVED
                </span>

                <span className="font-mono text-[9px] tracking-wider text-[#718795]">
                  ASTROSHIFT RESPONSE
                </span>

              </div>

              <h3 className="mt-5 break-words font-display text-2xl font-semibold text-[#edf4f7]">
                {target.query}
              </h3>

              <p className="mt-2 text-sm text-[#899ba7]">
                Celestial coordinates successfully retrieved.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-lg border border-white/[0.06] bg-[#080f16] p-4">
                  <p className="font-mono text-[9px] tracking-[0.14em] text-[#718795]">
                    RIGHT ASCENSION
                  </p>

                  <p className="mt-3 font-mono text-xl font-medium text-[#8ce7f5]">
                    {target.ra.toFixed(6)}°
                  </p>

                  <p className="mt-2 text-xs text-[#647684]">
                    RA · Degrees
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-[#080f16] p-4">
                  <p className="font-mono text-[9px] tracking-[0.14em] text-[#718795]">
                    DECLINATION
                  </p>

                  <p className="mt-3 font-mono text-xl font-medium text-[#8ce7f5]">
                    {target.dec.toFixed(6)}°
                  </p>

                  <p className="mt-2 text-xs text-[#647684]">
                    DEC · Degrees
                  </p>
                </div>

              </div>

              <div className="mt-4 rounded-lg border border-white/[0.06] bg-[#080f16] p-4">

                <p className="font-mono text-[9px] tracking-[0.14em] text-[#718795]">
                  FORMATTED COORDINATES
                </p>

                <p className="mt-3 break-words font-mono text-sm leading-6 text-[#d5e3e9]">
                  {target.formatted}
                </p>

              </div>

              <p className="mt-4 text-xs leading-5 text-[#8193a0]">
                These coordinates are returned by the AstroShift
                backend. Additional catalogue metadata will only
                be displayed when supported by the API.
              </p>

            </div>
          )}

        </div>

        {/* Coordinate reference panel */}
        <aside className="space-y-5">

          <div className="rounded-xl border border-white/[0.07] bg-[#0c141c] p-5 sm:p-6">

            <div className="flex items-center gap-2">
              <Info size={17} className="text-[#8ce7f5]" />

              <p className="font-mono text-[10px] tracking-[0.16em] text-[#a5dce5]">
                COORDINATE REFERENCE
              </p>
            </div>

            <h3 className="mt-5 font-display text-lg font-semibold text-[#edf4f7]">
              Understanding the sky
            </h3>

            <div className="mt-6 space-y-5">

              <div>
                <p className="font-mono text-xs font-medium text-[#8ce7f5]">
                  RIGHT ASCENSION · RA
                </p>

                <p className="mt-2 text-xs leading-6 text-[#899ba7]">
                  Measures an object's angular position along
                  the celestial equator, analogous to longitude
                  on Earth.
                </p>
              </div>

              <div className="border-t border-white/[0.07] pt-5">
                <p className="font-mono text-xs font-medium text-[#8ce7f5]">
                  DECLINATION · DEC
                </p>

                <p className="mt-2 text-xs leading-6 text-[#899ba7]">
                  Measures an object's angular position north
                  or south of the celestial equator, analogous
                  to latitude on Earth.
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.035] p-5">

            <div className="flex items-center gap-3">
              <Telescope size={20} className="text-[#8ce7f5]" />

              <p className="font-mono text-[10px] tracking-[0.15em] text-[#a5dce5]">
                NEXT: OBSERVATION
              </p>
            </div>

            <h3 className="mt-4 font-display text-lg font-semibold text-[#edf4f7]">
              Continue your investigation
            </h3>

            <p className="mt-2 text-xs leading-6 text-[#899ba7]">
              Resolved target coordinates can support the
              subsequent FITS observation and image-comparison
              workflow.
            </p>

            <Link
              to="/observatory"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-cyan-200/20 bg-cyan-200/[0.07] px-4 py-3 text-xs font-semibold text-[#a5edf5] transition hover:bg-cyan-200/[0.13]"
            >
              Open Observatory
              <ArrowUpRight size={15} />
            </Link>

          </div>

        </aside>

      </section>

    </div>
  );
}
