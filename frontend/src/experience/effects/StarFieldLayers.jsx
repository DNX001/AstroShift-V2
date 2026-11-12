
import StarField from "./StarField";

export default function StarFieldLayers() {
  return (
    <group>

      {/* Distant stars: slow movement */}
      <StarField
        count={1800}
        width={190}
        height={115}
        depth={240}
        size={0.045}
        speed={0.8}
        color="#a9c8ed"
        opacity={0.65}
        seed={11}
      />

      {/* Mid-distance stars */}
      <StarField
        count={1400}
        width={150}
        height={95}
        depth={160}
        size={0.065}
        speed={2.1}
        color="#c8e5ff"
        opacity={0.8}
        seed={29}
      />

      {/* Nearby stars: faster parallax */}
      <StarField
        count={650}
        width={105}
        height={70}
        depth={90}
        size={0.095}
        speed={4.2}
        color="#8ce7f5"
        opacity={0.9}
        seed={47}
      />

    </group>
  );
}
