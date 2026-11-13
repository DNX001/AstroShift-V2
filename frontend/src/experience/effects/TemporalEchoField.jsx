import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ENVIRONMENT_URL = "/environments/chapter-005-sky-remembers-master.webp";
const PLATE_Z = -2960;
const PLATE_WIDTH = 2500;
const PLATE_HEIGHT = PLATE_WIDTH / (1672 / 941);

const STAR_VERTEX_SHADER = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aOpacity;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uReveal;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float depth = max(120.0, -viewPosition.z);
    float twinkle = 0.78 + 0.22 * sin(uTime * aPhase + position.x * 0.013 + position.y * 0.017);

    vColor = aColor;
    vOpacity = aOpacity * twinkle * uReveal;
    gl_PointSize = clamp(aSize * (190.0 / depth), 0.8, 15.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const STAR_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float radius = length(point);
    float core = exp(-radius * radius * 54.0);
    float halo = exp(-radius * radius * 13.0);
    float alpha = (core * 0.76 + halo * 0.28) * vOpacity;

    if (alpha < 0.008) discard;

    vec3 color = vColor * (0.72 + core * 0.9);
    gl_FragColor = vec4(color, alpha);
  }
`;

const WAVE_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const WAVE_FRAGMENT_SHADER = `
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float sweep = clamp((uProgress - 0.36) / 0.46, 0.0, 1.0);
    float waveX = mix(-0.22, 1.22, sweep);
    float turbulence = sin(vUv.y * 13.0 + uTime * 0.16) * 0.025
                     + sin(vUv.y * 31.0 - uTime * 0.11) * 0.009;
    float distanceToWave = vUv.x + turbulence - waveX;

    float core = exp(-distanceToWave * distanceToWave * 290.0);
    float halo = exp(-distanceToWave * distanceToWave * 34.0);
    float echo = exp(-(distanceToWave + 0.105) * (distanceToWave + 0.105) * 88.0);
    float verticalTexture = 0.72 + 0.28 * sin(vUv.y * 21.0 + uTime * 0.25);
    float envelope = smoothstep(0.34, 0.43, uProgress)
                   * (1.0 - smoothstep(0.79, 0.89, uProgress));

    float alpha = (core * 0.20 + halo * 0.075 + echo * 0.035)
                * verticalTexture * envelope;

    vec3 violet = vec3(0.40, 0.30, 0.95);
    vec3 cyan = vec3(0.44, 0.82, 1.0);
    vec3 color = mix(violet, cyan, smoothstep(-0.12, 0.18, distanceToWave));

    gl_FragColor = vec4(color, alpha);
  }
`;

const METEOR_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const METEOR_FRAGMENT_SHADER = `
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float verticalDistance = abs(vUv.y - 0.5);
    float softTrail = exp(-verticalDistance * verticalDistance * 260.0);
    float tail = smoothstep(0.02, 0.24, vUv.x)
               * pow(max(vUv.x, 0.001), 1.7)
               * (1.0 - smoothstep(0.82, 1.0, vUv.x));
    float head = exp(-pow((vUv.x - 0.91) * 23.0, 2.0))
                * exp(-verticalDistance * verticalDistance * 390.0);
    float shimmer = 0.92 + 0.08 * sin(uTime * 7.0 + vUv.x * 18.0);
    float alpha = (tail * 0.72 + head * 1.1) * softTrail * uOpacity * shimmer;

    if (alpha < 0.006) discard;

    vec3 color = mix(uColor, vec3(1.0, 0.97, 0.92), clamp(head * 1.6, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
  }
`;

const METEOR_EVENTS = [
  {
    start: 0.105,
    end: 0.205,
    from: [-310, 155, -2550],
    to: [205, -115, -2670],
    rotation: -0.49,
    width: 178,
    height: 4.2,
    color: "#bdeeff",
    intensity: 0.88,
  },
  {
    start: 0.385,
    end: 0.475,
    from: [425, 180, -2780],
    to: [55, -90, -2840],
    rotation: 2.52,
    width: 142,
    height: 3.2,
    color: "#d9c7ff",
    intensity: 0.72,
  },
  {
    start: 0.655,
    end: 0.755,
    from: [-405, -190, -2745],
    to: [155, 115, -2840],
    rotation: 0.48,
    width: 166,
    height: 3.8,
    color: "#b8dcff",
    intensity: 0.82,
  },
  {
    start: 0.855,
    end: 0.925,
    from: [240, 205, -2860],
    to: [-130, -55, -2915],
    rotation: 2.53,
    width: 112,
    height: 2.8,
    color: "#ffe0b8",
    intensity: 0.55,
  },
];

const STAR_PALETTE = [
  new THREE.Color("#d9e9ff"),
  new THREE.Color("#c9b8ff"),
  new THREE.Color("#a8e3ff"),
  new THREE.Color("#ffe0c2"),
];

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createParticleGeometry({ seed, count, x, y, z, size, opacity }) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const opacities = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const paletteColor = STAR_PALETTE[Math.floor(random() * STAR_PALETTE.length)];

    positions[offset] = (random() - 0.5) * x;
    positions[offset + 1] = (random() - 0.5) * y;
    positions[offset + 2] = z[0] + random() * (z[1] - z[0]);

    sizes[index] = size[0] + random() * (size[1] - size[0]);
    phases[index] = 0.35 + random() * 2.8;
    opacities[index] = opacity[0] + random() * (opacity[1] - opacity[0]);

    colors[offset] = paletteColor.r;
    colors[offset + 1] = paletteColor.g;
    colors[offset + 2] = paletteColor.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

function clamp01(value) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function smoothstep01(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export default function TemporalEchoField({ progressRef, exitProgressRef }) {
  const rootRef = useRef(null);
  const plateRef = useRef(null);
  const plateMaterialRef = useRef(null);
  const waveRef = useRef(null);
  const waveMaterialRef = useRef(null);
  const starLayersRef = useRef([]);
  const starMaterialsRef = useRef([]);
  const meteorRefs = useRef([]);
  const meteorMaterialsRef = useRef([]);

  const { gl } = useThree();
  const [environmentTexture, setEnvironmentTexture] = useState(null);

  const particleGeometries = useMemo(
    () => [
      createParticleGeometry({
        seed: 5001,
        count: 780,
        x: 2480,
        y: 1390,
        z: [-2928, -2894],
        size: [5.5, 12.5],
        opacity: [0.28, 0.76],
      }),
      createParticleGeometry({
        seed: 5002,
        count: 320,
        x: 1500,
        y: 850,
        z: [-2820, -2470],
        size: [5.0, 13.5],
        opacity: [0.16, 0.48],
      }),
      createParticleGeometry({
        seed: 5003,
        count: 155,
        x: 520,
        y: 300,
        z: [-2350, -1940],
        size: [10.0, 22.0],
        opacity: [0.055, 0.18],
      }),
    ],
    []
  );

  const starUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
    }),
    []
  );

  const waveUniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
    }),
    []
  );

  const meteorUniforms = useMemo(
    () =>
      METEOR_EVENTS.map((event) => ({
        uOpacity: { value: 0 },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(event.color) },
      })),
    []
  );

  useEffect(() => {
    let disposed = false;
    let loadedTexture = null;
    const loader = new THREE.TextureLoader();

    loader.load(
      ENVIRONMENT_URL,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        texture.needsUpdate = true;
        loadedTexture = texture;
        setEnvironmentTexture(texture);
      },
      undefined,
      (error) => {
        console.error("Chapter 005 environment texture failed to load:", error);
      }
    );

    return () => {
      disposed = true;
      loadedTexture?.dispose();
    };
  }, [gl]);

  useFrame(({ clock }) => {
    const progress = clamp01(progressRef?.current ?? 0);
    const exitProgress = clamp01(exitProgressRef?.current ?? 0);
    const time = clock.elapsedTime;
    const exitFade = 1.0 - smoothstep01(0.0, 0.18, exitProgress);
    const reveal = smoothstep01(0.012, 0.16, progress) * exitFade;

    if (!rootRef.current) return;

    rootRef.current.visible = progress > 0.001 && exitFade > 0.001;
    rootRef.current.rotation.y = Math.sin(time * 0.026) * 0.0028 + (progress - 0.5) * 0.003;
    rootRef.current.rotation.x = Math.sin(time * 0.021) * 0.0018;
    rootRef.current.position.x = Math.sin(time * 0.035) * 5.5 + Math.sin(progress * Math.PI) * 7.0;
    rootRef.current.position.y = Math.cos(time * 0.028) * 2.2;

    if (plateRef.current) {
      plateRef.current.scale.setScalar(1 + progress * 0.025);
      plateRef.current.position.x = Math.sin(time * 0.022) * 4.5 + progress * 7.0;
      plateRef.current.position.y = Math.cos(time * 0.019) * 2.4;
    }

    if (plateMaterialRef.current) {
      plateMaterialRef.current.opacity = reveal;
    }

    // Update shader uniforms through material refs inside the frame loop.
    starMaterialsRef.current.forEach((material) => {
      if (!material) return;
      material.uniforms.uTime.value = time;
      material.uniforms.uReveal.value = reveal;
    });
    starLayersRef.current.forEach((layer, index) => {
      if (!layer) return;
      const drift = index === 0 ? 0.003 : index === 1 ? 0.008 : 0.018;
      layer.rotation.y = Math.sin(time * 0.018 + index) * drift;
      layer.rotation.x = Math.cos(time * 0.014 + index) * drift * 0.55;
      layer.position.x = Math.sin(time * (0.018 + index * 0.009) + index) * (index === 2 ? 5.0 : 2.0);
    });

    if (waveMaterialRef.current) {
      waveMaterialRef.current.uniforms.uProgress.value = progress;
      waveMaterialRef.current.uniforms.uTime.value = time;
      if (waveRef.current) {
        waveRef.current.visible = progress > 0.35 && progress < 0.90;
      }
    }

    METEOR_EVENTS.forEach((event, index) => {
      const mesh = meteorRefs.current[index];
      const material = meteorMaterialsRef.current[index];
      if (!mesh || !material) return;

      const active = progress >= event.start && progress <= event.end;
      mesh.visible = active;
      material.uniforms.uTime.value = time;

      if (!active) {
        material.uniforms.uOpacity.value = 0;
        return;
      }

      const local = clamp01((progress - event.start) / (event.end - event.start));
      const eased = local * local * (3 - 2 * local);
      const envelope = Math.sin(local * Math.PI);

      mesh.position.set(
        THREE.MathUtils.lerp(event.from[0], event.to[0], eased),
        THREE.MathUtils.lerp(event.from[1], event.to[1], eased),
        THREE.MathUtils.lerp(event.from[2], event.to[2], eased)
      );
      material.uniforms.uOpacity.value = envelope * event.intensity * reveal;
    });
  });

  return (
    <group ref={rootRef} visible={false}>
      {/* The approved cinematic environment plate. */}
      <mesh ref={plateRef} position={[0, 0, PLATE_Z]}>
        <planeGeometry args={[PLATE_WIDTH, PLATE_HEIGHT]} />
        <meshBasicMaterial
          ref={plateMaterialRef}
          map={environmentTexture}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Three depth bands create the feeling of travelling into the image. */}
      {particleGeometries.map((geometry, index) => (
        <points
          key={`temporal-stars-${index}`}
          ref={(node) => {
            starLayersRef.current[index] = node;
          }}
          geometry={geometry}
          frustumCulled={false}
        >
          <shaderMaterial
            ref={(node) => {
              starMaterialsRef.current[index] = node;
            }}
            uniforms={starUniforms}
            vertexShader={STAR_VERTEX_SHADER}
            fragmentShader={STAR_FRAGMENT_SHADER}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>
      ))}

      {/* A restrained temporal illumination sweep across the nebula. */}
      <mesh ref={waveRef} position={[0, 0, PLATE_Z + 4]} visible={false}>
        <planeGeometry args={[PLATE_WIDTH, PLATE_HEIGHT]} />
        <shaderMaterial
          ref={waveMaterialRef}
          uniforms={waveUniforms}
          vertexShader={WAVE_VERTEX_SHADER}
          fragmentShader={WAVE_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sparse scroll-triggered meteors at different apparent depths. */}
      {METEOR_EVENTS.map((event, index) => (
        <mesh
          key={`temporal-meteor-${index}`}
          ref={(node) => {
            meteorRefs.current[index] = node;
          }}
          position={event.from}
          rotation={[0, 0, event.rotation]}
          visible={false}
        >
          <planeGeometry args={[event.width, event.height]} />
          <shaderMaterial
            ref={(node) => {
              meteorMaterialsRef.current[index] = node;
            }}
            uniforms={meteorUniforms[index]}
            vertexShader={METEOR_VERTEX_SHADER}
            fragmentShader={METEOR_FRAGMENT_SHADER}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
