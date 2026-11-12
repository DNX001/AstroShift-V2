
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function StarField({
  count = 3200,
  width = 160,
  height = 100,
  depth = 200,
  size = 0.055,
  speed = 1.1,
  color = "#d8eeff",
  opacity = 0.9,
  seed = 1,
}) {
  // Generate deterministic star positions.
  // The same seed produces the same initial starfield.

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);

    let seedState = seed >>> 0;

    function random() {
      seedState =
        (1664525 * seedState + 1013904223) >>> 0;

      return seedState / 4294967296;
    }

    for (let i = 0; i < count; i += 1) {
      const index = i * 3;

      positions[index] = (random() - 0.5) * width;
      positions[index + 1] = (random() - 0.5) * height;
      positions[index + 2] = -random() * depth;
    }

    const bufferGeometry = new THREE.BufferGeometry();

    bufferGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    return bufferGeometry;
  }, [count, width, height, depth, seed]);

  // Move stars towards the camera.
  // Stars recycle after passing the camera.

  useFrame((_state, delta) => {
    const positionAttribute = geometry.getAttribute("position");
    const positions = positionAttribute.array;

    // Prevent a large jump when returning to the browser tab.
    const frameDelta = Math.min(delta, 0.05);
    const travelDistance = speed * frameDelta;

    for (let i = 2; i < positions.length; i += 3) {
      positions[i] += travelDistance;

      if (positions[i] > 4) {
        positions[i] = -depth;
      }
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <points
      geometry={geometry}
      frustumCulled={false}
    >
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
