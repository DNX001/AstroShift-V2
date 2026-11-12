
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const STAR_COUNT = 22000;

const STAR_COLORS = [
  "#ffffff",
  "#d8eaff",
  "#91c8ff",
  "#b9afff",
  "#ffe2ca",
];

function createPersistentStarGeometry() {
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const colors = new Float32Array(STAR_COUNT * 3);
  const opacities = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);

  let seed = 0x73a9b521;

  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;

    return (seed >>> 0) / 4294967295;
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    const index = i * 3;

    // Full 3D corridor covering the cinematic journey.
    positions[index] =
      (random() - 0.5) * 3800;

    positions[index + 1] =
      (random() - 0.5) * 2400;

    positions[index + 2] =
      -180 - random() * 4300;

    sizes[i] =
      1.0 + random() * 2.4;

    opacities[i] =
      0.42 + random() * 0.52;

    phases[i] =
      random() * Math.PI * 2;

    const paletteIndex = Math.floor(
      random() * STAR_COLORS.length
    );

    const color = new THREE.Color(
      STAR_COLORS[paletteIndex]
    );

    const brightness =
      0.82 + random() * 0.22;

    color.multiplyScalar(brightness);

    colors[index] = color.r;
    colors[index + 1] = color.g;
    colors[index + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    "aSize",
    new THREE.BufferAttribute(sizes, 1)
  );

  geometry.setAttribute(
    "aColor",
    new THREE.BufferAttribute(colors, 3)
  );

  geometry.setAttribute(
    "aOpacity",
    new THREE.BufferAttribute(opacities, 1)
  );

  geometry.setAttribute(
    "aPhase",
    new THREE.BufferAttribute(phases, 1)
  );

  geometry.computeBoundingSphere();

  return geometry;
}

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;

  attribute float aSize;
  attribute vec3 aColor;
  attribute float aOpacity;
  attribute float aPhase;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec3 particlePosition = position;

    // Subtle stellar movement.
    particlePosition.x +=
      sin(aPhase + uTime * 0.018) * 0.20;

    particlePosition.y +=
      cos(aPhase * 1.4 + uTime * 0.014) * 0.16;

    vec4 mvPosition =
      modelViewMatrix *
      vec4(particlePosition, 1.0);

    float depth = max(1.0, -mvPosition.z);

    gl_PointSize = clamp(
      aSize * (1450.0 / depth),
      1.0,
      5.5
    );

    gl_Position =
      projectionMatrix * mvPosition;

    vColor = aColor;

    float twinkle =
      0.80 +
      0.20 * sin(uTime * 1.15 + aPhase);

    // Subtle in the opening, more noticeable later.
    float journeyIntensity = mix(
      0.34,
      0.92,
      smoothstep(0.30, 0.72, uProgress)
    );

    vOpacity =
      aOpacity * twinkle * journeyIntensity;
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec2 point = gl_PointCoord - 0.5;

    float radius = length(point) * 2.0;

    float core =
      exp(-radius * radius * 18.0);

    float halo =
      1.0 - smoothstep(0.06, 1.0, radius);

    float alpha =
      (core * 0.68 + halo * 0.28) *
      vOpacity;

    if (alpha < 0.004) {
      discard;
    }

    gl_FragColor = vec4(
      vColor,
      alpha
    );
  }
`;

export default function PersistentStarfield({
  progressRef,
}) {
  const pointsRef = useRef(null);
  const materialRef = useRef(null);

  const geometry = useMemo(
    () => createPersistentStarGeometry(),
    []
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value =
      clock.elapsedTime;

    materialRef.current.uniforms.uProgress.value =
      THREE.MathUtils.clamp(
        progressRef.current,
        0,
        1
      );
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      frustumCulled={false}
      renderOrder={-28}
    >
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthTest
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
