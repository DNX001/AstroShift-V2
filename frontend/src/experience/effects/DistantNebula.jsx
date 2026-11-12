
import { useEffect, useMemo, useRef } from "react";
import {
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import * as THREE from "three";

const NEBULA_CENTER = [0, 0, -1080];

const REVEAL_START = 0.39;
const REVEAL_END = 0.54;

function createNebulaTexture(
  sourceTexture,
  maxAnisotropy
) {
  const texture = sourceTexture.clone();

  texture.colorSpace = THREE.SRGBColorSpace;

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.anisotropy = Math.min(
    12,
    maxAnisotropy
  );

  texture.generateMipmaps = true;

  texture.minFilter =
    THREE.LinearMipmapLinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  texture.needsUpdate = true;

  return texture;
}

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

  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;

  varying vec2 vUv;

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

  float fbm2(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += noise2(p) * amplitude;

      p = p * 2.03 + 13.7;

      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = uUvOffset + vUv * uUvScale;

    float flow = fbm2(
      vUv * vec2(13.0, 8.0) +
      vec2(uTime * 0.008, -uTime * 0.005)
    );

    uv += vec2(
      (flow - 0.5) * 0.006,
      (
        noise2(vUv * 16.0 + uTime * 0.004) -
        0.5
      ) * 0.005
    );

    uv.x = fract(uv.x);
    uv.y = clamp(uv.y, 0.001, 0.999);

    vec3 source = texture2D(uMap, uv).rgb;

    float luminance = dot(
      source,
      vec3(0.2126, 0.7152, 0.0722)
    );

    float highest = max(
      source.r,
      max(source.g, source.b)
    );

    float lowest = min(
      source.r,
      min(source.g, source.b)
    );

    float chroma =
      (highest - lowest) /
      max(highest, 0.001);

    float cloudMask =
      smoothstep(0.045, 0.22, luminance) *
      smoothstep(0.025, 0.14, chroma);

    float structure = fbm2(
      vUv * vec2(17.0, 10.0) +
      vec2(uTime * 0.006, uTime * 0.003)
    );

    float cloudDensity =
      cloudMask *
      mix(
        0.46,
        1.0,
        smoothstep(0.12, 0.82, structure)
      );

    float filaments =
      smoothstep(0.52, 0.88, structure) *
      cloudMask *
      0.20;

    float alpha = clamp(
      (cloudDensity + filaments) * uOpacity,
      0.0,
      0.90
    );

    if (alpha < 0.006) discard;

    vec3 color = source * 1.18;

    color += source *
      smoothstep(0.62, 0.95, luminance) *
      0.12;

    gl_FragColor = vec4(color, alpha);
  }
`;

function NebulaLobe({
  texture,
  progressRef,
  position,
  scale,
  rotation = [0, 0, 0],
  uvScale,
  uvOffset,
  opacity,
}) {
  const materialRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uUvScale: {
        value: new THREE.Vector2(
          uvScale[0],
          uvScale[1]
        ),
      },
      uUvOffset: {
        value: new THREE.Vector2(
          uvOffset[0],
          uvOffset[1]
        ),
      },
    }),
    [texture, uvScale, uvOffset]
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    const progress = THREE.MathUtils.clamp(
      progressRef.current,
      0,
      1
    );

    const reveal = THREE.MathUtils.smoothstep(
      progress,
      REVEAL_START,
      REVEAL_END
    );

    materialRef.current.uniforms.uTime.value =
      clock.elapsedTime;

    materialRef.current.uniforms.uOpacity.value =
      opacity * reveal;
  });

  return (
    <mesh
      position={position}
      scale={scale}
      rotation={rotation}
      renderOrder={-5}
    >
      <sphereGeometry args={[1, 128, 96]} />

      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthTest
        depthWrite={false}
        side={THREE.FrontSide}
        blending={THREE.NormalBlending}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}

export default function DistantNebula({
  progressRef,
}) {
  const sourceTexture = useLoader(
    THREE.TextureLoader,
    "/environments/astroshift-nebula-environment-draft.png"
  );

  const { gl } = useThree();

  const texture = useMemo(
    () =>
      createNebulaTexture(
        sourceTexture,
        gl.capabilities.getMaxAnisotropy()
      ),
    [sourceTexture, gl]
  );

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <group
      position={NEBULA_CENTER}
      rotation={[0, -0.18, 0.025]}
    >
      <NebulaLobe
        texture={texture}
        progressRef={progressRef}
        position={[0, 0, 0]}
        scale={[240, 155, 85]}
        uvScale={[1.0, 0.92]}
        uvOffset={[0.25, 0.04]}
        opacity={0.95}
      />

      <NebulaLobe
        texture={texture}
        progressRef={progressRef}
        position={[-135, 35, 22]}
        scale={[145, 108, 76]}
        rotation={[0.04, 0.18, -0.08]}
        uvScale={[0.68, 0.82]}
        uvOffset={[0.10, 0.06]}
        opacity={0.58}
      />

      <NebulaLobe
        texture={texture}
        progressRef={progressRef}
        position={[145, -28, -30]}
        scale={[160, 100, 70]}
        rotation={[-0.05, -0.16, 0.06]}
        uvScale={[0.62, 0.78]}
        uvOffset={[0.38, 0.11]}
        opacity={0.62}
      />
    </group>
  );
}
