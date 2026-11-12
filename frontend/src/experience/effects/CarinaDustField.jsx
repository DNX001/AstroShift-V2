
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function createDustGeometry() {
  const count = 1200;

  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const tints = new Float32Array(count);
  const opacities = new Float32Array(count);
  const seeds = new Float32Array(count);

  // Deterministic random generator.
  let seed = 0x9e3779b9;

  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;

    return (seed >>> 0) / 4294967295;
  }

  for (let i = 0; i < count; i++) {
    const index = i * 3;

    positions[index] =
      28 + (random() - 0.5) * 90;

    positions[index + 1] =
      (random() - 0.5) * 55;

    positions[index + 2] =
      -70 - random() * 145;

    sizes[i] = 0.7 + random() * 2.8;
    tints[i] = random();
    opacities[i] = 0.10 + random() * 0.28;
    seeds[i] = random() * Math.PI * 2;
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
    "aTint",
    new THREE.BufferAttribute(tints, 1)
  );

  geometry.setAttribute(
    "aOpacity",
    new THREE.BufferAttribute(opacities, 1)
  );

  geometry.setAttribute(
    "aSeed",
    new THREE.BufferAttribute(seeds, 1)
  );

  geometry.computeBoundingSphere();

  return geometry;
}

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;

  attribute float aSize;
  attribute float aTint;
  attribute float aOpacity;
  attribute float aSeed;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec3 particlePosition = position;

    // Very subtle drifting motion.
    particlePosition.x +=
      sin(uTime * 0.18 + aSeed) * 0.32;

    particlePosition.y +=
      cos(uTime * 0.13 + aSeed * 1.7) * 0.26;

    vec4 mvPosition =
      modelViewMatrix *
      vec4(particlePosition, 1.0);

    float depth = max(2.0, -mvPosition.z);

    gl_PointSize = clamp(
      aSize * (300.0 / depth),
      1.0,
      14.0
    );

    gl_Position =
      projectionMatrix * mvPosition;

    vec3 coolDust = vec3(0.40, 0.62, 0.88);
    vec3 warmDust = vec3(1.0, 0.48, 0.25);

    vColor = mix(
      coolDust,
      warmDust,
      aTint
    );

    // Reveal the dust as the camera approaches the nebula.
    float reveal = smoothstep(
      0.48,
      0.67,
      uProgress
    );

    vOpacity = aOpacity * reveal;
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec2 point = gl_PointCoord - 0.5;

    float radius = length(point) * 2.0;

    float softEdge =
      1.0 - smoothstep(0.08, 1.0, radius);

    float centralGlow =
      exp(-radius * radius * 8.0);

    float alpha =
      softEdge *
      (0.22 + centralGlow * 0.18) *
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

export default function CarinaDustField({
  progressRef,
}) {
  const materialRef = useRef(null);

  const geometry = useMemo(
    () => createDustGeometry(),
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
      geometry={geometry}
      frustumCulled={false}
      renderOrder={2}
    >
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
