
import { useEffect, useMemo, useRef } from "react";
import {
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import * as THREE from "three";

const PLANET_RADIUS = 18.5;

function createConfiguredTexture(sourceTexture, maxAnisotropy) {
  const texture = sourceTexture.clone();

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.anisotropy = Math.min(16, maxAnisotropy);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

const flameVertexShader = `
  uniform float uTime;
  uniform float uDisplacement;

  varying vec3 vLocalDirection;
  varying vec3 vNormalView;
  varying vec3 vViewPosition;
  varying float vWave;

  void main() {
    vec3 direction = normalize(position);

    float waveA =
      sin(direction.x * 13.0 + uTime * 1.4) *
      cos(direction.y * 9.0 - uTime * 1.1);

    float waveB =
      sin(direction.z * 17.0 - uTime) *
      cos((direction.x + direction.y) * 14.0 + uTime * 0.75);

    float waveC =
      sin((direction.x - direction.z) * 25.0 +
          direction.y * 7.0 + uTime * 1.9);

    float wave = waveA * 0.48 +
                 waveB * 0.34 +
                 waveC * 0.18;

    vec3 displacedPosition =
      position + normal * wave * uDisplacement;

    vec4 mvPosition =
      modelViewMatrix * vec4(displacedPosition, 1.0);

    vLocalDirection = direction;
    vNormalView = normalize(normalMatrix * normal);
    vViewPosition = -mvPosition.xyz;
    vWave = wave;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const flameFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uIntensity;
  uniform float uScale;

  varying vec3 vLocalDirection;
  varying vec3 vNormalView;
  varying vec3 vViewPosition;
  varying float vWave;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
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

    for (int i = 0; i < 4; i++) {
      value += noise3(p) * amplitude;
      p = p * 2.02 + vec3(17.1, 9.2, 13.7);
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec3 normal = normalize(vNormalView);
    vec3 viewDirection = normalize(vViewPosition);

    float facing = max(
      dot(normal, viewDirection),
      0.0
    );

    float fresnel = 1.0 - facing;

    // Concentrate the fire around the planetary edge.
    float edgeBand = smoothstep(
      0.12,
      0.72,
      fresnel
    );

    // Moving turbulence across the spherical corona.
    vec3 p = vLocalDirection * uScale;

    float broadCloud = fbm(
      p + vec3(
        uTime * 0.08,
        -uTime * 0.32,
        uTime * 0.05
      )
    );

    float fineCloud = noise3(
      p * 2.3 + vec3(
        -uTime * 0.12,
        uTime * 0.50,
        uTime * 0.09
      )
    );

    float flameField =
      broadCloud * 0.72 +
      fineCloud * 0.28 +
      abs(vWave) * 0.10;

    // Uneven flame patches instead of a smooth circular outline.
    float flame = smoothstep(
      0.43,
      0.76,
      flameField
    );

    float hotFilaments = smoothstep(
      0.72,
      0.92,
      fineCloud + abs(vWave) * 0.12
    );

    float heat = smoothstep(
      0.48,
      0.82,
      flameField
    );

    // Deep crimson -> ember -> orange -> hot gold.
    vec3 deepEmber = vec3(0.16, 0.006, 0.003);
    vec3 emberRed = vec3(0.62, 0.025, 0.005);
    vec3 burningOrange = vec3(1.0, 0.18, 0.018);
    vec3 hotGold = vec3(1.0, 0.52, 0.12);

    vec3 color = mix(
      deepEmber,
      emberRed,
      smoothstep(0.18, 0.60, flameField)
    );

    color = mix(
      color,
      burningOrange,
      heat * 0.85
    );

    color = mix(
      color,
      hotGold,
      hotFilaments * 0.40
    );

    float pulse =
      0.88 +
      0.12 * sin(
        uTime * 2.4 + vLocalDirection.y * 15.0
      );

    float alpha = edgeBand *
      (0.012 + flame * 0.26 + hotFilaments * 0.08) *
      uIntensity *
      pulse;

    gl_FragColor = vec4(color, alpha);
  }
`;

function FlameCorona({
  radius,
  intensity,
  scale,
  displacement,
}) {
  const materialRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uScale: { value: scale },
      uDisplacement: { value: displacement },
    }),
    [intensity, scale, displacement]
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value =
        clock.elapsedTime;
    }
  });

  return (
    <mesh renderOrder={3}>
      <sphereGeometry args={[radius, 112, 112]} />

      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={flameVertexShader}
        fragmentShader={flameFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function PlanetBody({
  position = [16, -2, -55],
}) {
  const planetRef = useRef(null);
  const { gl } = useThree();

  const sourceTexture = useLoader(
    THREE.TextureLoader,
    "/textures/quaoar-albedo-draft.png"
  );

  const surfaceMap = useMemo(
    () =>
      createConfiguredTexture(
        sourceTexture,
        gl.capabilities.getMaxAnisotropy()
      ),
    [sourceTexture, gl]
  );

  useEffect(() => {
    return () => {
      surfaceMap.dispose();
    };
  }, [surfaceMap]);

  useFrame((_, delta) => {
    if (planetRef.current) {
      // Accelerated cinematic axial rotation.
      planetRef.current.rotation.y += delta * 0.018;
    }
  });

  return (
    <group position={position}>

      {/* Main rotating planetary body */}
      <mesh
        ref={planetRef}
        rotation={[0.09, 0, 0.04]}
        renderOrder={0}
      >
        <sphereGeometry
          args={[PLANET_RADIUS, 192, 192]}
        />

        <meshPhysicalMaterial
          map={surfaceMap}
          roughness={0.94}
          metalness={0}
          clearcoat={0.025}
          clearcoatRoughness={0.95}
        />
      </mesh>

      {/* Close-up turbulent fire */}
      <FlameCorona
        radius={PLANET_RADIUS * 1.035}
        intensity={0.85}
        scale={12}
        displacement={0.30}
      />

      {/* Wider, softer ember wisps */}
      <FlameCorona
        radius={PLANET_RADIUS * 1.105}
        intensity={0.32}
        scale={8.5}
        displacement={0.65}
      />

    </group>
  );
}
