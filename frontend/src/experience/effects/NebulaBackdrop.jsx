import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(
      sin(dot(p, vec2(127.1, 311.7))) *
      43758.5453123
    );
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(
      mix(a, b, f.x),
      mix(c, d, f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    mat2 rotation = mat2(
      0.8, -0.6,
      0.6, 0.8
    );

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.02 + 17.1;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;

    float time = uTime * 0.012;

    vec2 p = uv * vec2(1.3, 1.1);
    p.x += time;

    vec2 warp = vec2(
      fbm(p * 2.1 + vec2(0.0, time)),
      fbm(p * 2.1 + vec2(6.1, -time * 0.7))
    );

    float clouds = fbm(
      p * 3.0 + (warp - 0.5) * 2.3
    );

    float fineNoise = fbm(
      p * 7.0 - warp * 1.8
    );

    float density = smoothstep(
      0.31,
      0.78,
      clouds * 0.78 + fineNoise * 0.22
    );

    float wave = 0.13 * sin(
      uv.x * 3.0 + time * 3.0
    );

    float band = exp(
      -pow((uv.y - wave - 0.02) * 2.05, 2.0)
    );

    float core = exp(
      -pow((uv.x + 0.27) * 1.8, 2.0)
      -pow((uv.y - 0.12) * 2.2, 2.0)
    );

    float outerCloud = exp(
      -pow((uv.x - 0.35) * 1.4, 2.0)
      -pow((uv.y + 0.12) * 1.5, 2.0)
    );

    float edgeFade = 1.0 - smoothstep(
      0.7,
      1.5,
      length(uv * vec2(0.78, 1.0))
    );

    float haze = (
      band * (0.24 + density * 0.85)
      + core * 0.18 * density
      + outerCloud * 0.12 * density
    ) * edgeFade;

    vec3 violet = vec3(0.22, 0.055, 0.42);
    vec3 blue = vec3(0.05, 0.22, 0.52);
    vec3 cyan = vec3(0.025, 0.43, 0.58);
    vec3 magenta = vec3(0.48, 0.12, 0.38);

    vec3 color = mix(
      violet,
      blue,
      smoothstep(0.25, 0.68, density)
    );

    color = mix(
      color,
      cyan,
      smoothstep(0.58, 0.88, density) * 0.62
    );

    color = mix(
      color,
      magenta,
      smoothstep(0.68, 0.96, fineNoise) * 0.32
    );

    float filaments =
      smoothstep(0.62, 0.88, fineNoise) * band;

    color += cyan * filaments * 0.35;

    float alpha = clamp(
      haze * 0.88,
      0.0,
      0.72
    );

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function NebulaBackdrop() {
  const materialRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value =
        clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 0, -68]}>
      <planeGeometry args={[190, 120]} />

      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}