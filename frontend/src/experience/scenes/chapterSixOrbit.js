import * as THREE from "three";

// ASTRA-01 begins at [0, 1740, 2150] relative to Earth's fixed centre.
// Swing that vector through a circular arc in the plane spanned by the
// starting radius and the world X axis. The offset is zero at progress 0,
// preserving the established Chapter 005 -> Chapter 006 handoff.
// This helper is used by the spacecraft only; the camera never inherits it.
const EARTH_RELATIVE_Y = 1740;
const EARTH_RELATIVE_Z = 2150;
const ORBIT_RADIUS = Math.hypot(EARTH_RELATIVE_Y, EARTH_RELATIVE_Z);
const ORBIT_SWEEP_RADIANS = 0.10; // approximately 5.7 degrees over the chapter

export function setChapterSixOrbitalOffset(progress, target) {
  const p = THREE.MathUtils.clamp(progress ?? 0, 0, 1);
  const angle = p * ORBIT_SWEEP_RADIANS;
  const cosine = Math.cos(angle);

  target.set(
    ORBIT_RADIUS * Math.sin(angle),
    EARTH_RELATIVE_Y * (cosine - 1),
    EARTH_RELATIVE_Z * (cosine - 1)
  );

  return target;
}
