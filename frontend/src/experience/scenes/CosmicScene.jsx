
import NebulaBackdrop from "../effects/NebulaBackdrop";
import StarFieldLayers from "../effects/StarFieldLayers";
import PlanetBody from "../components/PlanetBody";

export default function CosmicScene() {
  return (
    <>
      <color
        attach="background"
        args={["#03020b"]}
      />

      <ambientLight
        intensity={0.38}
        color="#8795c0"
      />

      <directionalLight
        position={[-42, 26, 22]}
        intensity={2.5}
        color="#fff0d7"
      />

      <directionalLight
        position={[32, -18, -12]}
        intensity={0.35}
        color="#5572ac"
      />

      <NebulaBackdrop />

      <StarFieldLayers />

      <PlanetBody position={[16, -2, -55]} />
    </>
  );
}
