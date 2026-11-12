
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  uniform float uTime;
  uniform float uPhase;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 p = position;

    float waveA = sin(
      uv.x * 8.0 +
      uv.y * 5.0 +
      uTime * 0.12 +
      uPhase
    );

    float waveB = cos(
      uv.x * 6.0 -
      uv.y * 7.0 +
      uTime * 0.09 +
      uPhase
    );

    p.z += waveA * waveB * 10.0;

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

    for (int i = 0; i < 5; i++) {
      value += noise2(p) * amplitude;

      p = p * 2.02 + 13.7;

      amplitude *= 0.5;
    }

    return value;
  }

  vec3 spectralColor(float t) {
    vec3 violet = vec3(0.42, 0.16, 0.95);
    vec3 blue = vec3(0.12, 0.35, 1.0);
    vec3 cyan = vec3(0.02, 0.82, 1.0);
    vec3 green = vec3(0.08, 1.0, 0.56);
    vec3 yellow = vec3(1.0, 0.88, 0.22);
    vec3 orange = vec3(1.0, 0.42, 0.07);
    vec3 red = vec3(1.0, 0.10, 0.30);

    if (t < 0.166) {
      return mix(
        violet,
        blue,
        smoothstep(0.0, 0.166, t)
      );
    }

    if (t < 0.333) {
      return mix(
        blue,
        cyan,
        smoothstep(0.166, 0.333, t)
      );
    }

    if (t < 0.5) {
      return mix(
        cyan,
        green,
        smoothstep(0.333, 0.5, t)
      );
    }

    if (t < 0.666) {
      return mix(
        green,
        yellow,
        smoothstep(0.5, 0.666, t)
      );
    }

    if (t < 0.833) {
      return mix(
        yellow,
        orange,
        smoothstep(0.666, 0.833, t)
      );
    }

    return mix(
      orange,
      red,
      smoothstep(0.833, 1.0, t)
    );
  }

  void main() {
    vec2 uv = vUv;

    float time = uTime * 0.018;

    float broadCloud = fbm(
      uv * vec2(6.0, 5.0) +
      vec2(time, uPhase)
    );

    float fineCloud = fbm(
      uv * vec2(15.0, 11.0) -
      vec2(uPhase, time * 0.8)
    );

    float channelCoordinate = clamp(
      uv.x + (broadCloud - 0.5) * 0.10,
      0.0,
      0.999
    );

    float channel = floor(
      channelCoordinate * 102.0
    ) / 101.0;

    vec3 color = spectralColor(channel);

    // Large undulating central cloud structure.
    float center = 0.50 +
      0.19 * sin(
        uv.x * 5.0 +
        uPhase +
        time
      ) +
      (broadCloud - 0.5) * 0.12;

    float mainWidth =
      0.19 + fineCloud * 0.10;

    float mainCloud = exp(
      -pow(
        (uv.y - center) / mainWidth,
        2.0
      )
    );

    // Secondary luminous gas structures.
    float secondaryCenter =
      0.24 +
      0.10 * sin(
        uv.x * 8.0 -
        uPhase +
        time * 0.7
      );

    float secondaryCloud = exp(
      -pow(
        (uv.y - secondaryCenter) / 0.18,
        2.0
      )
    );

    float cloudDensity = smoothstep(
      0.28,
      0.86,
      broadCloud
    );

    float filaments = smoothstep(
      0.48,
      0.88,
      fineCloud
    );

    float ellipticalMask =
      1.0 - smoothstep(
        0.40,
        0.78,
        length(
          (uv - 0.5) * vec2(1.0, 1.15)
        )
      );

    float alpha = (
      mainCloud *
      (
        0.19 +
        cloudDensity * 0.36 +
        filaments * 0.18
      ) +
      secondaryCloud * 0.16
    ) * ellipticalMask * uOpacity;

    if (alpha < 0.004) {
      discard;
    }

    float spectralEmission =
      1.0 + cloudDensity * 0.85;

    color *= spectralEmission;

    color +=
      color * filaments * 0.18;

    gl_FragColor = vec4(
      color,
      alpha
    );
  }
`;

function SpectralCloudLayer({
  progressRef,
  position,
  rotation,
  width,
  height,
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

    // This feature continues developing while
    // the Scene 004 typography is on screen.
    const reveal = THREE.MathUtils.smoothstep(
      progress,
      0.82,
      0.94
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
      frustumCulled={false}
      renderOrder={8}
    >
      <planeGeometry
        args={[width, height, 80, 56]}
      />

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

export default function SpectralReveal({
  progressRef,
}) {
  return (
    <group>
      {/* Main luminous celestial structure */}
      <SpectralCloudLayer
        progressRef={progressRef}
        position={[45, 0, -2220]}
        rotation={[0.015, -0.035, 0.015]}
        width={920}
        height={620}
        phase={0.3}
        opacity={0.62}
      />

      {/* Left-hand diffuse cloud structure */}
      <SpectralCloudLayer
        progressRef={progressRef}
        position={[-125, 25, -2350]}
        rotation={[0.12, 0.20, -0.12]}
        width={720}
        height={470}
        phase={1.8}
        opacity={0.40}
      />

      {/* Right-hand flowing cloud structure */}
      <SpectralCloudLayer
        progressRef={progressRef}
        position={[150, -40, -2460]}
        rotation={[-0.10, -0.18, 0.08]}
        width={760}
        height={440}
        phase={3.5}
        opacity={0.34}
      />
    </group>
  );
}