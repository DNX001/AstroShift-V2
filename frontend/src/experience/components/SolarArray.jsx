import { useMemo } from "react";
import * as THREE from "three";

function createGridGeometry(width, height, columns, rows) {
  const vertices = [];

  for (let column = 1; column < columns; column += 1) {
    const x = -width / 2 + (width * column) / columns;
    vertices.push(x, -height / 2, 3.2, x, height / 2, 3.2);
  }

  for (let row = 1; row < rows; row += 1) {
    const y = -height / 2 + (height * row) / rows;
    vertices.push(-width / 2, y, 3.2, width / 2, y, 3.2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  return geometry;
}

export default function SolarArray({
  position = [0, 0, 0],
  rotation = 0,
  width = 184,
  height = 112,
}) {
  const gridGeometry = useMemo(
    () => createGridGeometry(width - 10, height - 10, 12, 6),
    [width, height]
  );

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <mesh>
        <boxGeometry args={[width, height, 4]} />
        <meshStandardMaterial
          color="#101d36"
          metalness={0.86}
          roughness={0.28}
        />
      </mesh>

      <mesh position={[0, 0, 2.4]}>
        <planeGeometry args={[width - 10, height - 10]} />
        <meshStandardMaterial
          color="#102d5e"
          emissive="#0d2860"
          emissiveIntensity={0.38}
          metalness={0.74}
          roughness={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments
        geometry={gridGeometry}
        position={[0, 0, 0]}
      >
        <lineBasicMaterial
          color="#4f86c6"
          transparent
          opacity={0.56}
          depthWrite={false}
        />
      </lineSegments>

      <mesh position={[0, 0, 2.9]}>
        <boxGeometry args={[width, 2.8, 2.2]} />
        <meshStandardMaterial
          color="#8291a5"
          metalness={0.88}
          roughness={0.24}
          emissive="#15263d"
          emissiveIntensity={0.22}
        />
      </mesh>

      <mesh position={[0, height / 2, 2.9]}>
        <boxGeometry args={[width, 2.8, 2.2]} />
        <meshStandardMaterial color="#8291a5" metalness={0.88} roughness={0.24} />
      </mesh>
    </group>
  );
}
