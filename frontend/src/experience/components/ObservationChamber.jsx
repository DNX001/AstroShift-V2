import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ObservationChamber() {
  const hologramRef = useRef(null);

  useFrame(({ clock }) => {
    if (!hologramRef.current) return;
    hologramRef.current.rotation.y = clock.elapsedTime * 0.12;
    hologramRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.08) * 0.06;
  });

  return (
    <group position={[0, -48, 66]}>
      {/* Panoramic pressure-shell chamber */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[72, 72, 88, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#4b9ac9"
          transparent
          opacity={0.18}
          metalness={0.22}
          roughness={0.12}
          transmission={0.12}
          thickness={12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Front and rear structural hoops */}
      {[46, -46].map((z) => (
        <mesh key={z} position={[0, 0, z]}>
          <torusGeometry args={[72, 5.2, 12, 84]} />
          <meshStandardMaterial
            color="#8b9dae"
            metalness={0.9}
            roughness={0.23}
          />
        </mesh>
      ))}

      <mesh position={[0, 0, 50]}>
        <torusGeometry args={[69, 1.4, 8, 96]} />
        <meshBasicMaterial color="#69d9ff" transparent opacity={0.8} toneMapped={false} />
      </mesh>

      {/* Glass ribs */}
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 70;
        const y = Math.sin(angle) * 70;
        return (
          <mesh
            key={`chamber-rib-${index}`}
            position={[x, y, 0]}
            rotation={[Math.PI / 2, 0, angle]}
          >
            <cylinderGeometry args={[1.25, 1.25, 88, 8]} />
            <meshStandardMaterial color="#8ca6c4" metalness={0.72} roughness={0.28} />
          </mesh>
        );
      })}

      {/* Interior deck */}
      <mesh position={[0, -54, 0]}>
        <cylinderGeometry args={[65, 65, 9, 48]} />
        <meshStandardMaterial color="#1a2636" metalness={0.83} roughness={0.31} />
      </mesh>

      <mesh position={[0, -48, 25]}>
        <boxGeometry args={[106, 3.5, 36]} />
        <meshStandardMaterial color="#27394c" metalness={0.86} roughness={0.26} />
      </mesh>

      {/* Central holographic celestial map */}
      <group ref={hologramRef} position={[0, -14, 15]}>
        <mesh>
          <sphereGeometry args={[24, 32, 24]} />
          <meshBasicMaterial color="#4dbfff" wireframe transparent opacity={0.55} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.25, 0]}>
          <torusGeometry args={[36, 0.85, 8, 100]} />
          <meshBasicMaterial color="#7fdfff" transparent opacity={0.8} toneMapped={false} />
        </mesh>
        <mesh rotation={[0.45, 0, 0.38]}>
          <torusGeometry args={[46, 0.55, 8, 100]} />
          <meshBasicMaterial color="#9d83ff" transparent opacity={0.56} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 28]}>
          <sphereGeometry args={[4.2, 20, 16]} />
          <meshBasicMaterial color="#e2f8ff" toneMapped={false} />
        </mesh>
      </group>

      {/* Low-profile observation consoles */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 47, -30, 36]} rotation={[0, 0, -side * 0.12]}>
          <mesh>
            <boxGeometry args={[28, 13, 8]} />
            <meshStandardMaterial color="#1b2b3f" metalness={0.82} roughness={0.29} />
          </mesh>
          <mesh position={[0, 8, 4.5]} rotation={[-0.22, 0, 0]}>
            <planeGeometry args={[22, 10]} />
            <meshBasicMaterial color="#11385b" transparent opacity={0.72} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.5, 7]}>
            <boxGeometry args={[19, 0.7, 0.4]} />
            <meshBasicMaterial color="#72dcff" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
