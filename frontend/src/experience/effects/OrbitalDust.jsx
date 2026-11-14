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
    vec3 animated = position;
    animated.y += sin(uTime * 0.24 + aPhase) * 2.8;
    animated.x += cos(uTime * 0.16 + aPhase * 1.7) * 2.0;

    vec4 viewPosition = modelViewMatrix * vec4(animated, 1.0);
    float depth = max(90.0, -viewPosition.z);
    vColor = aColor;
    vAlpha = aAlpha * (0.78 + 0.22 * sin(uTime * 0.8 + aPhase));
    gl_PointSize = clamp(aSize * (210.0 / depth), 0.8, 18.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float r = length(p);
    float glow = exp(-r * r * 21.0);
    float core = exp(-r * r * 78.0);
    float alpha = (glow * 0.26 + core * 0.68) * vAlpha;
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(vColor * (0.72 + core), alpha);
  }
`;

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createDustGeometry() {
  const random = seededRandom(6226);
  const count = 260;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const alphas = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color("#b9caff"),
    new THREE.Color("#8fdfff"),
    new THREE.Color("#d2b7ff"),
    new THREE.Color("#f5d4b0"),
  ];

  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    const color = palette[Math.floor(random() * palette.length)];
    positions[offset] = (random() - 0.5) * 760;
    positions[offset + 1] = (random() - 0.5) * 480;
    positions[offset + 2] = -250 + random() * 500;
    sizes[i] = 7 + random() * 28;
    phases[i] = random() * Math.PI * 2;
    alphas[i] = 0.07 + random() * 0.27;
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

export default function OrbitalDust({ progressRef }) {
  const pointsRef = useRef(null);
  const materialRef = useRef(null);
  const geometry = useMemo(() => createDustGeometry(), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    const progress = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
    if (pointsRef.current) {
      pointsRef.current.visible = progress > 0.04;
      pointsRef.current.position.set(165, 0, -4200);
      pointsRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.035) * 0.006;
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
