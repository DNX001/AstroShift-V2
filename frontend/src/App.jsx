import AstroBotDrawer from "./components/AstroBotDrawer";
import CelestialSearch from "./components/CelestialSearch";
import FitsUploadPanel from "./components/FitsUploadPanel";

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center gap-6 px-6 py-12 pb-28">
        <section className="w-full max-w-3xl rounded-2xl border border-cyan-500/40 bg-slate-900 p-8 text-center shadow-2xl sm:p-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-cyan-400">
            MISSION CONTROL // ASTROSHIFT
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-wider text-cyan-400 sm:text-5xl">
            ASTROSHIFT
          </h1>

          <p className="mt-4 text-lg text-slate-300">
            Planetary-Scale Astronomy Intelligence
          </p>

          <p className="mt-5 text-sm text-green-400">
            AstroBot 2.0 — Interface Preview
          </p>
        </section>

        <div className="w-full max-w-3xl">
          <FitsUploadPanel />
        </div>

        <div className="w-full max-w-3xl">
          <CelestialSearch />
        </div>
      </div>

      <AstroBotDrawer />
    </main>
  );
}

export default App;