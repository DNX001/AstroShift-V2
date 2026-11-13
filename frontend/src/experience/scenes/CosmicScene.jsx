import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import NebulaBackdrop from "../effects/NebulaBackdrop";
import StarFieldLayers from "../effects/StarFieldLayers";
import PersistentStarfield from "../effects/PersistentStarfield";
import DistantNebula from "../effects/DistantNebula";
import InterstellarDustField from "../effects/InterstellarDustField";
import SpectralTunnel from "../effects/SpectralTunnel";
import SpectralReveal from "../effects/SpectralReveal";
import TemporalEchoField from "../effects/TemporalEchoField";
import ObservatoryScene from "./ObservatoryScene";

import PlanetBody from "../components/PlanetBody";

// ==========================================
// ORIGINAL FOUR-CHAPTER CAMERA THRESHOLDS
// ==========================================

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
// CHAPTER 005 — THE SKY REMEMBERS
// ==========================================

const chapterFiveCameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, -1850),
  new THREE.Vector3(0.5, 0.2, -1980),
  new THREE.Vector3(-5, 1, -2180),
  new THREE.Vector3(8, -2, -2400),
  new THREE.Vector3(0, 0, -2720),
]);

const chapterFiveLookPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, -2100),
  new THREE.Vector3(0, 0, -2240),
  new THREE.Vector3(-2, 0, -2440),
  new THREE.Vector3(0, 0, -2650),
  new THREE.Vector3(0, 0, -2940),
]);

// ==========================================
// CHAPTER 006 — THE FINAL ORBIT
// ==========================================

// Keep the first Chapter 006 frame identical to the Chapter 005 handoff.
// A very short opening glide moves into a tight view of ASTRA-01's optical
// instrument end. The main move then physically dollies backward, revealing
// the spacecraft and finally the Earth. No lens-only zoom is used.
const CHAPTER_SIX_CLOSE_APPROACH_END = 0.075;
const CHAPTER_SIX_WIDE_REVEAL_END = 0.82;

const chapterSixHandoffCamera = new THREE.Vector3(0, 0, -2720);
const chapterSixHandoffLook = new THREE.Vector3(0, 0, -2940);

// Close framing: the upper optical assembly and nearby spacecraft structure
// fill the view; the solar arrays are intentionally outside the first frame.
const chapterSixCloseCamera = new THREE.Vector3(0, 150, -3480);
const chapterSixCloseLook = new THREE.Vector3(0, 98, -3700);

const chapterSixOpeningCameraPath = new THREE.CatmullRomCurve3([
  chapterSixHandoffCamera,
  new THREE.Vector3(0, 66, -3090),
  chapterSixCloseCamera,
]);

const chapterSixOpeningLookPath = new THREE.CatmullRomCurve3([
  chapterSixHandoffLook,
  new THREE.Vector3(0, 48, -3340),
  chapterSixCloseLook,
]);

// The camera now retreats on its own world-space path. The target gradually
// shifts from ASTRA-01 toward the Earth to form the final wide composition.
const chapterSixPullbackCameraPath = new THREE.CatmullRomCurve3([
  chapterSixCloseCamera,
  new THREE.Vector3(0, 210, -3270),
  new THREE.Vector3(0, 190, -2760),
  new THREE.Vector3(0, 140, -2200),
]);

const chapterSixPullbackLookPath = new THREE.CatmullRomCurve3([
  chapterSixCloseLook,
  new THREE.Vector3(0, 20, -4200),
  new THREE.Vector3(0, -920, -5050),
  new THREE.Vector3(0, -1740, -5850),
]);

// ==========================================
// ENVIRONMENT OWNERSHIP
// ==========================================

function LegacyEnvironmentGate({
  chapterFiveProgressRef,
  chapterSixProgressRef,
  chapterFiveActiveRef,
  chapterSixActiveRef,
  children,
}) {
  const groupRef = useRef(null);

  useFrame(() => {
    if (!groupRef.current) return;

    const chapterFiveOwnsScene =
      Boolean(chapterFiveActiveRef?.current) ||
      (chapterFiveProgressRef?.current ?? 0) > 0.0001;

    const chapterSixOwnsScene =
      Boolean(chapterSixActiveRef?.current) ||
      (chapterSixProgressRef?.current ?? 0) > 0.0001;

    // The original starfield / nebula / Quaoar environment belongs
    // to Chapters 001–004 only. It must not remain behind Chapters 005–006.
    groupRef.current.visible =
      !chapterFiveOwnsScene && !chapterSixOwnsScene;
  });

  return <group ref={groupRef}>{children}</group>;
}

// ==========================================
// CINEMATIC CAMERA
// ==========================================

function CinematicCamera({
  progressRef,
  chapterFiveProgressRef,
  chapterSixProgressRef,
  chapterFiveActiveRef,
  chapterSixActiveRef,
}) {
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const progress = THREE.MathUtils.clamp(
      progressRef?.current ?? 0,
      0,
      1
    );

    const chapterFiveProgress = THREE.MathUtils.clamp(
      chapterFiveProgressRef?.current ?? 0,
      0,
      1
    );

    const chapterSixProgress = THREE.MathUtils.clamp(
      chapterSixProgressRef?.current ?? 0,
      0,
      1
    );

    // Active flags matter at progress 0: a new chapter must own the
    // camera on its first frame, before its progress tween advances.
    // Progress fallbacks keep the final frame stable at each endpoint.
    const chapterFiveIsActive =
      Boolean(chapterFiveActiveRef?.current) ||
      chapterFiveProgress > 0.0001;

    const chapterSixIsActive =
      Boolean(chapterSixActiveRef?.current) ||
      chapterSixProgress > 0.0001;

    if (chapterSixIsActive) {
      if (chapterSixProgress <= CHAPTER_SIX_CLOSE_APPROACH_END) {
        // Preserve the exact Chapter 005 handoff, then glide closer for a
        // brief, tight opening shot. This avoids a camera-position snap.
        const approachProgress = THREE.MathUtils.clamp(
          chapterSixProgress / CHAPTER_SIX_CLOSE_APPROACH_END,
          0,
          1
        );
        const approachEase =
          0.5 - 0.5 * Math.cos(Math.PI * approachProgress);

        chapterSixOpeningCameraPath.getPoint(
          approachEase,
          camera.position
        );
        chapterSixOpeningLookPath.getPoint(
          approachEase,
          lookTarget
        );
      } else {
        // Most of the chapter is a slow physical dolly-out. The camera is
        // independent of ASTRA-01's orbit and reaches the wide frame at 82%.
        const revealProgress = THREE.MathUtils.clamp(
          (chapterSixProgress - CHAPTER_SIX_CLOSE_APPROACH_END) /
            (CHAPTER_SIX_WIDE_REVEAL_END - CHAPTER_SIX_CLOSE_APPROACH_END),
          0,
          1
        );
        const revealEase =
          0.5 - 0.5 * Math.cos(Math.PI * revealProgress);

        chapterSixPullbackCameraPath.getPoint(
          revealEase,
          camera.position
        );
        chapterSixPullbackLookPath.getPoint(
          revealEase,
          lookTarget
        );
      }
    } else if (chapterFiveIsActive) {
      const travelProgress =
        0.5 -
        0.5 * Math.cos(Math.PI * chapterFiveProgress);

      chapterFiveCameraPath.getPointAt(
        travelProgress,
        camera.position
      );

      chapterFiveLookPath.getPointAt(
        travelProgress,
        lookTarget
      );
    } else if (progress <= APPROACH_END_PROGRESS) {
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
        0.5 * Math.cos(Math.PI * localProgress);

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
        0.5 * Math.cos(Math.PI * localProgress);

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

export default function CosmicScene({
  progressRef,
  chapterFiveProgressRef,
  chapterSixProgressRef,
  chapterFiveActiveRef,
  chapterSixActiveRef,
}) {
  return (
    <>
      <color attach="background" args={["#03020b"]} />

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

      {/* Chapters 001–004: original environment, explicitly gated. */}
      <LegacyEnvironmentGate
        chapterFiveProgressRef={chapterFiveProgressRef}
        chapterSixProgressRef={chapterSixProgressRef}
        chapterFiveActiveRef={chapterFiveActiveRef}
        chapterSixActiveRef={chapterSixActiveRef}
      >
        <NebulaBackdrop progressRef={progressRef} />

        <StarFieldLayers />

        <PersistentStarfield
          progressRef={progressRef}
        />

        <DistantNebula
          progressRef={progressRef}
        />

        <InterstellarDustField
          progressRef={progressRef}
        />

        <SpectralTunnel
          progressRef={progressRef}
        />

        <SpectralReveal
          progressRef={progressRef}
        />

        <PlanetBody
          position={[16, -2, -55]}
        />
      </LegacyEnvironmentGate>

      {/* Chapter 005 — independent image-led temporal environment. */}
      <TemporalEchoField
        progressRef={chapterFiveProgressRef}
        exitProgressRef={chapterSixProgressRef}
      />

      {/* Update the camera before the scene positions its camera-facing transition plates. */}
      <CinematicCamera
        progressRef={progressRef}
        chapterFiveProgressRef={chapterFiveProgressRef}
        chapterSixProgressRef={chapterSixProgressRef}
        chapterFiveActiveRef={chapterFiveActiveRef}
        chapterSixActiveRef={chapterSixActiveRef}
      />

      {/* Chapter 006 — real ASTRA-01 exterior and observatory transition. */}
      <ObservatoryScene
        progressRef={chapterSixProgressRef}
      />
    </>
  );
}
