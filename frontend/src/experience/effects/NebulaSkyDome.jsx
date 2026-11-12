
import { useEffect, useMemo, useRef } from "react";
import {
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import * as THREE from "three";

function configurePanorama(sourceTexture, maxAnisotropy) {
  const texture = sourceTexture.clone();

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.anisotropy = Math.min(12, maxAnisotropy);

  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  texture.needsUpdate = true;

  return texture;
}

export default function NebulaSkyDome({ progressRef }) {
  const skyRef = useRef(null);
  const materialRef = useRef(null);
  const textureRef = useRef(null);

  const sourceTexture = useLoader(
    THREE.TextureLoader,
    "/environments/astroshift-nebula-environment-draft.png"
  );

  const { gl } = useThree();

  const texture = useMemo(
    () =>
      configurePanorama(
        sourceTexture,
        gl.capabilities.getMaxAnisotropy()
      ),
    [sourceTexture, gl]
  );

  useEffect(() => {
    textureRef.current = texture;

    return () => {
      textureRef.current = null;
      texture.dispose();
    };
  }, [texture]);

  useFrame(({ camera, clock }) => {
    if (!skyRef.current || !materialRef.current) {
      return;
    }

    const progress = THREE.MathUtils.clamp(
      progressRef.current,
      0,
      1
    );

    // Keep the sky centred around the viewer.
    skyRef.current.position.copy(camera.position);

    // The distant nebula gradually emerges.
    const reveal = THREE.MathUtils.smoothstep(
      progress,
      0.70,
      0.95
    );

    materialRef.current.opacity = reveal;

    // Gradually zoom into the panoramic environment.
    const zoomProgress = THREE.MathUtils.smoothstep(
      progress,
      0.74,
      1.0
    );

    const zoom = THREE.MathUtils.lerp(
      1.0,
      0.74,
      zoomProgress
    );

    const activeTexture = textureRef.current;

    if (activeTexture) {
      // A reduced repeat value selects a smaller
      // central portion of the panorama, enlarging it.
      activeTexture.repeat.set(zoom, zoom);

      activeTexture.offset.set(
        (1 - zoom) * 0.5,
        (1 - zoom) * 0.5
      );

      activeTexture.updateMatrix();
    }

    // Gentle cinematic environment rotation.
    skyRef.current.rotation.y =
      -0.18 + progress * 0.52;

    skyRef.current.rotation.x =
      Math.sin(clock.elapsedTime * 0.025) * 0.012;
  });

  return (
    <mesh
      ref={skyRef}
      frustumCulled={false}
      renderOrder={-100}
    >
      <sphereGeometry args={[480, 160, 112]} />

      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
        side={THREE.BackSide}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}
