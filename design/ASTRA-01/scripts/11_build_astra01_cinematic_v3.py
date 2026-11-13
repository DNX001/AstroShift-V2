"""ASTRA-01 | CINEMATIC EXTERIOR V3

Builds a new V3 project from the approved Detailed V2 file.
V1 and V2 are never overwritten.

V3 design pass:
- Replaces the V1/V2 ball-ended antenna booms with compact optical star trackers.
- Moves the high-gain dish to a visible, gimballed starboard-side mount.
- Adds port/starboard side glazing to make the observation pod read as wrap-around.
- Adds dedicated hero, observation, communications, aft-propulsion and solar review renders.

Target: Blender 5.2.x
"""

from __future__ import annotations

import math
import sys
import traceback
from pathlib import Path

import bpy
from mathutils import Vector


SCRIPT_PATH = Path(__file__).resolve()
ASTRA_DIR = SCRIPT_PATH.parents[1]
SOURCE_BLEND = ASTRA_DIR / "source" / "astra-01-detailed-v2.blend"
OUTPUT_BLEND = ASTRA_DIR / "source" / "astra-01-cinematic-v3.blend"
RENDER_DIR = ASTRA_DIR / "renders" / "cinematic-v3"

CREATED_OBJECTS = []
COLLECTIONS = {}
MAT = {}


def log(message: str) -> None:
    print(f"[ASTRA-01 V3] {message}", flush=True)


def create_collection(name: str, parent):
    collection = bpy.data.collections.new(name)
    parent.children.link(collection)
    COLLECTIONS[name] = collection
    return collection


def move_to_collection(obj, name: str, collection):
    obj.name = name
    for previous in list(obj.users_collection):
        previous.objects.unlink(obj)
    collection.objects.link(obj)
    obj["ASTRA_V3_DETAIL"] = True
    CREATED_OBJECTS.append(obj)
    return obj


def get_materials():
    required = {
        "graphite": "ASTRA | Deep Graphite",
        "titanium": "ASTRA | Satin Titanium",
        "gold": "ASTRA | Muted Thermal Gold",
        "black": "ASTRA | Aperture Black",
        "cyan": "ASTRA | Cyan Instrument Indicators",
        "glass": "ASTRA | Observation Glass",
        "coating": "ASTRA | Optical Coating",
        "ceramic": "ASTRA | Ceramic White",
        "thermal": "ASTRA | Thermal Blanket Composite",
    }
    missing = [name for name in required.values() if bpy.data.materials.get(name) is None]
    if missing:
        raise RuntimeError("Required V2 materials are missing: " + ", ".join(missing))
    for key, name in required.items():
        MAT[key] = bpy.data.materials[name]


def assign_material(obj, material):
    if material and obj.data and hasattr(obj.data, "materials"):
        obj.data.materials.clear()
        obj.data.materials.append(material)


def add_bevel(obj, width: float):
    if width <= 0:
        return
    bevel = obj.modifiers.new("V3 | precision edge radii", "BEVEL")
    bevel.width = width
    bevel.segments = 3
    bevel.profile = 0.5
    normal = obj.modifiers.new("V3 | weighted corner normals", "WEIGHTED_NORMAL")
    normal.keep_sharp = True


def add_box(name, location, dimensions, material, collection, bevel=0.02, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.object
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.rotation_euler = rotation
    move_to_collection(obj, name, collection)
    assign_material(obj, material)
    if bevel:
        add_bevel(obj, min(bevel, min(dimensions) * 0.28))
    return obj


def add_cylinder_between(name, start, end, radius, material, collection,
                         vertices=32, bevel=0.0):
    start_v = Vector(start)
    end_v = Vector(end)
    direction = end_v - start_v
    length = direction.length
    if length <= 1e-6:
        raise ValueError(f"Cannot create zero-length cylinder: {name}")
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=length,
        location=(start_v + end_v) * 0.5,
    )
    obj = bpy.context.object
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    move_to_collection(obj, name, collection)
    assign_material(obj, material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    if bevel:
        add_bevel(obj, bevel)
    return obj


def add_axis_cylinder(name, center, axis, depth, radius, material, collection,
                      vertices=48):
    axis_v = Vector(axis).normalized()
    start = Vector(center) - axis_v * (depth * 0.5)
    end = Vector(center) + axis_v * (depth * 0.5)
    return add_cylinder_between(
        name, start, end, radius, material, collection, vertices=vertices
    )


def add_torus(name, location, major_radius, minor_radius, material, collection,
              rotation=(0.0, 0.0, 0.0)):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=64,
        minor_segments=12,
        major_radius=major_radius,
        minor_radius=minor_radius,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    move_to_collection(obj, name, collection)
    assign_material(obj, material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def add_sphere(name, location, radius, material, collection,
               segments=16, rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=rings,
        radius=radius,
        location=location,
    )
    obj = bpy.context.object
    move_to_collection(obj, name, collection)
    assign_material(obj, material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def add_parabolic_reflector(name, center, radius, depth, facing,
                            material, collection, radial_steps=14,
                            segments=64):
    """Create a shallow concave parabolic reflector with its axis along facing."""
    vertices = [(0.0, 0.0, -depth)]
    for ring in range(1, radial_steps + 1):
        r = radius * ring / radial_steps
        z = -depth * (1.0 - (r / radius) ** 2)
        for segment in range(segments):
            theta = (2.0 * math.pi * segment) / segments
            vertices.append((r * math.cos(theta), r * math.sin(theta), z))

    faces = []
    first_ring = 1
    for segment in range(segments):
        a = first_ring + segment
        b = first_ring + ((segment + 1) % segments)
        faces.append((0, a, b))

    for ring in range(1, radial_steps):
        inner_start = 1 + (ring - 1) * segments
        outer_start = 1 + ring * segments
        for segment in range(segments):
            nxt = (segment + 1) % segments
            faces.append((
                inner_start + segment,
                outer_start + segment,
                outer_start + nxt,
                inner_start + nxt,
            ))

    mesh = bpy.data.meshes.new(name + " | reflector mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    obj.location = Vector(center)
    obj.rotation_euler = Vector(facing).to_track_quat("Z", "Y").to_euler()
    obj["ASTRA_V3_DETAIL"] = True
    CREATED_OBJECTS.append(obj)
    assign_material(obj, material)

    solidify = obj.modifiers.new("V3 | reflector shell thickness", "SOLIDIFY")
    solidify.thickness = 0.018
    solidify.offset = 0.0
    return obj


def hide_legacy_hardware():
    """Hide visual elements replaced by V3; keep them in the file for traceability."""
    names = [
        "COMMUNICATIONS_ANTENNA_BOOM",
        "COMMUNICATIONS_ANTENNA_BOOM.001",
        "COMMUNICATIONS_SENSOR_HEAD",
        "COMMUNICATIONS_SENSOR_HEAD.001",
        "COMMUNICATIONS_DISH",
        "COMMUNICATIONS_DISH_FEED",
        "DISH_SUPPORT_ARM",
        "HIGH_GAIN_DISH_PRECISION_RIM",
        "HIGH_GAIN_DISH_FEED_SUPPORT_01",
        "HIGH_GAIN_DISH_FEED_SUPPORT_02",
        "HIGH_GAIN_DISH_FEED_SUPPORT_03",
        "HIGH_GAIN_DISH_FEED_SUPPORT_04",
        "HIGH_GAIN_DISH_FEED_HORN",
    ]
    hidden = 0
    for name in names:
        obj = bpy.data.objects.get(name)
        if obj is not None:
            obj.hide_render = True
            obj.hide_set(True)
            obj["ASTRA_V3_REPLACED_HARDWARE"] = True
            hidden += 1
    log(f"Legacy antenna / dish objects hidden for V3: {hidden}")


def build_wraparound_observation_windows():
    c = COLLECTIONS["01 | WRAPAROUND OBSERVATION"]
    log("Extending the observation pod glazing around both shoulders...")

    for side, label in ((-1, "PORT"), (1, "STARBOARD")):
        x_base = side * 1.675
        x_glass = side * 1.724
        x_frame = side * 1.765

        # Dark recessed seat gives the side glazing a visible housing depth.
        add_box(
            f"OBSERVATION_SIDE_WINDOW_RECESS_{label}",
            (x_base, 1.98, 0.65),
            (0.085, 0.70, 1.26),
            MAT["black"], c, bevel=0.035,
        )
        add_box(
            f"OBSERVATION_SIDE_WINDOW_GLASS_{label}",
            (x_glass, 1.98, 0.65),
            (0.028, 0.55, 1.08),
            MAT["glass"], c, bevel=0.012,
        )

        # Titanium perimeter with muted-gold outer edge.
        for z, edge in ((1.25, "TOP"), (0.05, "BOTTOM")):
            add_box(
                f"OBSERVATION_SIDE_WINDOW_FRAME_{label}_{edge}",
                (x_frame, 1.98, z),
                (0.075, 0.70, 0.065),
                MAT["titanium"], c, bevel=0.015,
            )
            add_box(
                f"OBSERVATION_SIDE_WINDOW_GOLD_EDGE_{label}_{edge}",
                (side * 1.807, 1.98, z),
                (0.018, 0.66, 0.018),
                MAT["gold"], c, bevel=0.006,
            )

        for y, edge in ((1.64, "AFT"), (2.32, "FORWARD")):
            add_box(
                f"OBSERVATION_SIDE_WINDOW_FRAME_{label}_{edge}",
                (x_frame, y, 0.65),
                (0.075, 0.065, 1.25),
                MAT["titanium"], c, bevel=0.014,
            )

        # One central vertical mullion on each side pane.
        add_box(
            f"OBSERVATION_SIDE_WINDOW_MULLION_{label}",
            (side * 1.812, 1.98, 0.65),
            (0.040, 0.035, 1.08),
            MAT["gold"], c, bevel=0.009,
        )

        # Small cyan locator lights at the forward corners.
        for z in (0.22, 1.08):
            add_sphere(
                f"OBSERVATION_SIDE_WINDOW_LOCATOR_{label}_{int(z * 100):03d}",
                (side * 1.817, 2.285, z),
                0.035,
                MAT["cyan"], c, segments=12, rings=6,
            )


def build_star_tracker_pods():
    c = COLLECTIONS["02 | STAR TRACKER HARDWARE"]
    log("Replacing ornamental antenna tips with compact optical star trackers...")

    for side, label in ((-1, "PORT"), (1, "STARBOARD")):
        center = (side * 2.035, -0.22, 2.48)
        add_box(
            f"STAR_TRACKER_HOUSING_{label}",
            center,
            (0.42, 0.48, 0.38),
            MAT["graphite"], c, bevel=0.075,
        )
        add_box(
            f"STAR_TRACKER_THERMAL_COVER_{label}",
            (side * 2.045, -0.22, 2.685),
            (0.30, 0.34, 0.055),
            MAT["thermal"], c, bevel=0.025,
        )

        lens_x = side * 2.255
        lens_center = (lens_x, -0.22, 2.48)
        add_torus(
            f"STAR_TRACKER_LENS_RETAINING_RING_{label}",
            lens_center,
            0.125,
            0.020,
            MAT["gold"], c,
            rotation=(0.0, math.pi * 0.5, 0.0),
        )
        add_axis_cylinder(
            f"STAR_TRACKER_OPTICAL_LENS_{label}",
            (side * 2.27, -0.22, 2.48),
            (1.0, 0.0, 0.0),
            0.045,
            0.092,
            MAT["coating"], c, vertices=40,
        )
        add_sphere(
            f"STAR_TRACKER_LENS_GLINT_{label}",
            (side * 2.296, -0.25, 2.505),
            0.018,
            MAT["cyan"], c, segments=12, rings=6,
        )

        # Secondary small star-field sensor.
        add_axis_cylinder(
            f"STAR_TRACKER_AUX_SENSOR_{label}",
            (side * 2.275, 0.005, 2.48),
            (1.0, 0.0, 0.0),
            0.035,
            0.045,
            MAT["black"], c, vertices=32,
        )
        add_torus(
            f"STAR_TRACKER_AUX_SENSOR_RIM_{label}",
            (side * 2.292, 0.005, 2.48),
            0.052,
            0.010,
            MAT["titanium"], c,
            rotation=(0.0, math.pi * 0.5, 0.0),
        )


def build_visible_side_high_gain_antenna():
    c = COLLECTIONS["03 | SIDE HIGH-GAIN ANTENNA"]
    log("Building a visible gimballed high-gain communications dish...")

    # Starboard shoulder mount; the reflector faces outboard (+X).
    dish_center = (2.76, -0.58, 0.72)

    add_box(
        "HGA_GIMBAL_BASE_HOUSING",
        (2.075, -0.58, 0.72),
        (0.30, 0.62, 0.48),
        MAT["graphite"], c, bevel=0.055,
    )
    add_axis_cylinder(
        "HGA_ELEVATION_GIMBAL",
        (2.29, -0.58, 0.72),
        (0.0, 1.0, 0.0),
        0.68,
        0.145,
        MAT["gold"], c,
    )
    add_cylinder_between(
        "HGA_SUPPORT_BOOM",
        (2.18, -0.58, 0.72),
        (2.58, -0.58, 0.72),
        0.075,
        MAT["titanium"], c, vertices=40,
        bevel=0.012,
    )
    add_axis_cylinder(
        "HGA_AZIMUTH_COLLAR",
        (2.52, -0.58, 0.72),
        (1.0, 0.0, 0.0),
        0.16,
        0.19,
        MAT["graphite"], c,
    )

    add_parabolic_reflector(
        "ASTRA_HIGH_GAIN_PARABOLIC_REFLECTOR_V3",
        dish_center,
        0.58,
        0.135,
        (1.0, 0.0, 0.0),
        MAT["ceramic"], c,
    )
    add_torus(
        "ASTRA_HIGH_GAIN_REFLECTOR_RIM_V3",
        dish_center,
        0.58,
        0.028,
        MAT["titanium"], c,
        rotation=(0.0, math.pi * 0.5, 0.0),
    )

    feed = (3.20, -0.58, 0.72)
    rim_points = (
        (2.76, -1.02, 0.72),
        (2.76, -0.14, 0.72),
        (2.76, -0.58, 0.28),
        (2.76, -0.58, 1.16),
    )
    for index, point in enumerate(rim_points, start=1):
        add_cylinder_between(
            f"HGA_FEED_SUPPORT_V3_{index:02d}",
            feed, point, 0.018, MAT["gold"], c, vertices=16,
        )

    add_axis_cylinder(
        "HGA_FEED_HORN_V3",
        (3.18, -0.58, 0.72),
        (1.0, 0.0, 0.0),
        0.20,
        0.082,
        MAT["coating"], c, vertices=40,
    )
    add_torus(
        "HGA_FEED_HORN_RIM_V3",
        (3.285, -0.58, 0.72),
        0.086,
        0.012,
        MAT["gold"], c,
        rotation=(0.0, math.pi * 0.5, 0.0),
    )

    # A compact low-gain patch antenna balances the opposite shoulder.
    add_box(
        "PORT_LOW_GAIN_PATCH_ANTENNA_HOUSING",
        (-2.16, -0.50, 0.72),
        (0.18, 0.48, 0.54),
        MAT["graphite"], c, bevel=0.04,
    )
    add_box(
        "PORT_LOW_GAIN_PATCH_ANTENNA_FACE",
        (-2.265, -0.50, 0.72),
        (0.025, 0.34, 0.38),
        MAT["thermal"], c, bevel=0.025,
    )
    for index, z in enumerate((0.60, 0.84), start=1):
        add_sphere(
            f"PORT_LOW_GAIN_STATUS_LIGHT_{index:02d}",
            (-2.285, -0.50, z),
            0.025,
            MAT["cyan"], c, segments=12, rings=6,
        )


def build_instrument_bay_access_details():
    c = COLLECTIONS["04 | INSTRUMENT BAY DETAILS"]
    log("Adding restrained access hardware to the optical instrument housings...")

    for side, label in ((-1, "PORT"), (1, "STARBOARD")):
        # The base housings already exist at X +/-1.48, Z 3.55.
        # These face plates sit on their outboard surfaces.
        x = side * 1.675
        add_box(
            f"OPTICAL_INSTRUMENT_ACCESS_FACE_{label}",
            (x, -0.02, 3.55),
            (0.035, 0.64, 0.98),
            MAT["thermal"], c, bevel=0.025,
        )
        for index in range(4):
            z = 3.25 + index * 0.19
            add_box(
                f"OPTICAL_INSTRUMENT_ACCESS_LOUVER_{label}_{index + 1:02d}",
                (side * 1.70, -0.02, z),
                (0.025, 0.42, 0.045),
                MAT["titanium"], c, bevel=0.009,
            )
        for y in (-0.27, 0.23):
            for z in (3.12, 3.98):
                add_sphere(
                    f"OPTICAL_INSTRUMENT_ACCESS_FASTENER_{label}_{int((y + 0.3)*100):02d}_{int(z*100):03d}",
                    (side * 1.703, y, z),
                    0.018,
                    MAT["gold"], c, segments=10, rings=6,
                )


def make_camera(name, location, target, lens, collection):
    data = bpy.data.cameras.new(name)
    camera = bpy.data.objects.new(name, data)
    collection.objects.link(camera)
    camera.location = Vector(location)
    direction = Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    data.lens = lens
    data.sensor_width = 36.0
    data.clip_start = 0.1
    data.clip_end = 350.0
    camera["ASTRA_V3_REVIEW_CAMERA"] = True
    return camera


def render_view(scene, camera, filename, resolution):
    scene.camera = camera
    scene.render.resolution_x = resolution[0]
    scene.render.resolution_y = resolution[1]
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.filepath = str(RENDER_DIR / filename)
    log(f"Rendering {filename}...")
    bpy.ops.render.render(write_still=True)


def configure_and_render():
    scene = bpy.context.scene
    rig = create_collection("90 | V3 REVIEW CAMERAS", scene.collection)

    try:
        scene.render.engine = "BLENDER_EEVEE"
    except Exception:
        log("Retaining source render engine; BLENDER_EEVEE could not be selected.")

    hero = make_camera(
        "ASTRA_V3_CAMERA_HERO_ISOMETRIC",
        (25.0, 33.0, 22.5),
        (0.0, 0.0, 2.0),
        56.0, rig,
    )
    observation = make_camera(
        "ASTRA_V3_CAMERA_WRAPAROUND_OBSERVATION",
        (0.0, 11.8, 2.2),
        (0.0, 2.0, 0.65),
        62.0, rig,
    )
    comms = make_camera(
        "ASTRA_V3_CAMERA_COMMUNICATIONS_PROFILE",
        (13.5, -11.0, 6.0),
        (2.45, -0.52, 0.72),
        65.0, rig,
    )
    propulsion = make_camera(
        "ASTRA_V3_CAMERA_AFT_PROPULSION",
        (0.0, -18.0, -10.5),
        (0.0, 0.0, -2.85),
        68.0, rig,
    )
    solar = make_camera(
        "ASTRA_V3_CAMERA_SOLAR_ARRAY_TOP",
        (0.0, 0.0, 29.0),
        (0.0, 0.0, -1.12),
        48.0, rig,
    )

    render_view(scene, hero, "astra01-v3-hero-isometric.png", (1600, 1000))
    render_view(scene, observation, "astra01-v3-observation-wraparound.png", (1400, 1100))
    render_view(scene, comms, "astra01-v3-communications-profile.png", (1400, 1100))
    render_view(scene, propulsion, "astra01-v3-aft-propulsion.png", (1400, 1100))
    render_view(scene, solar, "astra01-v3-solar-array-top.png", (1600, 900))

    scene.camera = hero
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    scene.render.filepath = str(RENDER_DIR / "astra01-v3-hero-isometric.png")


def main():
    log("=" * 68)
    log("ASTRA-01 | CINEMATIC EXTERIOR V3")
    log("=" * 68)
    log(f"V2 source: {SOURCE_BLEND}")
    log(f"V3 output: {OUTPUT_BLEND}")

    if not SOURCE_BLEND.exists():
        raise FileNotFoundError("V2 source project not found: " + str(SOURCE_BLEND))

    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    log("Opening approved V2 project; V1 and V2 will remain untouched...")
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE_BLEND))

    scene = bpy.context.scene
    root = create_collection("ASTRA-01 | CINEMATIC V3", scene.collection)
    root["design_version"] = "3.0"
    root["source_project"] = SOURCE_BLEND.name
    root["purpose"] = "Silhouette and functional exterior refinement"

    create_collection("01 | WRAPAROUND OBSERVATION", root)
    create_collection("02 | STAR TRACKER HARDWARE", root)
    create_collection("03 | SIDE HIGH-GAIN ANTENNA", root)
    create_collection("04 | INSTRUMENT BAY DETAILS", root)

    get_materials()
    hide_legacy_hardware()

    build_wraparound_observation_windows()
    build_star_tracker_pods()
    build_visible_side_high_gain_antenna()
    build_instrument_bay_access_details()

    log(f"New V3 detail objects created: {len(CREATED_OBJECTS)}")
    log("Preparing five V3 design-review renders...")
    configure_and_render()

    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT_BLEND))

    meshes = [obj for obj in scene.objects if obj.type == "MESH"]
    total_vertices = sum(len(obj.data.vertices) for obj in meshes)
    total_faces = sum(len(obj.data.polygons) for obj in meshes)

    log("=" * 68)
    log("ASTRA-01 CINEMATIC V3 BUILD COMPLETED")
    log("=" * 68)
    log(f"V3 project: {OUTPUT_BLEND}")
    log(f"Review renders: {RENDER_DIR}")
    log(f"New V3 detail objects: {len(CREATED_OBJECTS)}")
    log(f"Total mesh objects: {len(meshes)}")
    log(f"Total vertices: {total_vertices}")
    log(f"Total faces: {total_faces}")
    log("V1 and V2 source projects left untouched.")
    log("No frontend files modified.")
    log("=" * 68)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("\nASTRA-01 V3 BUILD FAILED", file=sys.stderr)
        print(f"Reason: {exc}", file=sys.stderr)
        traceback.print_exc()
        raise
