
import { useState } from "react";
import { searchCelestialTarget } from "../services/astroshiftApi";

export default function CelestialSearch() {
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

  return (
    <section className="w-full rounded-2xl border border-cyan-500/30 bg-slate-900 p-5 text-white shadow-xl sm:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400">
          STAR CATALOG // TARGET LOOKUP
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-wide">
          Celestial Search
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Search for a celestial object and retrieve its
          coordinates from the AstroShift backend.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="celestial-target"
          className="mb-2 block text-xs font-semibold tracking-wider text-slate-300"
        >
          TARGET NAME
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="celestial-target"
            type="search"
            value={query}
            onChange={handleQueryChange}
            placeholder="e.g. Messier 31"
            autoComplete="off"
            maxLength={120}
            required
            disabled={isSearching}
            aria-describedby="celestial-search-help"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSearching ? "SEARCHING..." : "SEARCH TARGET"}
          </button>
        </div>

        <p
          id="celestial-search-help"
          className="mt-2 text-xs text-slate-500"
        >
          Try “Messier 31” to test the live search endpoint.
        </p>
      </form>

      {isSearching && (
        <p
          role="status"
          className="mt-5 animate-pulse text-sm text-cyan-300"
        >
          Resolving celestial coordinates...
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-500/30 bg-red-950/30 p-4"
        >
          <p className="text-xs font-bold tracking-wider text-red-300">
            SEARCH FAILED
          </p>

          <p className="mt-2 break-words text-sm text-red-200">
            {error}
          </p>
        </div>
      )}

      {target && (
        <div
          aria-label="Celestial search result"
          className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5"
        >
          <p className="text-xs font-semibold tracking-wider text-emerald-300">
            TARGET RESOLVED
          </p>

          <h3 className="mt-2 break-words text-xl font-bold">
            {target.query}
          </h3>

          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-950/70 p-3">
              <dt className="text-xs tracking-wider text-slate-400">
                RIGHT ASCENSION (RA)
              </dt>

              <dd className="mt-2 break-words font-mono text-sm text-cyan-300">
                {target.ra.toFixed(6)}°
              </dd>
            </div>

            <div className="rounded-lg bg-slate-950/70 p-3">
              <dt className="text-xs tracking-wider text-slate-400">
                DECLINATION (DEC)
              </dt>

              <dd className="mt-2 break-words font-mono text-sm text-cyan-300">
                {target.dec.toFixed(6)}°
              </dd>
            </div>
          </dl>

          <div className="mt-3">
            <p className="text-xs text-slate-400">
              Formatted coordinates
            </p>

            <p className="mt-1 break-words font-mono text-sm text-slate-200">
              {target.formatted}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
