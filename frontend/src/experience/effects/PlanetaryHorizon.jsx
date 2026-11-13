import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const EARTH_ASSET_ROOT = "/environments/earth";
const EARTH_TEXTURE_URLS = {
  day: `${EARTH_ASSET_ROOT}/earth-day-bmng.jpg`,
  night: `${EARTH_ASSET_ROOT}/earth-night-blackmarble.jpg`,
  clouds: `${EARTH_ASSET_ROOT}/earth-clouds-alpha.png`,
  specular: `${EARTH_ASSET_ROOT}/earth-water-specular.jpg`,
};

const EARTH_CENTER = [0, -1740, -5850];
const EARTH_RADIUS = 1780;
const CLOUD_RADIUS = EARTH_RADIUS * 1.006;
const ATMOSPHERE_RADIUS = EARTH_RADIUS * 1.022;

const EARTH_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const EARTH_FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uSpecularMap;
  uniform vec3 uSunDirection;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 sunDirection = normalize(uSunDirection);

    float daylight = dot(normal, sunDirection);
    float dayBlend = smoothstep(-0.20, 0.16, daylight);

    vec3 dayColor = texture2D(uDayMap, vUv).rgb;
    vec3 nightColor = texture2D(uNightMap, vUv).rgb;

    float diffuse = 0.18 + 0.92 * max(daylight, 0.0);
    dayColor *= diffuse;
    nightColor *= 1.28;

    vec3 surfaceColor = mix(nightColor, dayColor, dayBlend);

    // The specular mask is bright over water, so highlights stay off land.
    float waterMask = texture2D(uSpecularMap, vUv).r;
    vec3 halfDirection = normalize(sunDirection + viewDirection);
    float oceanGlint = pow(max(dot(normal, halfDirection), 0.0), 54.0)
                     * waterMask * dayBlend * 0.14;
    surfaceColor += vec3(0.42, 0.63, 0.92) * oceanGlint;

    // A restrained blue terminator separates day and night without a hard edge.
    float terminator = exp(-abs(daylight) * 20.0) * 0.075;
    surfaceColor += vec3(0.035, 0.16, 0.48) * terminator;

    // Very subtle slow surface glint variation; geography remains fixed to the map.
    float glintVariation = 0.985 + 0.015 * sin(uTime * 0.18 + vUv.x * 8.0);
    surfaceColor *= glintVariation;

    gl_FragColor = vec4(surfaceColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const CLOUD_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const CLOUD_FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D uCloudMap;
  uniform vec3 uSunDirection;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 sunDirection = normalize(uSunDirection);

    vec2 cloudUv = vec2(fract(vUv.x + uTime * 0.000018), vUv.y);
    vec4 cloudSample = texture2D(uCloudMap, cloudUv);
    float cloudDensity = cloudSample.a * max(
      cloudSample.r,
      max(cloudSample.g, cloudSample.b)
    );

    float daylight = dot(normal, sunDirection);
    float sunlitCloud = smoothstep(-0.24, 0.10, daylight);
    float cloudLighting = 0.26 + 0.74 * max(daylight, 0.0);
    float viewRim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 1.15);

    vec3 shadowCloud = vec3(0.28, 0.37, 0.53);
    vec3 sunlitCloudColor = vec3(0.90, 0.95, 1.0);
    vec3 cloudColor = mix(shadowCloud, sunlitCloudColor, sunlitCloud);
    cloudColor *= cloudLighting;

    float alpha = cloudDensity * 0.76 * (0.58 + 0.42 * sunlitCloud);
    alpha *= 0.92 + viewRim * 0.08;
    if (alpha < 0.008) discard;

    gl_FragColor = vec4(cloudColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ATMOSPHERE_VERTEX_SHADER = `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const ATMOSPHERE_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 4.0);
    float alpha = clamp(rim * 0.54, 0.0, 0.38);
    vec3 color = mix(
      vec3(0.025, 0.12, 0.42),
      vec3(0.20, 0.62, 1.0),
      smoothstep(0.12, 0.92, rim)
    );

    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function configureTexture(texture, gl, colorSpace = THREE.NoColorSpace) {
  texture.colorSpace = colorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  return texture;
}

export default function PlanetaryHorizon() {
  const earthRef = useRef(null);
  const earthMaterialRef = useRef(null);
  const cloudsRef = useRef(null);
  const cloudsMaterialRef = useRef(null);
  const atmosphereRef = useRef(null);

  const [earthTextures, setEarthTextures] = useState(null);
  const { gl } = useThree();

  const sunDirection = useMemo(
    () => new THREE.Vector3(-0.48, 0.22, 0.85).normalize(),
    []
  );

  const earthUniforms = useMemo(() => {
    if (!earthTextures) return null;
    return {
      uDayMap: { value: earthTextures.day },
      uNightMap: { value: earthTextures.night },
      uSpecularMap: { value: earthTextures.specular },
      uSunDirection: { value: sunDirection },
      uTime: { value: 0 },
    };
  }, [earthTextures, sunDirection]);

  const cloudUniforms = useMemo(() => {
    if (!earthTextures) return null;
    return {
      uCloudMap: { value: earthTextures.clouds },
      uSunDirection: { value: sunDirection },
      uTime: { value: 0 },
    };
  }, [earthTextures, sunDirection]);

  useEffect(() => {
    let disposed = false;
    const loader = new THREE.TextureLoader();
    let loaded = [];

    Promise.all([
      loader.loadAsync(EARTH_TEXTURE_URLS.day),
      loader.loadAsync(EARTH_TEXTURE_URLS.night),
      loader.loadAsync(EARTH_TEXTURE_URLS.clouds),
      loader.loadAsync(EARTH_TEXTURE_URLS.specular),
    ])
      .then(([day, night, clouds, specular]) => {
        loaded = [day, night, clouds, specular];
        if (disposed) {
          loaded.forEach((texture) => texture.dispose());
          return;
        }

        configureTexture(day, gl, THREE.SRGBColorSpace);
        configureTexture(night, gl, THREE.SRGBColorSpace);
        configureTexture(clouds, gl, THREE.NoColorSpace);
        configureTexture(specular, gl, THREE.NoColorSpace);
        clouds.wrapS = THREE.RepeatWrapping;
        clouds.wrapT = THREE.ClampToEdgeWrapping;
        clouds.needsUpdate = true;

        setEarthTextures({ day, night, clouds, specular });
      })
      .catch((error) => {
        console.error("Chapter 006 Earth texture set failed to load:", error);
      });

    return () => {
      disposed = true;
      loaded.forEach((texture) => texture.dispose());
    };
  }, [gl]);


  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    // Earth rotates independently of scroll progress and spacecraft motion.
    // The rate is intentionally almost imperceptible in this final wide shot.
    const earthRotation = -0.12 + time * 0.00008;

    if (earthRef.current) {
      earthRef.current.rotation.y = earthRotation;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = earthRotation + 0.0025 + time * 0.000025;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = earthRotation;
    }

    if (earthMaterialRef.current) {
      earthMaterialRef.current.uniforms.uTime.value = time;
    }
    if (cloudsMaterialRef.current) {
      cloudsMaterialRef.current.uniforms.uTime.value = time;
    }
  });

  return (
    <group>
      {/* Real geographic day/night surface with a separate ocean-reflection mask. */}
      {earthTextures && earthUniforms ? (
        <mesh
          ref={earthRef}
          position={EARTH_CENTER}
          frustumCulled={false}
        >
          <sphereGeometry args={[EARTH_RADIUS, 160, 112]} />
          <shaderMaterial
            ref={earthMaterialRef}
            uniforms={earthUniforms}
            vertexShader={EARTH_VERTEX_SHADER}
            fragmentShader={EARTH_FRAGMENT_SHADER}
            toneMapped={false}
          />
        </mesh>
      ) : (
        <mesh position={EARTH_CENTER}>
          <sphereGeometry args={[EARTH_RADIUS, 64, 48]} />
          <meshBasicMaterial color="#071a3b" />
        </mesh>
      )}

      {/* Independent high-resolution cloud layer, slowly drifting over the surface. */}
      {earthTextures && cloudUniforms && (
        <mesh
          ref={cloudsRef}
          position={EARTH_CENTER}
          frustumCulled={false}
        >
          <sphereGeometry args={[CLOUD_RADIUS, 144, 96]} />
          <shaderMaterial
            ref={cloudsMaterialRef}
            uniforms={cloudUniforms}
            vertexShader={CLOUD_VERTEX_SHADER}
            fragmentShader={CLOUD_FRAGMENT_SHADER}
            transparent
            depthWrite={false}
            side={THREE.FrontSide}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Thin blue atmospheric limb, separated from the cloud shell. */}
      <mesh
        ref={atmosphereRef}
        position={EARTH_CENTER}
        frustumCulled={false}
      >
        <sphereGeometry args={[ATMOSPHERE_RADIUS, 128, 96]} />
        <shaderMaterial
          vertexShader={ATMOSPHERE_VERTEX_SHADER}
          fragmentShader={ATMOSPHERE_FRAGMENT_SHADER}
          transparent
          side={THREE.FrontSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
