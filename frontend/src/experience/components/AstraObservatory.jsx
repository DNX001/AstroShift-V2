import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import StructuralBeam from "./StructuralBeam";
import SolarArray from "./SolarArray";
import TelescopeAssembly from "./TelescopeAssembly";
import ObservationChamber from "./ObservationChamber";

function createRingModules(count) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return {
      id: index,
      x: Math.cos(angle) * 166,
      y: Math.sin(angle) * 166,
      angle,
    };
  });
}

function ObservatoryModule({ angle, x, y }) {
  return (
    <group position={[x, y, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
      <mesh>
        <boxGeometry args={[52, 25, 28]} />
        <meshStandardMaterial
          color="#29384a"
          metalness={0.84}
          roughness={0.31}
        />
      </mesh>
      <mesh position={[0, 0, 14.6]}>
        <boxGeometry args={[37, 13, 1.3]} />
        <meshStandardMaterial
          color="#16395a"
          emissive="#1a6a96"
          emissiveIntensity={0.32}
          metalness={0.5}
          roughness={0.19}
        />
      </mesh>
      <mesh position={[0, -7.5, 15.5]}>
        <boxGeometry args={[30, 1.4, 0.8]} />
        <meshBasicMaterial color="#7ddcff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 9.2, 15.3]}>
        <boxGeometry args={[19, 1.1, 0.8]} />
        <meshBasicMaterial color="#ffc988" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -15]}>
        <boxGeometry args={[44, 17, 10]} />
        <meshStandardMaterial color="#172536" metalness={0.86} roughness={0.34} />
      </mesh>
    </group>
  );
}

export default function AstraObservatory({ progressRef }) {
  const rootRef = useRef(null);
  const trackingMastRef = useRef(null);
  const modules = useMemo(() => createRingModules(14), []);

  useFrame(({ clock }) => {
    const progress = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1);
    const time = clock.elapsedTime;

    if (rootRef.current) {
      rootRef.current.visible = progress > 0.001;
      rootRef.current.position.y = Math.sin(time * 0.04) * 1.1;
      rootRef.current.rotation.y = Math.sin(time * 0.023) * 0.008 + progress * 0.012;
      rootRef.current.scale.setScalar(0.965 + progress * 0.035);
    }

    if (trackingMastRef.current) {
      trackingMastRef.current.rotation.y = Math.sin(time * 0.06) * 0.045;
    }
  });

  return (
    <group ref={rootRef} position={[165, 0, -4200]} visible={false}>
      {/* Main orbital frame */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[128, 137, 34, 80]} />
        <meshStandardMaterial
          color="#354356"
          metalness={0.86}
          roughness={0.34}
        />
      </mesh>

      <mesh>
        <torusGeometry args={[190, 9.5, 18, 160]} />
        <meshStandardMaterial
          color="#65768b"
          metalness={0.9}
          roughness={0.26}
        />
      </mesh>
      <mesh position={[0, 0, 5]}>
        <torusGeometry args={[181, 2.4, 10, 160]} />
        <meshStandardMaterial
          color="#78cfff"
          emissive="#2876b5"
          emissiveIntensity={0.42}
          metalness={0.78}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 0, -11]}>
        <torusGeometry args={[153, 3.5, 10, 144]} />
        <meshStandardMaterial color="#9aa9b6" metalness={0.88} roughness={0.29} />
      </mesh>

      {/* Radial trusses */}
      {modules.map((module) => (
        <StructuralBeam
          key={`radial-truss-${module.id}`}
          start={[Math.cos(module.angle) * 116, Math.sin(module.angle) * 116, -3]}
          end={[Math.cos(module.angle) * 180, Math.sin(module.angle) * 180, -2]}
          radius={2.7}
          color="#8799a9"
          emissive="#122b44"
        />
      ))}

      {/* Habitation and instrument modules distributed around the ring */}
      {modules.map((module) => (
        <ObservatoryModule
          key={`module-${module.id}`}
          x={module.x}
          y={module.y}
          angle={module.angle}
        />
      ))}

      {/* Central science core */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -4]}>
        <cylinderGeometry args={[84, 92, 58, 64]} />
        <meshStandardMaterial
          color="#202e40"
          metalness={0.88}
          roughness={0.32}
        />
      </mesh>

      <mesh position={[0, 0, 30]}>
        <torusGeometry args={[89, 4.5, 12, 112]} />
        <meshStandardMaterial color="#a5b1bd" metalness={0.92} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0, -35]}>
        <torusGeometry args={[78, 3.2, 10, 96]} />
        <meshStandardMaterial color="#63768b" metalness={0.88} roughness={0.26} />
      </mesh>

      {/* Structural ribs under the science core */}
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <StructuralBeam
            key={`core-strut-${index}`}
            start={[Math.cos(angle) * 74, Math.sin(angle) * 74, -30]}
            end={[Math.cos(angle) * 125, Math.sin(angle) * 125, -68]}
            radius={3.2}
            color="#65788d"
          />
        );
      })}

      {/* Telescope tower and rear equipment spine */}
      <group ref={trackingMastRef} position={[196, 88, -26]}>
        <mesh position={[0, 52, 0]}>
          <boxGeometry args={[49, 236, 48]} />
          <meshStandardMaterial color="#253449" metalness={0.87} roughness={0.31} />
        </mesh>
        <mesh position={[0, 52, 25]}>
          <boxGeometry args={[33, 202, 1.4]} />
          <meshStandardMaterial
            color="#172b42"
            emissive="#17456f"
            emissiveIntensity={0.26}
            metalness={0.65}
            roughness={0.23}
          />
        </mesh>
        {[-48, 0, 48, 96, 142].map((y) => (
          <mesh key={y} position={[0, y + 52, 26.4]}>
            <boxGeometry args={[24, 2.2, 0.8]} />
            <meshBasicMaterial color="#eebd7d" toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 176, 0]}>
          <cylinderGeometry args={[19, 25, 32, 24]} />
          <meshStandardMaterial color="#536477" metalness={0.88} roughness={0.25} />
        </mesh>
        <mesh position={[0, 196, 0]}>
          <sphereGeometry args={[5.5, 18, 14]} />
          <meshBasicMaterial color="#ffcf92" toneMapped={false} />
        </mesh>
      </group>

      {/* Two solar wings, supported by articulated booms */}
      <StructuralBeam start={[-130, 18, -18]} end={[-255, -35, -42]} radius={5.0} color="#728398" />
      <StructuralBeam start={[130, 18, -18]} end={[255, -35, -42]} radius={5.0} color="#728398" />
      <SolarArray position={[-335, -44, -43]} rotation={-0.09} width={190} height={116} />
      <SolarArray position={[335, -44, -43]} rotation={0.09} width={190} height={116} />

      {/* Antenna dish on the port side */}
      <group position={[-180, 130, -5]} rotation={[0.28, 0.2, -0.34]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[31, 31, 3, 48]} />
          <meshStandardMaterial color="#aab6c3" metalness={0.88} roughness={0.19} />
        </mesh>
        <mesh>
          <torusGeometry args={[31, 2.2, 10, 64]} />
          <meshStandardMaterial color="#9eacbb" metalness={0.9} roughness={0.22} />
        </mesh>
        <StructuralBeam start={[0, 0, -5]} end={[0, 0, -48]} radius={3} color="#718398" />
      </group>

      {/* The optical instrument is a real 3D assembly with individually segmented mirror facets. */}
      <TelescopeAssembly />

      {/* The forward panoramic observation chamber and holographic sky map. */}
      <ObservationChamber />

      {/* Service lights around the forward ring */}
      {Array.from({ length: 24 }, (_, index) => {
        const angle = (index / 24) * Math.PI * 2;
        const x = Math.cos(angle) * 186;
        const y = Math.sin(angle) * 186;
        return (
          <mesh key={`ring-light-${index}`} position={[x, y, 12]}>
            <sphereGeometry args={[2.6, 10, 8]} />
            <meshBasicMaterial
              color={index % 3 === 0 ? "#ffcf91" : "#76dfff"}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Small docking truss and beacon */}
      <StructuralBeam start={[-28, -134, -24]} end={[-28, -210, -72]} radius={4.4} color="#687b90" />
      <mesh position={[-28, -218, -72]}>
        <sphereGeometry args={[7, 18, 12]} />
        <meshBasicMaterial color="#ffba82" toneMapped={false} />
      </mesh>
    </group>
  );
}
