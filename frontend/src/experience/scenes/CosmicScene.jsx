
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import NebulaBackdrop from "../effects/NebulaBackdrop";
import StarFieldLayers from "../effects/StarFieldLayers";
import PlanetBody from "../components/PlanetBody";

// Camera path: a gradual forward journey with a subtle lateral drift.
const CAMERA_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 5),
  new THREE.Vector3(0.35, 0.02, -2.5),
  new THREE.Vector3(1.8, -0.15, -9),
  new THREE.Vector3(4.2, -0.5, -15),
  new THREE.Vector3(6.5, -1.1, -21),
]);

// The camera gradually shifts its gaze towards the planet.
const LOOK_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, -55),
  new THREE.Vector3(1.5, -0.2, -55),
  new THREE.Vector3(3.7, -0.5, -55),
  new THREE.Vector3(7.5, -1.2, -55),
  new THREE.Vector3(10.5, -2, -55),
]);

const CAMERA_LOOK_TARGET = new THREE.Vector3();

function CinematicCamera({ progressRef }) {
  useFrame(({ camera }) => {
    const progress = THREE.MathUtils.clamp(
      progressRef.current,
      0,
      1
    );

    CAMERA_PATH.getPoint(progress, camera.position);

    LOOK_PATH.getPoint(
      progress,
      CAMERA_LOOK_TARGET
    );

    camera.lookAt(CAMERA_LOOK_TARGET);
  });

  return null;
}

export default function CosmicScene({ progressRef }) {
  return (
    <>
      <color
        attach="background"
        args={["#03020b"]}
      />

      {/* Environmental illumination */}
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

      {/* Cosmic environment */}
      <NebulaBackdrop />

      <StarFieldLayers />

      {/* Our existing hero planet remains unchanged */}
      <PlanetBody position={[16, -2, -55]} />

      {/* Scroll-controlled first-person camera */}
      <CinematicCamera progressRef={progressRef} />
    </>
  );
}
