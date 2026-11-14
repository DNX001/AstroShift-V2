import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float verticalDistance = abs(vUv.y - 0.5);
    float widthFalloff = exp(-verticalDistance * verticalDistance * 250.0);
    float tail = smoothstep(0.01, 0.24, vUv.x)
               * pow(max(vUv.x, 0.001), 1.45)
               * (1.0 - smoothstep(0.82, 1.0, vUv.x));
    float head = exp(-pow((vUv.x - 0.91) * 25.0, 2.0))
               * exp(-verticalDistance * verticalDistance * 420.0);
    float shimmer = 0.9 + 0.1 * sin(uTime * 8.0 + vUv.x * 24.0);
    float alpha = (tail * 0.66 + head * 1.12) * widthFalloff * uOpacity * shimmer;

    if (alpha < 0.006) discard;

    vec3 color = mix(uColor, vec3(1.0, 0.98, 0.94), clamp(head * 1.7, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
  }
`;

const EVENTS = [
  {
    start: 0.13,
    end: 0.205,
    from: [-460, 245, -3930],
    to: [-40, 38, -4020],
    rotation: -0.46,
    width: 176,
    height: 4.2,
    color: "#a9ddff",
    intensity: 0.78,
  },
  {
    start: 0.48,
    end: 0.555,
    from: [380, 190, -4240],
    to: [30, -30, -4310],
    rotation: 2.7,
    width: 142,
    height: 3.4,
    color: "#d5c0ff",
    intensity: 0.7,
  },
  {
    start: 0.79,
    end: 0.875,
    from: [-310, -220, -4110],
    to: [160, 42, -4220],
    rotation: 0.5,
    width: 162,
    height: 3.8,
    color: "#ffe0bd",
    intensity: 0.62,
  },
];

export default function ShootingStars({ progressRef }) {
  const meshRefs = useRef([]);
  const materialRefs = useRef([]);

  useFrame(({ clock }) => {
    const progress = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    const time = clock.elapsedTime;

    EVENTS.forEach((event, index) => {
      const mesh = meshRefs.current[index];
      const material = materialRefs.current[index];
      if (!mesh || !material) return;

      const active = progress >= event.start && progress <= event.end;
      mesh.visible = active;
      material.uniforms.uTime.value = time;

      if (!active) {
        material.uniforms.uOpacity.value = 0;
        return;
      }

      const local = THREE.MathUtils.clamp(
        (progress - event.start) / (event.end - event.start),
        0,
        1
      );
      const eased = local * local * (3 - 2 * local);
      const envelope = Math.sin(local * Math.PI);

      mesh.position.set(
        THREE.MathUtils.lerp(event.from[0], event.to[0], eased),
        THREE.MathUtils.lerp(event.from[1], event.to[1], eased),
        THREE.MathUtils.lerp(event.from[2], event.to[2], eased)
      );

      material.uniforms.uOpacity.value = envelope * event.intensity;
    });
  });

  return (
    <>
      {EVENTS.map((event, index) => (
        <mesh
          key={`observatory-shooting-star-${index}`}
          ref={(node) => {
            meshRefs.current[index] = node;
          }}
          position={event.from}
          rotation={[0, 0, event.rotation]}
          visible={false}
        >
          <planeGeometry args={[event.width, event.height]} />
          <shaderMaterial
            ref={(node) => {
              materialRefs.current[index] = node;
            }}
            uniforms={{
              uOpacity: { value: 0 },
              uTime: { value: 0 },
              uColor: { value: new THREE.Color(event.color) },
            }}
            vertexShader={VERTEX_SHADER}
            fragmentShader={FRAGMENT_SHADER}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}
