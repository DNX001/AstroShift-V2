
import { Canvas } from "@react-three/fiber";
import { Link } from "react-router-dom";

import CosmicScene from "../experience/scenes/CosmicScene";

export default function CosmicPreview() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#02030a] text-white">

      {/* ----------------------------------------
          REAL-TIME 3D ENVIRONMENT
      ---------------------------------------- */}

      <div
        className="absolute inset-0"
        role="img"
        aria-label="Animated three-dimensional deep-space environment"
      >
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 65,
            near: 0.1,
            far: 500,
          }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          fallback={
            <div className="flex h-full min-h-screen items-center justify-center bg-[#02030a] p-8 text-center">
              <div>
                <h2 className="font-display text-2xl text-[#8ce7f5]">
                  WebGL unavailable
                </h2>
                <p className="mt-3 text-sm text-slate-400">
                  This browser or device cannot render the
                  real-time cosmic environment.
                </p>
              </div>
            </div>
          }
        >
          <CosmicScene />
        </Canvas>
      </div>

      {/* ----------------------------------------
          ATMOSPHERIC OVERLAY
      ---------------------------------------- */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#02030a]/45 via-transparent to-[#02030a]/75"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,3,10,0.48)_100%)]"
      />

      {/* ----------------------------------------
          HEADER
      ---------------------------------------- */}

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-6 sm:p-9 lg:p-12">

        <div>
          <p className="font-display text-lg font-bold tracking-[0.24em] text-[#edf4f7] sm:text-xl">
            ASTROSHIFT
          </p>

          <p className="mt-2 font-mono text-[8px] tracking-[0.2em] text-[#91a8bc] sm:text-[9px]">
            BEYOND THE VISIBLE
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-200/15 bg-[#09131e]/50 px-3 py-2 backdrop-blur-md sm:px-4">

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]" />

          <span className="font-mono text-[8px] tracking-[0.14em] text-[#a5dce5] sm:text-[9px]">
            REAL-TIME 3D
          </span>

        </div>

      </header>

      {/* ----------------------------------------
          SCENE IDENTIFICATION
      ---------------------------------------- */}

      <div className="pointer-events-none absolute left-6 top-28 z-20 sm:left-9 lg:left-12">

        <p className="font-mono text-[8px] tracking-[0.2em] text-[#718795]">
          ENVIRONMENT STUDY
        </p>

        <p className="mt-2 font-mono text-[10px] tracking-wider text-[#8ce7f5]">
          001 / DEEP SPACE
        </p>

      </div>

      {/* ----------------------------------------
          HERO TYPOGRAPHY
      ---------------------------------------- */}

      <section className="pointer-events-none absolute bottom-0 left-0 z-20 max-w-3xl p-6 pb-12 sm:p-9 sm:pb-14 lg:p-12 lg:pb-16">

        <p className="font-mono text-[9px] tracking-[0.2em] text-[#8ce7f5] sm:text-[10px]">
          COSMOS ENGINE / PROTOTYPE
        </p>

        <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-8xl">

          Beyond
          <br />

          <span className="text-[#8ce7f5]">
            the visible.
          </span>

        </h1>

        <p className="mt-6 max-w-lg text-xs leading-7 text-[#a5b4c1] sm:text-sm sm:leading-8">
          An exploration of the space between stars,
          galaxies and everything waiting beyond the
          limits of human vision.
        </p>

        {/* Return navigation */}
        <Link
          to="/"
          className="pointer-events-auto mt-8 inline-flex items-center gap-3 rounded-full border border-cyan-200/25 bg-cyan-200/[0.06] px-5 py-3 font-mono text-[9px] tracking-[0.14em] text-[#a5edf5] backdrop-blur-md transition duration-300 hover:border-cyan-200/50 hover:bg-cyan-200/[0.12]"
        >
          ← RETURN TO WORKSPACE
        </Link>

      </section>

      {/* ----------------------------------------
          ENVIRONMENT METADATA
      ---------------------------------------- */}

      <div className="pointer-events-none absolute bottom-8 right-8 z-20 hidden text-right md:block">

        <p className="font-mono text-[8px] tracking-[0.17em] text-[#718795]">
          ENVIRONMENT COMPOSITION
        </p>

        <p className="mt-3 font-mono text-[9px] text-[#a5dce5]">
          3,850 PARTICLES
        </p>

        <p className="mt-1 font-mono text-[9px] text-[#718795]">
          PROCEDURAL NEBULA
        </p>

        <p className="mt-1 font-mono text-[9px] text-[#718795]">
          THREE-DIMENSIONAL SPACE
        </p>

      </div>

    </main>
  );
}
