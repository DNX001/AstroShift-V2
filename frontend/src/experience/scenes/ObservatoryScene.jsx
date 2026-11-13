import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import PlanetaryHorizon from "../effects/PlanetaryHorizon";
import ObservatoryStarfield from "../effects/ObservatoryStarfield";
import { setChapterSixOrbitalOffset } from "./chapterSixOrbit";

const MODEL_URL = "/models/astra-01-cinematic-v3.glb";
const MODEL_POSITION = [0, 0, -3700];
const MODEL_SCALE = 18;

function Astra01Exterior({ progressRef }) {
  const { scene } = useGLTF(MODEL_URL);
  const assemblyRef = useRef(null);
  const orbitalOffsetRef = useRef(new THREE.Vector3());

  // Center a clone of the approved V3 GLB. The source asset is never modified.
  const centeredModel = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    return clone;
  }, [scene]);

  useFrame(() => {
    const progress = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    const assembly = assemblyRef.current;
    if (!assembly) return;

    assembly.visible = progress > 0.001;

    // Only the spacecraft follows the Earth-centred orbital arc.
    // Earth remains at a fixed world position and the camera has its own path.
    setChapterSixOrbitalOffset(progress, orbitalOffsetRef.current);
    const offset = orbitalOffsetRef.current;

    assembly.position.set(
      MODEL_POSITION[0] + offset.x,
      MODEL_POSITION[1] + offset.y,
      MODEL_POSITION[2] + offset.z
    );

    // Keep the observatory's attitude stable; only a restrained yaw changes.
    assembly.rotation.set(0, -0.035 + progress * 0.04, 0);
  });

  return (
    <group
      ref={assemblyRef}
      position={MODEL_POSITION}
      scale={MODEL_SCALE}
      visible={false}
    >
      <primitive object={centeredModel} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

export default function ObservatoryScene({ progressRef }) {
  const rootRef = useRef(null);

  useFrame(() => {
    if (!rootRef.current) return;
    rootRef.current.visible = (progressRef?.current ?? 0) > 0.001;
  });

  return (
    <group ref={rootRef} visible={false}>
      {/* One real 3D Earth, its atmosphere, and a restrained starfield. */}
      <PlanetaryHorizon />
      <ObservatoryStarfield progressRef={progressRef} />

      {/* The approved ASTRA-01 V3 spacecraft. */}
      <Suspense fallback={null}>
        <Astra01Exterior progressRef={progressRef} />
      </Suspense>

      {/* Subtle local fill light; no image plates or decorative streaks. */}
      <pointLight
        position={[-280, 150, -3450]}
        color="#f2d5b4"
        intensity={8}
        distance={950}
        decay={2}
      />
      <pointLight
        position={[260, 70, -3960]}
        color="#78bfff"
        intensity={6}
        distance={900}
        decay={2}
      />
    </group>
  );
}
