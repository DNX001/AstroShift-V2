import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERTEX_SHADER = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aAlpha;
  attribute vec3 aColor;

  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float depth = max(180.0, -viewPosition.z);
    float twinkle = 0.76 + 0.24 * sin(uTime * aPhase + position.x * 0.002 + position.y * 0.003);
    vColor = aColor;
    vAlpha = aAlpha * twinkle;
    gl_PointSize = clamp(aSize * (420.0 / depth), 0.8, 13.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float r = length(p);
    float core = exp(-r * r * 62.0);
    float halo = exp(-r * r * 15.0);
    float alpha = (core * 0.78 + halo * 0.24) * vAlpha;
    if (alpha < 0.006) discard;
    gl_FragColor = vec4(vColor * (0.7 + core * 1.25), alpha);
  }
`;

const PALETTE = [
  new THREE.Color("#d9e8ff"),
  new THREE.Color("#a9c9ff"),
  new THREE.Color("#d8b8ff"),
  new THREE.Color("#ffe1c7"),
  new THREE.Color("#9ee8ff"),
];

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createStarGeometry() {
  const random = seededRandom(6017);
  const count = 1720;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const alphas = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    const color = PALETTE[Math.floor(random() * PALETTE.length)];

    positions[offset] = (random() - 0.5) * 8800;
    positions[offset + 1] = (random() - 0.5) * 5000;
    positions[offset + 2] = -6400 - random() * 2700;

    sizes[i] = 10 + random() * 35;
    phases[i] = 0.25 + random() * 2.5;
    alphas[i] = 0.16 + random() * 0.58;

    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

export default function ObservatoryStarfield({ progressRef }) {
  const pointsRef = useRef(null);
  const materialRef = useRef(null);

  const geometry = useMemo(() => createStarGeometry(), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    const progress = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
    if (pointsRef.current) {
      pointsRef.current.visible = progress > 0.001;
      pointsRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.012) * 0.002;
      pointsRef.current.rotation.x = Math.cos(clock.elapsedTime * 0.009) * 0.0015;
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
