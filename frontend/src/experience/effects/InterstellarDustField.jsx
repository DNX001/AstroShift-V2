
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function createDustGeometry() {
  const count = 3200;

  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const tints = new Float32Array(count);
  const opacities = new Float32Array(count);
  const seeds = new Float32Array(count);

  let seed = 0x9e3779b9;

  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;

    return (seed >>> 0) / 4294967295;
  }

  const clusters = [
    {
      x: -105,
      y: 18,
      z: -620,
      spreadX: 150,
      spreadY: 100,
      spreadZ: 160,
    },
    {
      x: 75,
      y: -25,
      z: -800,
      spreadX: 190,
      spreadY: 120,
      spreadZ: 180,
    },
    {
      x: 0,
      y: 35,
      z: -955,
      spreadX: 210,
      spreadY: 130,
      spreadZ: 130,
    },
  ];

  for (let i = 0; i < count; i++) {
    const index = i * 3;

    const cluster =
      clusters[i % clusters.length];

    positions[index] =
      cluster.x +
      (random() - 0.5) * cluster.spreadX;

    positions[index + 1] =
      cluster.y +
      (random() - 0.5) * cluster.spreadY;

    positions[index + 2] =
      cluster.z +
      (random() - 0.5) * cluster.spreadZ;

    sizes[i] = 0.7 + random() * 3.2;
    tints[i] = random();
    opacities[i] = 0.07 + random() * 0.20;
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

    particlePosition.x +=
      sin(uTime * 0.15 + aSeed) * 0.42;

    particlePosition.y +=
      cos(uTime * 0.12 + aSeed * 1.7) * 0.32;

    particlePosition.z +=
      sin(uTime * 0.09 + aSeed) * 0.28;

    vec4 mvPosition =
      modelViewMatrix *
      vec4(particlePosition, 1.0);

    float depth = max(2.0, -mvPosition.z);

    gl_PointSize = clamp(
      aSize * (420.0 / depth),
      0.75,
      15.0
    );

    gl_Position =
      projectionMatrix * mvPosition;

    vec3 coolDust = vec3(0.36, 0.55, 0.85);
    vec3 warmDust = vec3(0.96, 0.48, 0.27);
    vec3 violetDust = vec3(0.61, 0.40, 0.90);

    vColor = mix(coolDust, warmDust, aTint);

    vColor = mix(
      vColor,
      violetDust,
      smoothstep(0.72, 0.98, aTint) * 0.40
    );

    // Dust emerges before the Scene 003 text.
    float reveal = smoothstep(
      0.44,
      0.62,
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
      (0.22 + centralGlow * 0.22) *
      vOpacity;

    if (alpha < 0.004) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function InterstellarDustField({
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
