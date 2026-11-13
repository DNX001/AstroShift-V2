import { useMemo } from "react";
import * as THREE from "three";

export default function StructuralBeam({
  start,
  end,
  radius = 2,
  color = "#77899b",
  emissive = "#0b1c30",
  metalness = 0.78,
  roughness = 0.34,
}) {
  const [sx, sy, sz] = start;
  const [ex, ey, ez] = end;

  const transform = useMemo(() => {
    const a = new THREE.Vector3(sx, sy, sz);
    const b = new THREE.Vector3(ex, ey, ez);
    const direction = new THREE.Vector3().subVectors(b, a);
    const length = direction.length();
    const position = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
    return { position, quaternion, length };
  }, [sx, sy, sz, ex, ey, ez]);

  return (
    <mesh
      position={transform.position}
      quaternion={transform.quaternion}
      castShadow={false}
      receiveShadow={false}
    >
      <cylinderGeometry args={[radius, radius, transform.length, 8, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.34}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
}
