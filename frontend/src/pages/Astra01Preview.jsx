
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Link } from "react-router-dom";

const MODEL_URL = "/models/astra-01-cinematic-v3.glb";

function Astra01Model() {
  const { scene } = useGLTF(MODEL_URL);

  return <primitive object={scene} />;
}

useGLTF.preload(MODEL_URL);

function ModelViewer() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{
        position: [32, 23, 32],
        fov: 34,
        near: 0.1,
        far: 500,
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
    >
      {/* Background */}
      <color attach="background" args={["#020711"]} />

      {/* Environment lighting */}
      <hemisphereLight
        args={["#dbeafe", "#111827", 1.15]}
      />

      <ambientLight intensity={0.4} />

      <directionalLight
        position={[18, 24, 18]}
        intensity={2.8}
        color="#fff1d8"
      />

      <directionalLight
        position={[-18, 10, -20]}
        intensity={1.3}
        color="#7dbdff"
      />

      <pointLight
        position={[0, -12, 8]}
        intensity={1.5}
        distance={45}
        color="#72d9f8"
      />

      {/* Actual spacecraft */}
      <Suspense fallback={null}>
        <Bounds
          fit
          clip
          observe
          margin={1.3}
        >
          <Astra01Model />
        </Bounds>
      </Suspense>

      {/* Interactive inspection controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enableZoom
        enablePan
        screenSpacePanning
        minDistance={8}
        maxDistance={100}
        rotateSpeed={0.75}
        zoomSpeed={1.2}
      />
    </Canvas>
  );
}

export default function Astra01Preview() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#020711] text-[#eaf2fa]">

      {/* 3D viewport */}
      <div
        className="absolute inset-0"
        role="img"
        aria-label="Interactive 3D inspection of the ASTRA-01 orbital observatory"
      >
        <ModelViewer />
      </div>

      {/* Header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 p-6 md:p-9">

        <p className="font-mono text-[10px] tracking-[0.25em] text-[#8ce7f5]">
          ASTROSHIFT / ASTRA-01 / ORBITAL OBSERVATORY
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">
          ASTRA-01
        </h1>

        <p className="mt-2 max-w-xl text-xs leading-6 text-[#9cabbc] md:text-sm">
          Cinematic exterior · Detailed optical assembly ·
          Deployable solar arrays · Observation module
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          <span className="font-mono text-[9px] tracking-[0.16em] text-cyan-200">
            EXTERIOR MODEL / VERSION 03
          </span>
        </div>

      </header>

      {/* Footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-between gap-4 p-6 md:p-9">

        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-[#8ce7f5]">
            MODEL INSPECTION
          </p>

          <p className="mt-2 text-xs text-[#b0bdc9]">
            Drag to orbit · Scroll to zoom · Right-click to pan
          </p>
        </div>

        <Link
          to="/cosmos-preview"
          className="pointer-events-auto rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs text-white transition hover:border-cyan-200/30 hover:bg-white/10"
        >
          Return to cinematic experience
        </Link>

      </div>

    </main>
  );
}
