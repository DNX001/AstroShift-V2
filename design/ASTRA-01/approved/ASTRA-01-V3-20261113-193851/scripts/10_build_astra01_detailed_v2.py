"""ASTRA-01 | DETAILED EXTERIOR V2

Builds a non-destructive V2 refinement on top of the approved Blockout V1.
The script always opens the V1 .blend, adds detail in new collections, saves
as a separate V2 .blend, and renders review views. V1 is never overwritten.

Written for the Blender 5.2 API; it has not yet been executed in the user's
Blender 5.2.4 installation. Review generated renders before approving the design.
"""

from __future__ import annotations

import math
import os
import sys
import traceback
from pathlib import Path

import bpy
from mathutils import Vector


# -----------------------------------------------------------------------------
# PATHS
# -----------------------------------------------------------------------------

SCRIPT_PATH = Path(__file__).resolve()
ASTRA_DIR = SCRIPT_PATH.parents[1]
PROJECT_ROOT = SCRIPT_PATH.parents[3]
SOURCE_BLEND = ASTRA_DIR / "source" / "astra-01-blockout-v1.blend"
OUTPUT_BLEND = ASTRA_DIR / "source" / "astra-01-detailed-v2.blend"
RENDER_DIR = ASTRA_DIR / "renders" / "detailed-v2"


# -----------------------------------------------------------------------------
# SCENE / COLLECTIONS
# -----------------------------------------------------------------------------

COLLECTIONS = {}
CREATED_OBJECTS = []


def log(message: str) -> None:
    print(f"[ASTRA-01 V2] {message}", flush=True)


def create_collection(name: str, parent):
    collection = bpy.data.collections.new(name)
    parent.children.link(collection)
    COLLECTIONS[name] = collection
    return collection


def move_to_collection(obj, collection, name: str):
    obj.name = name
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)
    obj["ASTRA_V2_DETAIL"] = True
    CREATED_OBJECTS.append(obj)
    return obj


# -----------------------------------------------------------------------------
# MATERIALS
# -----------------------------------------------------------------------------


def ensure_material(name, color, metallic=0.0, roughness=0.4):
    material = bpy.data.materials.get(name)
    # Preserve the approved V1 material values whenever the material already exists.
    if material is not None:
        return material
    material = bpy.data.materials.new(name)
    material.diffuse_color = (color[0], color[1], color[2], 1.0)
    material.use_nodes = True
    nodes = material.node_tree.nodes if material.node_tree else None
    bsdf = nodes.get("Principled BSDF") if nodes else None
    if bsdf:
        base = bsdf.inputs.get("Base Color")
        metal = bsdf.inputs.get("Metallic")
        rough = bsdf.inputs.get("Roughness")
        if base:
            base.default_value = (color[0], color[1], color[2], 1.0)
        if metal:
            metal.default_value = metallic
        if rough:
            rough.default_value = roughness
    return material


def load_materials():
    global MAT
    MAT = {
        "graphite": ensure_material("ASTRA | Deep Graphite", (0.035, 0.055, 0.075), 0.72, 0.31),
        "titanium": ensure_material("ASTRA | Satin Titanium", (0.34, 0.42, 0.49), 0.78, 0.29),
        "gold": ensure_material("ASTRA | Muted Thermal Gold", (0.52, 0.31, 0.12), 0.72, 0.32),
        "black": ensure_material("ASTRA | Aperture Black", (0.006, 0.009, 0.014), 0.28, 0.2),
        "cyan": ensure_material("ASTRA | Cyan Instrument Indicators", (0.015, 0.40, 0.58), 0.38, 0.22),
        "glass": ensure_material("ASTRA | Observation Glass", (0.015, 0.16, 0.28), 0.58, 0.16),
        "cells": ensure_material("ASTRA | Deep Blue Photovoltaic Cells", (0.012, 0.055, 0.16), 0.68, 0.24),
        "ceramic": ensure_material("ASTRA | Ceramic White", (0.62, 0.69, 0.73), 0.38, 0.31),
        "thermal": ensure_material("ASTRA | Thermal Blanket Composite", (0.105, 0.145, 0.17), 0.58, 0.38),
        "radiator": ensure_material("ASTRA | Radiator Matte", (0.018, 0.030, 0.041), 0.68, 0.42),
        "coating": ensure_material("ASTRA | Optical Coating", (0.018, 0.12, 0.19), 0.82, 0.16),
        "fastener": ensure_material("ASTRA | Dark Anodized Fasteners", (0.075, 0.095, 0.11), 0.86, 0.27),
        "amber": ensure_material("ASTRA | Amber Status Markings", (0.62, 0.26, 0.055), 0.55, 0.3),
    }


# -----------------------------------------------------------------------------
# GEOMETRY HELPERS
# -----------------------------------------------------------------------------


def assign_material(obj, material):
    if material and obj.data and hasattr(obj.data, "materials"):
        obj.data.materials.clear()
        obj.data.materials.append(material)


def add_bevel(obj, width):
    if width <= 0:
        return
    bevel = obj.modifiers.new("V2 | machined edge radii", "BEVEL")
    bevel.width = width
    bevel.segments = 3
    bevel.profile = 0.5
    normal = obj.modifiers.new("V2 | weighted corner normals", "WEIGHTED_NORMAL")
    normal.keep_sharp = True


def add_box(name, location, dimensions, material, collection, angle_z=0.0, bevel=0.02):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.object
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.rotation_euler[2] = angle_z
    move_to_collection(obj, collection, name)
    assign_material(obj, material)
    add_bevel(obj, min(bevel, min(dimensions) * 0.28) if bevel else 0.0)
    return obj


def add_cylinder_between(name, start, end, radius, material, collection, vertices=32, bevel=0.0):
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
    move_to_collection(obj, collection, name)
    assign_material(obj, material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    add_bevel(obj, bevel)
    return obj


def add_axis_cylinder(name, center, axis, depth, radius, material, collection, vertices=48):
    direction = Vector(axis).normalized()
    start = Vector(center) - direction * (depth * 0.5)
    end = Vector(center) + direction * (depth * 0.5)
    return add_cylinder_between(name, start, end, radius, material, collection, vertices=vertices)


def add_torus(name, location, major_radius, minor_radius, material, collection, rotation=(0.0, 0.0, 0.0)):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=64,
        minor_segments=12,
        major_radius=major_radius,
        minor_radius=minor_radius,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    move_to_collection(obj, collection, name)
    assign_material(obj, material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def add_sphere(name, location, radius, material, collection, segments=16, rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=rings,
        radius=radius,
        location=location,
    )
    obj = bpy.context.object
    move_to_collection(obj, collection, name)
    assign_material(obj, material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def radial_point(theta, radius, z):
    return (radius * math.cos(theta), radius * math.sin(theta), z)


def add_radial_box(name, theta, radius, z, dimensions, material, collection, bevel=0.02, tangent_offset=0.0):
    """Box whose local Y axis points radially outward and local X is tangential."""
    radial = Vector((math.cos(theta), math.sin(theta), 0.0))
    tangent = Vector((math.sin(theta), -math.cos(theta), 0.0))
    location = radial * radius + tangent * tangent_offset
    location.z = z
    angle = theta - (math.pi * 0.5)
    return add_box(name, location, dimensions, material, collection, angle_z=angle, bevel=bevel)


def add_fastener_ring(prefix, center_z, radius, count, sphere_radius, material, collection):
    for index in range(count):
        theta = (2.0 * math.pi * index) / count
        x = radius * math.cos(theta)
        y = radius * math.sin(theta)
        add_sphere(
            f"{prefix}_{index + 1:02d}",
            (x, y, center_z),
            sphere_radius,
            material,
            collection,
            segments=12,
            rings=6,
        )


# -----------------------------------------------------------------------------
# V2 DETAIL SYSTEMS
# -----------------------------------------------------------------------------


def build_optical_refinement():
    c = COLLECTIONS["01 | OPTICAL DETAIL"]
    log("Refining optical telescope and aperture...")

    # Eight restrained thermal-blanket service panels around the telescope tube.
    for index in range(8):
        theta = (2.0 * math.pi * index) / 8.0
        add_radial_box(
            f"OPTICAL_THERMAL_BLANKET_PANEL_{index + 1:02d}",
            theta,
            1.548,
            5.58,
            (0.34, 0.035, 1.18),
            MAT["thermal"],
            c,
            bevel=0.012,
        )
        # Two tiny attachment points on each panel, at its upper and lower ends.
        for end_index, z in enumerate((5.06, 6.10), start=1):
            x = 1.572 * math.cos(theta)
            y = 1.572 * math.sin(theta)
            add_sphere(
                f"OPTICAL_PANEL_FASTENER_{index + 1:02d}_{end_index:02d}",
                (x, y, z),
                0.018,
                MAT["gold"],
                c,
                segments=12,
                rings=6,
            )

    # A second, inner precision lip and recessed baffle stages give the aperture depth.
    add_torus(
        "APERTURE_INNER_PRECISION_LIP",
        (0.0, 0.0, 8.215),
        1.135,
        0.022,
        MAT["gold"],
        c,
    )
    add_torus(
        "APERTURE_INTERNAL_BAFFLE_STAGE_01",
        (0.0, 0.0, 8.205),
        0.91,
        0.022,
        MAT["black"],
        c,
    )
    add_torus(
        "APERTURE_INTERNAL_BAFFLE_STAGE_02",
        (0.0, 0.0, 8.205),
        0.80,
        0.018,
        MAT["fastener"],
        c,
    )

    # Small machined fasteners around the primary aperture rim.
    add_fastener_ring(
        "APERTURE_RIM_MICRO_FASTENER",
        8.332,
        1.425,
        20,
        0.022,
        MAT["titanium"],
        c,
    )

    # Precision louvers on the two optical instrument housings.
    for side in (-1, 1):
        x = side * 1.685
        for index in range(5):
            z = 3.22 + index * 0.145
            add_box(
                f"OPTICAL_INSTRUMENT_LOUVER_{'PORT' if side < 0 else 'STARBOARD'}_{index + 1:02d}",
                (x, -0.01, z),
                (0.035, 0.48, 0.045),
                MAT["titanium"],
                c,
                bevel=0.008,
            )


def build_solar_refinement():
    c = COLLECTIONS["02 | SOLAR ARRAY DETAIL"]
    log("Refining solar wings, support ribs and deployment hinges...")

    for side, label in ((-1, "PORT"), (1, "STARBOARD")):
        # Three transverse support ribs per wing, mounted on the rear of the panel backing.
        for index, x_abs in enumerate((4.15, 6.30, 8.45), start=1):
            x = side * x_abs
            add_box(
                f"{label}_ARRAY_REAR_CROSS_RIB_{index:02d}",
                (x, 0.0, -1.245),
                (0.085, 2.58, 0.085),
                MAT["titanium"],
                c,
                bevel=0.018,
            )
            # Clamps where the cross ribs meet the two longitudinal spars.
            for row, y in enumerate((-0.75, 0.75), start=1):
                add_box(
                    f"{label}_ARRAY_RIB_CLAMP_{index:02d}_{row:02d}",
                    (x, y, -1.30),
                    (0.15, 0.13, 0.075),
                    MAT["gold"],
                    c,
                    bevel=0.018,
                )

        # Compact power-conditioning junction housing near the deployment root.
        x_root = side * 3.12
        add_box(
            f"{label}_ARRAY_POWER_JUNCTION_HOUSING",
            (x_root, 0.0, -1.335),
            (0.62, 0.55, 0.16),
            MAT["graphite"],
            c,
            bevel=0.045,
        )
        add_box(
            f"{label}_ARRAY_POWER_JUNCTION_COVER",
            (x_root, 0.0, -1.245),
            (0.42, 0.34, 0.035),
            MAT["thermal"],
            c,
            bevel=0.025,
        )
        for terminal in (-1, 1):
            add_sphere(
                f"{label}_ARRAY_POWER_CONTACT_{'A' if terminal < 0 else 'B'}",
                (x_root, terminal * 0.19, -1.215),
                0.035,
                MAT["gold"],
                c,
                segments=12,
                rings=6,
            )

        # Hinge drum and end collars make the deployment joint read as engineered hardware.
        add_axis_cylinder(
            f"{label}_ARRAY_HINGE_DRUM",
            (side * 2.55, 0.0, -1.12),
            (1.0, 0.0, 0.0),
            0.66,
            0.19,
            MAT["graphite"],
            c,
        )
        for end_index, x_abs in enumerate((2.23, 2.87), start=1):
            x = side * x_abs
            add_axis_cylinder(
                f"{label}_ARRAY_HINGE_COLLAR_{end_index:02d}",
                (x, 0.0, -1.12),
                (1.0, 0.0, 0.0),
                0.075,
                0.215,
                MAT["gold"],
                c,
                vertices=40,
            )
            add_axis_cylinder(
                f"{label}_ARRAY_HINGE_BOLT_CAP_{end_index:02d}",
                (x + side * 0.045, 0.0, -1.12),
                (1.0, 0.0, 0.0),
                0.035,
                0.105,
                MAT["titanium"],
                c,
                vertices=32,
            )


def build_service_bus_refinement():
    c = COLLECTIONS["03 | SERVICE BUS DETAIL"]
    log("Adding service-bus radiator banks, access details and fasteners...")

    # Four louvered radiator banks around the cylindrical bus. Their positions avoid
    # the forward observation module (+Y) and the rear high-gain dish (-Y).
    radiator_angles = (30.0, 150.0, 210.0, 330.0)
    for module_index, degrees in enumerate(radiator_angles, start=1):
        theta = math.radians(degrees)
        label = f"BUS_RADIATOR_BANK_{module_index:02d}"
        add_radial_box(
            f"{label}_BACKPLATE",
            theta,
            2.135,
            0.53,
            (0.88, 0.105, 0.94),
            MAT["radiator"],
            c,
            bevel=0.035,
        )

        # Outer perimeter rails.
        add_radial_box(f"{label}_FRAME_LEFT", theta, 2.205, 0.53, (0.055, 0.075, 0.94), MAT["titanium"], c, 0.012, tangent_offset=-0.41)
        add_radial_box(f"{label}_FRAME_RIGHT", theta, 2.205, 0.53, (0.055, 0.075, 0.94), MAT["titanium"], c, 0.012, tangent_offset=0.41)
        add_radial_box(f"{label}_FRAME_TOP", theta, 2.205, 0.98, (0.88, 0.075, 0.055), MAT["gold"], c, 0.012)
        add_radial_box(f"{label}_FRAME_BOTTOM", theta, 2.205, 0.08, (0.88, 0.075, 0.055), MAT["gold"], c, 0.012)

        # Six independently modelled louver slats per radiator bank.
        for slat_index in range(6):
            z = 0.19 + slat_index * 0.135
            add_radial_box(
                f"{label}_LOUVER_{slat_index + 1:02d}",
                theta,
                2.222,
                z,
                (0.72, 0.045, 0.052),
                MAT["thermal"] if slat_index % 2 == 0 else MAT["titanium"],
                c,
                bevel=0.012,
            )

        # Four corner fasteners on the radiator frame.
        for width_sign in (-1, 1):
            for height_sign in (-1, 1):
                tangent = Vector((math.sin(theta), -math.cos(theta), 0.0))
                radial = Vector((math.cos(theta), math.sin(theta), 0.0))
                center = radial * 2.255 + tangent * (width_sign * 0.38)
                center.z = 0.53 + height_sign * 0.40
                add_sphere(
                    f"{label}_FRAME_FASTENER_{'L' if width_sign < 0 else 'R'}_{'B' if height_sign < 0 else 'T'}",
                    center,
                    0.025,
                    MAT["gold"],
                    c,
                    segments=12,
                    rings=6,
                )

    # Fastener heads around the upper and lower structural interfaces.
    add_fastener_ring("UPPER_BUS_RING_FASTENER", 1.79, 2.155, 20, 0.026, MAT["gold"], c)
    add_fastener_ring("LOWER_BUS_RING_FASTENER", -2.52, 2.17, 16, 0.026, MAT["gold"], c)

    # Small instrumentation covers on the aft-facing service hatches.
    for side in (-1, 1):
        y = side * 2.078
        add_box(
            f"BUS_HATCH_STATUS_PLATE_{'AFT' if side < 0 else 'FORWARD'}",
            (0.0, y, -0.90),
            (0.52, 0.025, 0.66),
            MAT["thermal"],
            c,
            bevel=0.025,
        )
        for index in range(3):
            z = -1.12 + index * 0.20
            add_box(
                f"BUS_HATCH_STATUS_SLOT_{'AFT' if side < 0 else 'FORWARD'}_{index + 1:02d}",
                (0.0, y + side * 0.018, z),
                (0.28, 0.018, 0.035),
                MAT["titanium"],
                c,
                bevel=0.008,
            )


def build_observation_module_refinement():
    c = COLLECTIONS["04 | OBSERVATION MODULE DETAIL"]
    log("Refining panoramic observation window and protective glazing frame...")

    # Inner gasket perimeter, placed just outside the existing glass face at +Y.
    face_y = 2.665
    add_box("OBSERVATION_WINDOW_INNER_GASKET_TOP", (0.0, face_y, 1.245), (2.72, 0.045, 0.045), MAT["black"], c, bevel=0.012)
    add_box("OBSERVATION_WINDOW_INNER_GASKET_BOTTOM", (0.0, face_y, 0.055), (2.72, 0.045, 0.045), MAT["black"], c, bevel=0.012)
    add_box("OBSERVATION_WINDOW_INNER_GASKET_PORT", (-1.355, face_y, 0.65), (0.045, 0.045, 1.18), MAT["black"], c, bevel=0.012)
    add_box("OBSERVATION_WINDOW_INNER_GASKET_STARBOARD", (1.355, face_y, 0.65), (0.045, 0.045, 1.18), MAT["black"], c, bevel=0.012)

    # Additional slim mullions divide the wide viewport into protected optical sections.
    for index, x in enumerate((-0.91, 0.91), start=1):
        add_box(
            f"OBSERVATION_WINDOW_VERTICAL_MULLION_{index:02d}",
            (x, 2.675, 0.65),
            (0.032, 0.045, 1.10),
            MAT["titanium"],
            c,
            bevel=0.009,
        )

    # Low-profile cyan edge indicators and perimeter bolts.
    for side, label in ((-1, "PORT"), (1, "STARBOARD")):
        add_box(
            f"OBSERVATION_WINDOW_EDGE_LIGHT_{label}",
            (side * 1.285, 2.687, 0.65),
            (0.018, 0.018, 0.68),
            MAT["cyan"],
            c,
            bevel=0.006,
        )

    bolt_positions = []
    for x in (-1.20, -0.60, 0.60, 1.20):
        bolt_positions.append((x, 2.695, 1.255))
        bolt_positions.append((x, 2.695, 0.045))
    for z in (0.30, 0.95):
        bolt_positions.append((-1.36, 2.695, z))
        bolt_positions.append((1.36, 2.695, z))
    for index, position in enumerate(bolt_positions, start=1):
        add_sphere(
            f"OBSERVATION_WINDOW_FRAME_BOLT_{index:02d}",
            position,
            0.022,
            MAT["gold"],
            c,
            segments=12,
            rings=6,
        )


def build_communications_refinement():
    c = COLLECTIONS["05 | COMMUNICATIONS DETAIL"]
    log("Refining high-gain dish, optical sensors and antenna details...")

    # High-gain dish rim: the existing dish is oriented in the XZ plane on the aft (-Y) side.
    add_torus(
        "HIGH_GAIN_DISH_PRECISION_RIM",
        (0.0, -2.305, 1.32),
        0.625,
        0.024,
        MAT["titanium"],
        c,
        rotation=(math.pi * 0.5, 0.0, 0.0),
    )

    # Feed support stays behind the dish face; four lightweight struts converge at the feed.
    feed_point = (0.0, -2.405, 1.32)
    rim_points = (
        (-0.47, -2.30, 1.32),
        (0.47, -2.30, 1.32),
        (0.0, -2.30, 1.79),
        (0.0, -2.30, 0.85),
    )
    for index, point in enumerate(rim_points, start=1):
        add_cylinder_between(
            f"HIGH_GAIN_DISH_FEED_SUPPORT_{index:02d}",
            feed_point,
            point,
            0.018,
            MAT["gold"],
            c,
            vertices=16,
        )

    add_axis_cylinder(
        "HIGH_GAIN_DISH_FEED_HORN",
        (0.0, -2.425, 1.32),
        (0.0, 1.0, 0.0),
        0.16,
        0.075,
        MAT["coating"],
        c,
        vertices=32,
    )

    # Lens stacks on the paired optical navigation sensor heads, facing outward along X.
    for side, label in ((-1, "PORT"), (1, "STARBOARD")):
        center_x = side * 2.655
        rotation = (0.0, side * (math.pi * 0.5), 0.0)
        add_torus(
            f"NAV_SENSOR_LENS_RETAINING_RING_{label}",
            (center_x, 0.0, 2.72),
            0.115,
            0.018,
            MAT["gold"],
            c,
            rotation=rotation,
        )
        add_axis_cylinder(
            f"NAV_SENSOR_OPTICAL_LENS_{label}",
            (center_x + side * 0.008, 0.0, 2.72),
            (1.0, 0.0, 0.0),
            0.035,
            0.082,
            MAT["coating"],
            c,
            vertices=40,
        )
        add_sphere(
            f"NAV_SENSOR_LENS_HIGHLIGHT_{label}",
            (center_x + side * 0.028, -0.028, 2.755),
            0.018,
            MAT["cyan"],
            c,
            segments=12,
            rings=6,
        )

    # Small clamps at the existing antenna booms.
    for side, label in ((-1, "PORT"), (1, "STARBOARD")):
        for index, z in enumerate((1.86, 2.43), start=1):
            add_box(
                f"ANTENNA_BOOM_CLAMP_{label}_{index:02d}",
                (side * 1.89, 0.0, z),
                (0.18, 0.16, 0.10),
                MAT["gold"],
                c,
                bevel=0.025,
            )


def build_propulsion_refinement():
    c = COLLECTIONS["06 | PROPULSION DETAIL"]
    log("Adding nozzle liners, aft thermal hardware and RCS port rims...")

    # Precision lips and fasteners around the four existing main thruster mouths.
    for nozzle_index, (x, y) in enumerate(((-0.88, -0.88), (0.88, -0.88), (-0.88, 0.88), (0.88, 0.88)), start=1):
        add_torus(
            f"MAIN_THRUSTER_NOZZLE_RIM_{nozzle_index:02d}",
            (x, y, -3.485),
            0.275,
            0.024,
            MAT["titanium"],
            c,
        )
        for bolt_index in range(6):
            theta = (2.0 * math.pi * bolt_index) / 6.0
            add_sphere(
                f"MAIN_THRUSTER_RIM_FASTENER_{nozzle_index:02d}_{bolt_index + 1:02d}",
                (x + 0.295 * math.cos(theta), y + 0.295 * math.sin(theta), -3.475),
                0.018,
                MAT["gold"],
                c,
                segments=12,
                rings=6,
            )

    # A restrained aft thermal interface collar around the propulsion adapter.
    add_torus(
        "AFT_PROPULSION_THERMAL_INTERFACE_RING",
        (0.0, 0.0, -2.84),
        1.56,
        0.035,
        MAT["gold"],
        c,
    )

    # RCS outlets on the port and starboard bus faces.
    for side, label in ((-1, "PORT"), (1, "STARBOARD")):
        for index, z in enumerate((-1.70, 0.85), start=1):
            x_face = side * 2.215
            rotation = (0.0, side * (math.pi * 0.5), 0.0)
            add_torus(
                f"RCS_THRUSTER_RETAINING_RIM_{label}_{index:02d}",
                (x_face, 0.0, z),
                0.105,
                0.018,
                MAT["titanium"],
                c,
                rotation=rotation,
            )
            add_axis_cylinder(
                f"RCS_THRUSTER_DARK_RECESS_{label}_{index:02d}",
                (x_face + side * 0.018, 0.0, z),
                (1.0, 0.0, 0.0),
                0.032,
                0.073,
                MAT["black"],
                c,
                vertices=32,
            )


# -----------------------------------------------------------------------------
# REVIEW CAMERAS / RENDERS
# -----------------------------------------------------------------------------


def make_camera(name, location, target, lens, collection):
    camera_data = bpy.data.cameras.new(name)
    camera_obj = bpy.data.objects.new(name, camera_data)
    collection.objects.link(camera_obj)
    camera_obj.location = Vector(location)
    direction = Vector(target) - camera_obj.location
    camera_obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    camera_data.lens = lens
    camera_data.sensor_width = 36.0
    camera_data.clip_start = 0.1
    camera_data.clip_end = 250.0
    camera_obj["ASTRA_V2_REVIEW_CAMERA"] = True
    return camera_obj


def render_view(scene, camera, filename, resolution=(1400, 1050)):
    scene.camera = camera
    scene.render.resolution_x = resolution[0]
    scene.render.resolution_y = resolution[1]
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    output_path = RENDER_DIR / filename
    scene.render.filepath = str(output_path)
    log(f"Rendering {filename}...")
    bpy.ops.render.render(write_still=True)
    return output_path


def configure_and_render():
    scene = bpy.context.scene
    camera_collection = create_collection("90 | V2 REVIEW CAMERAS", bpy.context.scene.collection)

    # Blender 5.2.4 on the user's system supports BLENDER_EEVEE.
    try:
        scene.render.engine = "BLENDER_EEVEE"
    except Exception:
        log("Could not set BLENDER_EEVEE explicitly; retaining the source scene render engine.")

    iso = make_camera(
        "ASTRA_V2_CAMERA_ISOMETRIC",
        (26.0, 35.0, 23.0),
        (0.0, 0.0, 2.1),
        50.0,
        camera_collection,
    )
    front = make_camera(
        "ASTRA_V2_CAMERA_OBSERVATION_FRONT",
        (0.0, 37.0, 4.4),
        (0.0, 0.0, 2.1),
        42.0,
        camera_collection,
    )
    side = make_camera(
        "ASTRA_V2_CAMERA_SIDE_PROFILE",
        (37.0, 0.0, 4.4),
        (0.0, 0.0, 2.1),
        42.0,
        camera_collection,
    )
    optics = make_camera(
        "ASTRA_V2_CAMERA_OPTICAL_DETAIL",
        (8.0, 20.0, 11.0),
        (0.0, 0.0, 6.15),
        72.0,
        camera_collection,
    )
    observation = make_camera(
        "ASTRA_V2_CAMERA_OBSERVATION_DETAIL",
        (0.0, 12.5, 2.2),
        (0.0, 2.0, 0.65),
        65.0,
        camera_collection,
    )

    # Review renders are intentionally separate from V1's original render files.
    render_view(scene, iso, "astra01-v2-isometric.png", (1600, 1200))
    render_view(scene, front, "astra01-v2-observation-front.png", (1600, 1200))
    render_view(scene, side, "astra01-v2-side-profile.png", (1600, 1200))
    render_view(scene, optics, "astra01-v2-optical-detail.png", (1200, 1200))
    render_view(scene, observation, "astra01-v2-observation-detail.png", (1200, 900))

    # Leave the V2 file opening on the isometric review camera and resolution.
    scene.camera = iso
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.filepath = str(RENDER_DIR / "astra01-v2-isometric.png")


# -----------------------------------------------------------------------------
# MAIN
# -----------------------------------------------------------------------------


def main():
    log("=" * 64)
    log("ASTRA-01 | DETAILED EXTERIOR V2")
    log("=" * 64)
    log(f"V1 source: {SOURCE_BLEND}")
    log(f"V2 output: {OUTPUT_BLEND}")

    if not SOURCE_BLEND.exists():
        raise FileNotFoundError(
            "V1 source project not found. Expected: " + str(SOURCE_BLEND)
        )

    RENDER_DIR.mkdir(parents=True, exist_ok=True)

    log("Opening approved V1 project (read-only source; V2 will be saved separately)...")
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE_BLEND))

    scene = bpy.context.scene
    v2_root = create_collection("ASTRA-01 | DETAILED V2", scene.collection)
    v2_root["design_version"] = "2.0"
    v2_root["source_project"] = SOURCE_BLEND.name
    v2_root["purpose"] = "Non-destructive exterior detail refinement"

    create_collection("01 | OPTICAL DETAIL", v2_root)
    create_collection("02 | SOLAR ARRAY DETAIL", v2_root)
    create_collection("03 | SERVICE BUS DETAIL", v2_root)
    create_collection("04 | OBSERVATION MODULE DETAIL", v2_root)
    create_collection("05 | COMMUNICATIONS DETAIL", v2_root)
    create_collection("06 | PROPULSION DETAIL", v2_root)

    load_materials()

    build_optical_refinement()
    build_solar_refinement()
    build_service_bus_refinement()
    build_observation_module_refinement()
    build_communications_refinement()
    build_propulsion_refinement()

    log(f"New detail objects created: {len(CREATED_OBJECTS)}")
    log("Preparing five isolated V2 review renders...")
    configure_and_render()

    # Save to a new project path. Never save over the V1 source.
    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT_BLEND))

    scene = bpy.context.scene
    mesh_count = sum(1 for obj in scene.objects if obj.type == "MESH")
    total_vertices = sum(len(obj.data.vertices) for obj in scene.objects if obj.type == "MESH")
    total_faces = sum(len(obj.data.polygons) for obj in scene.objects if obj.type == "MESH")

    log("=" * 64)
    log("ASTRA-01 DETAILED V2 BUILD COMPLETED")
    log("=" * 64)
    log(f"V2 project: {OUTPUT_BLEND}")
    log(f"Review renders: {RENDER_DIR}")
    log(f"New detail objects: {len(CREATED_OBJECTS)}")
    log(f"Total mesh objects in scene: {mesh_count}")
    log(f"Total vertices: {total_vertices}")
    log(f"Total faces: {total_faces}")
    log("V1 source project left untouched.")
    log("No frontend files modified.")
    log("=" * 64)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("\nASTRA-01 V2 BUILD FAILED", file=sys.stderr)
        print(f"Reason: {exc}", file=sys.stderr)
        traceback.print_exc()
        raise
