
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import NebulaBackdrop from "../effects/NebulaBackdrop";
import StarFieldLayers from "../effects/StarFieldLayers";
import PersistentStarfield from "../effects/PersistentStarfield";
import DistantNebula from "../effects/DistantNebula";
import InterstellarDustField from "../effects/InterstellarDustField";
import SpectralTunnel from "../effects/SpectralTunnel";
import SpectralReveal from "../effects/SpectralReveal";

import PlanetBody from "../components/PlanetBody";

// Actual section boundaries of the 700vh journey.
const APPROACH_END_PROGRESS = 0.5;
const NEBULA_END_PROGRESS = 5 / 6;

// ==========================================
// CHAPTERS 001 + 002 — ORIGINAL CAMERA ROUTE
// ==========================================

const approachCameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 5),
  new THREE.Vector3(0.35, 0.02, -2.5),
  new THREE.Vector3(1.8, -0.15, -9),
  new THREE.Vector3(4.2, -0.5, -15),
  new THREE.Vector3(6.5, -1.1, -21),
]);

const approachLookPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, -55),
  new THREE.Vector3(1.5, -0.2, -55),
  new THREE.Vector3(3.7, -0.5, -55),
  new THREE.Vector3(7.5, -1.2, -55),
  new THREE.Vector3(10.5, -2, -55),
]);

// ==========================================
// CHAPTER 003 — PLANET FLYBY + NEBULA
// ==========================================

const flybyCameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(6.5, -1.1, -21),
  new THREE.Vector3(30, 6, -29),
  new THREE.Vector3(52, 9, -68),
  new THREE.Vector3(56, 10, -140),
  new THREE.Vector3(38, 7, -285),
  new THREE.Vector3(15, 3, -560),
  new THREE.Vector3(0, 0, -800),
]);

const flybyLookPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(10.5, -2, -55),
  new THREE.Vector3(25, -1, -90),
  new THREE.Vector3(31, 0, -190),
  new THREE.Vector3(22, 0, -390),
  new THREE.Vector3(8, 0, -700),
  new THREE.Vector3(0, 0, -1080),
]);

// ==========================================
// CHAPTER 004 — SPECTRAL REVELATION
// ==========================================

const spectralCameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, -800),
  new THREE.Vector3(0, 0, -930),
  new THREE.Vector3(9, 3, -1120),
  new THREE.Vector3(-8, -3, -1370),
  new THREE.Vector3(5, 1, -1600),
  new THREE.Vector3(0, 0, -1850),
]);

const spectralLookPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, -1080),
  new THREE.Vector3(0, 0, -1180),
  new THREE.Vector3(0, 0, -1400),
  new THREE.Vector3(0, 0, -1640),
  new THREE.Vector3(0, 0, -1900),
  new THREE.Vector3(0, 0, -2100),
]);

// ==========================================
// CINEMATIC CAMERA
// ==========================================

function CinematicCamera({ progressRef }) {
  const lookTarget = useMemo(
    () => new THREE.Vector3(),
    []
  );

  useFrame(({ camera }) => {
    const progress = THREE.MathUtils.clamp(
      progressRef.current,
      0,
      1
    );

    if (progress <= APPROACH_END_PROGRESS) {
      const localProgress =
        progress / APPROACH_END_PROGRESS;

      approachCameraPath.getPoint(
        localProgress,
        camera.position
      );

      approachLookPath.getPoint(
        localProgress,
        lookTarget
      );

    } else if (progress <= NEBULA_END_PROGRESS) {
      const localProgress =
        (progress - APPROACH_END_PROGRESS) /
        (NEBULA_END_PROGRESS - APPROACH_END_PROGRESS);

      const travelProgress =
        0.5 -
        0.5 * Math.cos(
          Math.PI * localProgress
        );

      flybyCameraPath.getPointAt(
        travelProgress,
        camera.position
      );

      flybyLookPath.getPointAt(
        travelProgress,
        lookTarget
      );

    } else {
      const localProgress =
        (progress - NEBULA_END_PROGRESS) /
        (1 - NEBULA_END_PROGRESS);

      const travelProgress =
        0.5 -
        0.5 * Math.cos(
          Math.PI * localProgress
        );

      spectralCameraPath.getPointAt(
        travelProgress,
        camera.position
      );

      spectralLookPath.getPointAt(
        travelProgress,
        lookTarget
      );
    }

    camera.lookAt(lookTarget);
  });

  return null;
}

// ==========================================
// COMPLETE COSMIC ENVIRONMENT
// ==========================================

export default function CosmicScene({ progressRef }) {
  return (
    <>
      <color
        attach="background"
        args={["#03020b"]}
      />

      <ambientLight
        intensity={0.38}
        color="#8795c0"
      />

      <directionalLight
        position={[-42, 26, 22]}
        intensity={2.5}
        color="#fff0d7"
      />

      <directionalLight
        position={[32, -18, -12]}
        intensity={0.35}
        color="#5572ac"
      />

      {/* Original persistent dark-violet environment */}
      <NebulaBackdrop progressRef={progressRef} />

      {/* Original moving star layers */}
      <StarFieldLayers />

      {/* Extended background star coverage */}
      <PersistentStarfield
        progressRef={progressRef}
      />

      {/* Distant irregular nebula */}
      <DistantNebula
        progressRef={progressRef}
      />

      {/* Cosmic dust along the flight path */}
      <InterstellarDustField
        progressRef={progressRef}
      />

      {/* Scene 004 — spectral curtains */}
      <SpectralTunnel
        progressRef={progressRef}
      />

      {/* Scene 004 — new celestial structure emerging
          beyond the spectral curtains */}
      <SpectralReveal
        progressRef={progressRef}
      />

      {/* Existing Quaoar. Completely unchanged. */}
      <PlanetBody
        position={[16, -2, -55]}
      />

      <CinematicCamera
        progressRef={progressRef}
      />
    </>
  );
}