
import { useMemo, useRef } from "react";
import {
  useFrame,
  useThree,
} from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec3 vDirection;

  void main() {
    vDirection = position;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uNebulaBlend;

  varying vec3 vDirection;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yxz + 33.33);

    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash31(i);
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));

    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

    float x00 = mix(n000, n100, f.x);
    float x10 = mix(n010, n110, f.x);
    float x01 = mix(n001, n101, f.x);
    float x11 = mix(n011, n111, f.x);

    return mix(
      mix(x00, x10, f.y),
      mix(x01, x11, f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {
      value += noise3(p) * amplitude;

      p = p * 2.02 + vec3(17.1, 9.2, 13.7);

      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    float time = uTime * 0.012;

    vec3 direction = normalize(vDirection);
    vec3 p = direction * 3.0;

    // Domain warping creates irregular cosmic structures.
    vec3 warp = vec3(
      fbm(p * 1.8 + vec3(time, 0.0, 0.0)),
      fbm(p * 1.8 + vec3(12.3, -time, 4.7)),
      fbm(p * 1.8 + vec3(5.1, 8.2, time))
    );

    float broadCloud = fbm(
      p * 2.7 + (warp - 0.5) * 2.2
    );

    float fineCloud = fbm(
      p * 6.2 + (warp - 0.5) * 3.4
    );

    float violetCloud = smoothstep(
      0.38,
      0.76,
      broadCloud
    );

    float cyanCloud = smoothstep(
      0.57,
      0.89,
      fineCloud
    );

    float blueCloud = smoothstep(
      0.48,
      0.82,
      broadCloud + fineCloud * 0.12
    );

    float magentaCloud = smoothstep(
      0.52,
      0.86,
      broadCloud + fineCloud * 0.08
    );

    // Original black, violet and blue palette.
    vec3 deepSpace = vec3(0.003, 0.004, 0.014);
    vec3 indigo = vec3(0.014, 0.016, 0.055);
    vec3 violet = vec3(0.065, 0.025, 0.135);
    vec3 magenta = vec3(0.12, 0.025, 0.105);
    vec3 cyan = vec3(0.012, 0.055, 0.105);
    vec3 blue = vec3(0.018, 0.045, 0.12);

    vec3 color = mix(
      deepSpace,
      indigo,
      broadCloud * 0.75
    );

    color += violet * violetCloud * 0.62;
    color += magenta * magentaCloud * 0.18;
    color += cyan * cyanCloud * 0.24;
    color += blue * blueCloud * 0.24;

    // Retain the original environment while allowing
    // the distant nebula to become the main attraction.
    float backgroundDim =
      1.0 - uNebulaBlend * 0.16;

    color *= backgroundDim;

    // Keep the environment dark and cinematic.
    color = min(
      color,
      vec3(0.20, 0.15, 0.28)
    );

    // Always opaque: this is the background, not a
    // transparent sphere placed over the planet.
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function NebulaBackdrop({
  progressRef,
}) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);

  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNebulaBlend: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) {
      return;
    }

    const progress = THREE.MathUtils.clamp(
      progressRef?.current ?? 0,
      0,
      1
    );

    // The original environment follows the camera.
    // We can travel indefinitely without leaving it.
    meshRef.current.position.copy(camera.position);

    materialRef.current.uniforms.uTime.value =
      clock.elapsedTime;

    materialRef.current.uniforms.uNebulaBlend.value =
      THREE.MathUtils.smoothstep(
        progress,
        0.68,
        0.96
      );
  });

  return (
    <mesh
      ref={meshRef}
      frustumCulled={false}
      renderOrder={-1000}
    >
      <sphereGeometry args={[480, 128, 96]} />

      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthTest={false}
        depthWrite={false}
        transparent={false}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}
