import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import StructuralBeam from "./StructuralBeam";

function createMirrorLayout() {
  const points = [{ x: 0, y: 0 }];

  for (let ring = 1; ring <= 2; ring += 1) {
    const count = ring === 1 ? 6 : 12;
    const radius = ring === 1 ? 24 : 48;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2 + (ring === 2 ? Math.PI / 12 : 0);
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
  }

  return points;
}

export default function TelescopeAssembly() {
  const trackingRef = useRef(null);
  const mirrorLayout = useMemo(() => createMirrorLayout(), []);

  useFrame(({ clock }) => {
    if (!trackingRef.current) return;
    trackingRef.current.rotation.z =
      Math.sin(clock.elapsedTime * 0.055) * 0.018 +
      Math.sin(clock.elapsedTime * 0.017) * 0.009;
  });

  return (
    <group ref={trackingRef} position={[74, 116, 24]}>
      {/* Main optical tube */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -4]}>
        <cylinderGeometry args={[51, 59, 166, 48, 1, false]} />
        <meshStandardMaterial
          color="#293749"
          metalness={0.88}
          roughness={0.28}
        />
      </mesh>

      {/* Thermal and structural collars */}
      {[-74, -26, 24, 62].map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[54, 3.4, 10, 64]} />
          <meshStandardMaterial
            color="#9aa8b8"
            metalness={0.92}
            roughness={0.22}
          />
        </mesh>
      ))}

      {/* Primary mirror backing and precision rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 83]}>
        <cylinderGeometry args={[78, 78, 7, 72]} />
        <meshStandardMaterial
          color="#182536"
          metalness={0.9}
          roughness={0.26}
        />
      </mesh>

      <mesh position={[0, 0, 89]}>
        <torusGeometry args={[78, 4.2, 12, 96]} />
        <meshStandardMaterial
          color="#9daab9"
          metalness={0.94}
          roughness={0.2}
        />
      </mesh>

      {/* Segmented gold primary mirror — 19 physical facets */}
      {mirrorLayout.map((point, index) => (
        <mesh
          key={`mirror-facet-${index}`}
          position={[point.x, point.y, 88.2]}
          rotation={[Math.PI / 2, 0, Math.PI / 6]}
        >
          <cylinderGeometry args={[13.0, 13.0, 2.1, 6, 1]} />
          <meshPhysicalMaterial
            color={index % 4 === 0 ? "#f2d39a" : "#c9a875"}
            metalness={0.97}
            roughness={0.17}
            clearcoat={0.9}
            clearcoatRoughness={0.13}
            emissive="#7b4e20"
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}

      {/* Secondary mirror and optical support spiders */}
      <mesh position={[0, 0, 128]}>
        <cylinderGeometry args={[11, 14, 18, 32]} />
        <meshStandardMaterial
          color="#4d5c70"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {Array.from({ length: 4 }, (_, index) => {
        const angle = (index / 4) * Math.PI * 2 + Math.PI / 4;
        const end = [Math.cos(angle) * 67, Math.sin(angle) * 67, 91];
        return (
          <StructuralBeam
            key={`spider-${index}`}
            start={[0, 0, 124]}
            end={end}
            radius={1.8}
            color="#a9b8c7"
            emissive="#223b58"
          />
        );
      })}

      {/* Rear truss yoke and vibration-isolated mount */}
      <StructuralBeam
        start={[-48, -92, -54]}
        end={[-58, -28, 42]}
        radius={4.4}
        color="#64778b"
      />
      <StructuralBeam
        start={[48, -92, -54]}
        end={[58, -28, 42]}
        radius={4.4}
        color="#64778b"
      />
      <StructuralBeam
        start={[-58, -28, 42]}
        end={[58, -28, 42]}
        radius={3.2}
        color="#8798a9"
      />

      <mesh position={[0, -93, -54]}>
        <boxGeometry args={[132, 24, 76]} />
        <meshStandardMaterial
          color="#263447"
          metalness={0.82}
          roughness={0.33}
        />
      </mesh>

      {/* Small optical status lights */}
      <mesh position={[-74, 0, 91]}>
        <sphereGeometry args={[3.3, 16, 12]} />
        <meshBasicMaterial color="#8bdfff" toneMapped={false} />
      </mesh>
      <mesh position={[74, 0, 91]}>
        <sphereGeometry args={[3.3, 16, 12]} />
        <meshBasicMaterial color="#ffc982" toneMapped={false} />
      </mesh>
    </group>
  );
}
