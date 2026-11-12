
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function NebulaTransitionVeil({
  progressRef,
}) {
  const materialRef = useRef(null);

  useFrame(() => {
    if (!materialRef.current) return;

    const progress = THREE.MathUtils.clamp(
      progressRef.current,
      0,
      1
    );

    const fade = THREE.MathUtils.smoothstep(
      progress,
      0.70,
      0.94
    );

    materialRef.current.opacity = fade * 0.92;
  });

  return (
    <mesh
      position={[0, 0, -258]}
      renderOrder={1}
      frustumCulled={false}
    >
      <planeGeometry args={[900, 620]} />

      <meshBasicMaterial
        ref={materialRef}
        color="#02020a"
        transparent
        opacity={0}
        depthTest
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}
