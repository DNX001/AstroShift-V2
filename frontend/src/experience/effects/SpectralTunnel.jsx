
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CHANNEL_COUNT = 102;

const vertexShader = `
  uniform float uTime;
  uniform float uPhase;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 p = position;

    float waveA = sin(
      uv.x * 9.0 +
      uv.y * 5.0 +
      uTime * 0.14 +
      uPhase
    );

    float waveB = cos(
      uv.x * 6.0 -
      uv.y * 8.0 -
      uTime * 0.10 +
      uPhase
    );

    p.z += waveA * waveB * 11.0;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(p, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uPhase;
  uniform float uOpacity;

  varying vec2 vUv;

  const float CHANNEL_COUNT = ${CHANNEL_COUNT.toFixed(1)};
  const float TAU = 6.28318530718;

  float hash21(vec2 p) {
    return fract(
      sin(dot(p, vec2(127.1, 311.7))) *
      43758.5453
    );
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(
      mix(a, b, f.x),
      mix(c, d, f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += noise2(p) * amplitude;

      p = p * 2.03 + 13.7;

      amplitude *= 0.5;
    }

    return value;
  }

  vec3 spectralColor(float t) {
    vec3 violet = vec3(0.38, 0.15, 0.96);
    vec3 blue = vec3(0.10, 0.32, 1.00);
    vec3 cyan = vec3(0.03, 0.78, 1.00);
    vec3 green = vec3(0.10, 1.00, 0.58);
    vec3 yellow = vec3(1.00, 0.90, 0.25);
    vec3 orange = vec3(1.00, 0.46, 0.08);
    vec3 red = vec3(1.00, 0.12, 0.34);

    if (t < 0.166) {
      return mix(violet, blue, smoothstep(0.0, 0.166, t));
    }

    if (t < 0.333) {
      return mix(blue, cyan, smoothstep(0.166, 0.333, t));
    }

    if (t < 0.5) {
      return mix(cyan, green, smoothstep(0.333, 0.5, t));
    }

    if (t < 0.666) {
      return mix(green, yellow, smoothstep(0.5, 0.666, t));
    }

    if (t < 0.833) {
      return mix(yellow, orange, smoothstep(0.666, 0.833, t));
    }

    return mix(orange, red, smoothstep(0.833, 1.0, t));
  }

  void main() {
    vec2 uv = vUv;

    float time = uTime * 0.018;

    float broadNoise = fbm(
      uv * vec2(7.0, 5.0) +
      vec2(time, uPhase)
    );

    float fineNoise = fbm(
      uv * vec2(15.0, 10.0) -
      vec2(uPhase, time * 0.7)
    );

    float warp =
      (broadNoise - 0.5) * 0.12;

    float spectralCoordinate = clamp(
      uv.x + warp,
      0.0,
      0.999
    );

    float channelIndex =
      floor(spectralCoordinate * CHANNEL_COUNT) /
      (CHANNEL_COUNT - 1.0);

    vec3 color = spectralColor(channelIndex);

    float center = 0.50 +
      0.15 * sin(uv.x * 7.0 + uPhase + time) +
      (broadNoise - 0.5) * 0.15;

    float cloudWidth =
      0.24 + fineNoise * 0.10;

    float mainBand = exp(
      -pow((uv.y - center) / cloudWidth, 2.0)
    );

    float secondaryCenter =
      0.25 +
      0.08 * sin(
        uv.x * 9.0 - uPhase + time * 0.7
      );

    float secondaryBand = exp(
      -pow(
        (uv.y - secondaryCenter) / 0.17,
        2.0
      )
    );

    float cloudDensity = smoothstep(
      0.25,
      0.83,
      broadNoise
    );

    float wisps = smoothstep(
      0.43,
      0.82,
      fineNoise
    );

    float mainAlpha =
      mainBand *
      (
        0.18 +
        cloudDensity * 0.34 +
        wisps * 0.16
      );

    float secondaryAlpha =
      secondaryBand *
      (
        0.035 +
        cloudDensity * 0.12
      );

    float edgeFade =
      smoothstep(0.0, 0.045, uv.y) *
      (
        1.0 -
        smoothstep(0.955, 1.0, uv.y)
      );

    float alpha = (
      mainAlpha +
      secondaryAlpha
    ) * edgeFade * uOpacity;

    if (alpha < 0.003) discard;

    float channelTexture =
      0.94 +
      0.06 * sin(
        uv.x * CHANNEL_COUNT * TAU +
        uPhase
      );

    color *= channelTexture;
    color *= 1.15 + cloudDensity * 0.75;

    gl_FragColor = vec4(color, alpha);
  }
`;

function SpectralSheet({
  progressRef,
  position,
  rotation,
  phase,
  opacity,
}) {
  const materialRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: phase },
      uOpacity: { value: 0 },
    }),
    [phase]
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    const progress = THREE.MathUtils.clamp(
      progressRef.current,
      0,
      1
    );

    // Reveal the original spectral effect shortly
    // before the fourth chapter becomes active.
    const reveal = THREE.MathUtils.smoothstep(
      progress,
      0.80,
      0.87
    );

    materialRef.current.uniforms.uTime.value =
      clock.elapsedTime;

    materialRef.current.uniforms.uOpacity.value =
      opacity * reveal;
  });

  return (
    <mesh
      position={position}
      rotation={rotation}
      renderOrder={5}
      frustumCulled={false}
    >
      <planeGeometry args={[2200, 1300, 96, 64]} />

      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthTest
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}

export default function SpectralTunnel({
  progressRef,
}) {
  return (
    <group>
      <SpectralSheet
        progressRef={progressRef}
        position={[0, 0, -1160]}
        rotation={[0.025, -0.035, 0.015]}
        phase={0.1}
        opacity={0.52}
      />

      <SpectralSheet
        progressRef={progressRef}
        position={[35, -12, -1440]}
        rotation={[-0.035, 0.055, -0.025]}
        phase={1.4}
        opacity={0.38}
      />

      <SpectralSheet
        progressRef={progressRef}
        position={[-28, 18, -1740]}
        rotation={[0.045, -0.025, 0.035]}
        phase={2.8}
        opacity={0.32}
      />

      <SpectralSheet
        progressRef={progressRef}
        position={[0, 0, -2040]}
        rotation={[-0.025, 0.025, -0.02]}
        phase={4.1}
        opacity={0.28}
      />
    </group>
  );
}