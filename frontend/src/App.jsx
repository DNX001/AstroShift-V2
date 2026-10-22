
import AstroBotDrawer from "./components/AstroBotDrawer";

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-2xl border border-cyan-500/40 bg-slate-900 p-10 text-center shadow-2xl">
          <h1 className="text-4xl font-bold tracking-wider text-cyan-400">
            ASTROSHIFT
          </h1>

          <p className="mt-4 text-lg text-slate-300">
            Planetary-Scale Astronomy Intelligence
          </p>

          <p className="mt-6 text-sm text-green-400">
            AstroBot 2.0 — Interface Preview
          </p>
        </div>
      </div>

      <AstroBotDrawer />
    </main>
  );
}

export default App;
