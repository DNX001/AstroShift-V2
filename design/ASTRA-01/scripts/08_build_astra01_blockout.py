import bpy
import math

from pathlib import Path
from mathutils import Vector


# ============================================================
# ASTRA-01 | PROCEDURAL SPACECRAFT BLOCKOUT V1
# Blender 5.2.4 LTS
#
# Coordinate convention:
#   +Z = Optical aperture
#   +/-X = Solar-array wings
#   +Y = Observation window
#   -Z = Propulsion / aft
#
# This script creates a NEW scene.
# All original Hubble reference assets remain untouched.
# ============================================================

SCRIPT_DIR = Path(__file__).resolve().parent
ASTRA_DIR = SCRIPT_DIR.parent

SOURCE_DIR = ASTRA_DIR / "source"
RENDER_DIR = ASTRA_DIR / "renders" / "blockout-v1"

OUTPUT_BLEND = SOURCE_DIR / "astra-01-blockout-v1.blend"

ROOT = None
COLLECTIONS = {}
MATERIALS = {}


# ============================================================
# MATERIAL SYSTEM
# ============================================================

def create_material(name, color, metallic=0.0, roughness=0.4):

    material = bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1.0)
    material.use_nodes = True

    shader = material.node_tree.nodes.get("Principled BSDF")

    shader.inputs["Base Color"].default_value = (*color, 1.0)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness

    return material


def setup_materials():

    MATERIALS["titanium"] = create_material(
        "ASTRA | Satin Titanium",
        (0.28, 0.34, 0.42),
        0.82,
        0.29
    )

    MATERIALS["graphite"] = create_material(
        "ASTRA | Deep Graphite",
        (0.027, 0.039, 0.058),
        0.72,
        0.34
    )

    MATERIALS["ceramic"] = create_material(
        "ASTRA | Ceramic White",
        (0.65, 0.70, 0.75),
        0.34,
        0.38
    )

    MATERIALS["gold"] = create_material(
        "ASTRA | Muted Thermal Gold",
        (0.52, 0.32, 0.13),
        0.68,
        0.38
    )

    MATERIALS["solar"] = create_material(
        "ASTRA | Deep Blue Photovoltaic Cells",
        (0.012, 0.065, 0.17),
        0.63,
        0.24
    )

    MATERIALS["glass"] = create_material(
        "ASTRA | Observation Glass",
        (0.006, 0.038, 0.075),
        0.52,
        0.16
    )

    MATERIALS["dark"] = create_material(
        "ASTRA | Aperture Black",
        (0.003, 0.006, 0.012),
        0.25,
        0.2
    )

    MATERIALS["cyan"] = create_material(
        "ASTRA | Cyan Instrument Indicators",
        (0.015, 0.35, 0.48),
        0.42,
        0.23
    )


# ============================================================
# COLLECTION MANAGEMENT
# ============================================================

def create_collection(name, parent):

    collection = bpy.data.collections.new(name)
    parent.children.link(collection)

    COLLECTIONS[name] = collection

    return collection


def link_object(obj, collection, parent_root=True):

    for old_collection in list(obj.users_collection):
        old_collection.objects.unlink(obj)

    collection.objects.link(obj)

    if parent_root and ROOT is not None:
        obj.parent = ROOT

    return obj


def assign_material(obj, material):

    if material:
        obj.data.materials.append(material)

    return obj


# ============================================================
# GEOMETRY HELPERS
# ============================================================

def apply_scale(obj):

    bpy.ops.object.select_all(action="DESELECT")

    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.object.transform_apply(
        location=False,
        rotation=False,
        scale=True
    )

    obj.select_set(False)


def add_bevel(obj, width=0.04, segments=3):

    if width <= 0:
        return obj

    modifier = obj.modifiers.new(
        "Machined Edge Bevel",
        "BEVEL"
    )

    modifier.width = width
    modifier.segments = segments
    modifier.limit_method = "ANGLE"

    normal = obj.modifiers.new(
        "Weighted Surface Normals",
        "WEIGHTED_NORMAL"
    )

    normal.keep_sharp = True

    return obj


def add_box(
    name,
    location,
    dimensions,
    material,
    collection,
    bevel=0.04
):

    bpy.ops.mesh.primitive_cube_add(
        size=1,
        location=location
    )

    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions

    apply_scale(obj)

    assign_material(obj, material)

    if bevel:
        add_bevel(obj, bevel)

    return link_object(obj, collection)


def add_cylinder(
    name,
    radius,
    depth,
    location,
    material,
    collection,
    rotation=(0, 0, 0),
    vertices=96,
    bevel=0.015
):

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
        rotation=rotation
    )

    obj = bpy.context.object
    obj.name = name

    assign_material(obj, material)

    if bevel:
        add_bevel(obj, bevel, 3)

    # Smooth cylindrical sides; keep end caps flat.
    for polygon in obj.data.polygons:
        polygon.use_smooth = len(polygon.vertices) == 4

    return link_object(obj, collection)


def add_cone(
    name,
    radius_bottom,
    radius_top,
    depth,
    location,
    material,
    collection
):

    bpy.ops.mesh.primitive_cone_add(
        vertices=64,
        radius1=radius_bottom,
        radius2=radius_top,
        depth=depth,
        location=location
    )

    obj = bpy.context.object
    obj.name = name

    assign_material(obj, material)

    for polygon in obj.data.polygons:
        polygon.use_smooth = len(polygon.vertices) == 4

    add_bevel(obj, 0.025, 3)

    return link_object(obj, collection)


def add_sphere(
    name,
    location,
    scale,
    material,
    collection
):

    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=48,
        ring_count=24,
        radius=1,
        location=location
    )

    obj = bpy.context.object
    obj.name = name
    obj.scale = scale

    apply_scale(obj)

    assign_material(obj, material)

    for polygon in obj.data.polygons:
        polygon.use_smooth = True

    return link_object(obj, collection)


def add_torus(
    name,
    major_radius,
    minor_radius,
    location,
    material,
    collection,
    rotation=(0, 0, 0)
):

    bpy.ops.mesh.primitive_torus_add(
        major_segments=96,
        minor_segments=16,
        major_radius=major_radius,
        minor_radius=minor_radius,
        location=location,
        rotation=rotation
    )

    obj = bpy.context.object
    obj.name = name

    assign_material(obj, material)

    for polygon in obj.data.polygons:
        polygon.use_smooth = True

    return link_object(obj, collection)


def add_cylinder_between(
    name,
    start,
    end,
    radius,
    material,
    collection
):

    start = Vector(start)
    end = Vector(end)

    direction = end - start
    center = (start + end) / 2

    rotation = direction.to_track_quat(
        "Z",
        "Y"
    ).to_euler()

    return add_cylinder(
        name,
        radius,
        direction.length,
        center,
        material,
        collection,
        rotation=rotation
    )


def add_poly_curve(
    name,
    polylines,
    radius,
    material,
    collection,
    cyclic=False
):

    curve = bpy.data.curves.new(
        name,
        type="CURVE"
    )

    curve.dimensions = "3D"
    curve.resolution_u = 12

    curve.bevel_depth = radius
    curve.bevel_resolution = 3

    for coordinates in polylines:

        spline = curve.splines.new("POLY")

        spline.points.add(len(coordinates) - 1)

        for point, coordinate in zip(
            spline.points,
            coordinates
        ):

            point.co = (
                coordinate[0],
                coordinate[1],
                coordinate[2],
                1
            )

        spline.use_cyclic_u = cyclic

    obj = bpy.data.objects.new(name, curve)

    collection.objects.link(obj)
    obj.parent = ROOT

    if material:
        obj.data.materials.append(material)

    return obj


# ============================================================
# CURVED OBSERVATION WINDOW
# ============================================================

def create_curved_window(
    name,
    width,
    height,
    center_z,
    base_y,
    bulge,
    material,
    collection
):

    segments_x = 32
    segments_z = 14

    vertices = []
    faces = []

    for j in range(segments_z + 1):

        v = j / segments_z
        z = center_z + (v - 0.5) * height

        for i in range(segments_x + 1):

            u = i / segments_x

            x = (u - 0.5) * width

            y = base_y + bulge * (
                1.0 - (2.0 * x / width) ** 2
            )

            vertices.append((x, y, z))

    for j in range(segments_z):

        for i in range(segments_x):

            lower_left = (
                j * (segments_x + 1) + i
            )

            upper_left = (
                (j + 1) * (segments_x + 1) + i
            )

            upper_right = upper_left + 1
            lower_right = lower_left + 1

            faces.append((
                lower_left,
                upper_left,
                upper_right,
                lower_right
            ))

    mesh = bpy.data.meshes.new(
        name + "_MESH"
    )

    mesh.from_pydata(
        vertices,
        [],
        faces
    )

    mesh.update()

    obj = bpy.data.objects.new(
        name,
        mesh
    )

    collection.objects.link(obj)
    obj.parent = ROOT

    assign_material(obj, material)

    for polygon in obj.data.polygons:
        polygon.use_smooth = True

    solidify = obj.modifiers.new(
        "Optical Window Thickness",
        "SOLIDIFY"
    )

    solidify.thickness = 0.035
    solidify.offset = 0

    return obj


# ============================================================
# OBSERVATION WINDOW FRAME
# ============================================================

def create_observation_frame(collection):

    width = 2.75
    height = 1.20

    center_z = 0.65

    base_y = 2.49
    bulge = 0.13

    def surface_y(x):

        return base_y + bulge * (
            1 - (2 * x / width) ** 2
        )

    left = -width / 2
    right = width / 2

    bottom = center_z - height / 2
    top = center_z + height / 2

    points = []

    for z in (bottom, top):

        points.append([
            (
                left + (right - left) * i / 24,
                surface_y(left + (right - left) * i / 24),
                z
            )
            for i in range(25)
        ])

    for x in (left, right):

        points.append([
            (
                x,
                surface_y(x),
                bottom + (top - bottom) * i / 12
            )
            for i in range(13)
        ])

    # Central vertical divider.
    points.append([
        (
            0,
            surface_y(0) + 0.025,
            bottom + (top - bottom) * i / 16
        )
        for i in range(17)
    ])

    add_poly_curve(
        "OBSERVATION_WINDOW_FRAME",
        points,
        0.045,
        MATERIALS["gold"],
        collection
    )


# ============================================================
# SOLAR ARRAY GEOMETRY
# ============================================================

def create_solar_cells(
    name,
    center_x,
    side,
    z,
    collection
):

    length = 7.5
    width = 2.9

    columns = 14
    rows = 5

    margin_x = 0.13
    margin_y = 0.13
    gap = 0.045

    usable_x = length - 2 * margin_x
    usable_y = width - 2 * margin_y

    cell_width = (
        usable_x - gap * (columns - 1)
    ) / columns

    cell_height = (
        usable_y - gap * (rows - 1)
    ) / rows

    start_x = center_x - length / 2 + margin_x
    start_y = -width / 2 + margin_y

    vertices = []
    faces = []

    for row in range(rows):

        for column in range(columns):

            x0 = (
                start_x
                + column * (cell_width + gap)
            )

            x1 = x0 + cell_width

            y0 = (
                start_y
                + row * (cell_height + gap)
            )

            y1 = y0 + cell_height

            base = len(vertices)

            vertices.extend([
                (x0, y0, z),
                (x1, y0, z),
                (x1, y1, z),
                (x0, y1, z),
            ])

            faces.append((
                base,
                base + 1,
                base + 2,
                base + 3
            ))

    mesh = bpy.data.meshes.new(
        name + "_MESH"
    )

    mesh.from_pydata(
        vertices,
        [],
        faces
    )

    mesh.update()

    obj = bpy.data.objects.new(
        name,
        mesh
    )

    collection.objects.link(obj)
    obj.parent = ROOT

    assign_material(
        obj,
        MATERIALS["solar"]
    )

    thickness = obj.modifiers.new(
        "Solar Cell Substrate",
        "SOLIDIFY"
    )

    thickness.thickness = 0.022

    return obj


def create_solar_wing(side, collection):

    prefix = "PORT" if side < 0 else "STARBOARD"

    panel_length = 7.5
    panel_width = 2.9

    center_x = side * 6.3

    panel_z = -1.12

    # Dark structural backing.
    add_box(
        prefix + "_SOLAR_PANEL_BACKING",
        (center_x, 0, panel_z),
        (panel_length, panel_width, 0.14),
        MATERIALS["graphite"],
        collection,
        0.055
    )

    # Photovoltaic cell grid.
    create_solar_cells(
        prefix + "_PHOTOVOLTAIC_CELLS",
        center_x,
        side,
        panel_z + 0.082,
        collection
    )

    # Outer and inner frame rails.
    frame_z = panel_z + 0.09

    for y in (-1.49, 1.49):

        add_box(
            prefix + "_ARRAY_LONG_RAIL",
            (center_x, y, frame_z),
            (panel_length + 0.12, 0.075, 0.10),
            MATERIALS["titanium"],
            collection,
            0.025
        )

    for x in (
        center_x - panel_length / 2,
        center_x + panel_length / 2
    ):

        add_box(
            prefix + "_ARRAY_END_RAIL",
            (x, 0, frame_z),
            (0.075, panel_width + 0.16, 0.10),
            MATERIALS["titanium"],
            collection,
            0.025
        )

    # Central structural spars.
    for y in (-0.75, 0.75):

        add_box(
            prefix + "_PANEL_SPAR",
            (center_x, y, panel_z - 0.035),
            (panel_length, 0.055, 0.09),
            MATERIALS["gold"],
            collection,
            0.018
        )

    # Wing hinge assembly.
    hinge_x = side * 2.55

    add_cylinder(
        prefix + "_ARRAY_HINGE",
        0.25,
        0.72,
        (hinge_x, 0, panel_z),
        MATERIALS["gold"],
        collection,
        rotation=(0, math.pi / 2, 0)
    )

    add_cylinder(
        prefix + "_HINGE_AXIS",
        0.11,
        0.90,
        (hinge_x, 0, panel_z),
        MATERIALS["titanium"],
        collection,
        rotation=(0, math.pi / 2, 0)
    )


def build_power_system():

    collection = COLLECTIONS["POWER_SYSTEM"]

    panel_z = -1.12

    # Main deployable support spar.
    add_cylinder_between(
        "SOLAR_ARRAY_MAIN_DEPLOYMENT_BOOM",
        (-10.15, 0, panel_z),
        (10.15, 0, panel_z),
        0.085,
        MATERIALS["titanium"],
        collection
    )

    create_solar_wing(-1, collection)
    create_solar_wing(1, collection)


# ============================================================
# SERVICE BUS
# ============================================================

def build_service_bus():

    collection = COLLECTIONS["SERVICE_BUS"]

    # Central cylindrical equipment body.
    add_cylinder(
        "MAIN_PRESSURISED_SERVICE_BUS",
        2.08,
        4.60,
        (0, 0, -0.35),
        MATERIALS["titanium"],
        collection,
        bevel=0.045
    )

    # Lower structural collar.
    add_torus(
        "LOWER_BUS_STRUCTURAL_RING",
        2.07,
        0.085,
        (0, 0, -2.52),
        MATERIALS["gold"],
        collection
    )

    # Upper structural collar.
    add_torus(
        "UPPER_BUS_STRUCTURAL_RING",
        2.07,
        0.075,
        (0, 0, 1.78),
        MATERIALS["gold"],
        collection
    )

    # Optical transition adapter.
    add_cone(
        "OPTICAL_BUS_ADAPTER",
        2.00,
        1.53,
        0.68,
        (0, 0, 2.07),
        MATERIALS["graphite"],
        collection
    )

    # Service equipment bays on the lateral sides.
    for side in (-1, 1):

        add_box(
            "SERVICE_EQUIPMENT_BAY",
            (side * 2.02, -0.12, -0.12),
            (0.38, 1.42, 1.75),
            MATERIALS["graphite"],
            collection,
            0.12
        )

        add_box(
            "SERVICE_BAY_ACCESS_PANEL",
            (side * 2.23, -0.12, -0.12),
            (0.045, 0.92, 1.15),
            MATERIALS["gold"],
            collection,
            0.035
        )

    # Rear cylindrical propulsion interface.
    add_cylinder(
        "AFT_PROPULSION_INTERFACE",
        1.55,
        0.48,
        (0, 0, -2.82),
        MATERIALS["graphite"],
        collection
    )

    # Subtle mechanical access panels.
    for side in (-1, 1):

        add_box(
            "BUS_SERVICE_HATCH",
            (0, side * 2.035, -0.9),
            (0.82, 0.07, 1.05),
            MATERIALS["graphite"],
            collection,
            0.065
        )


# ============================================================
# OPTICAL TELESCOPE
# ============================================================

def build_optical_system():

    collection = COLLECTIONS["OPTICAL_SYSTEM"]

    # Main optical tube.
    add_cylinder(
        "PRIMARY_OPTICAL_TUBE",
        1.53,
        5.65,
        (0, 0, 5.10),
        MATERIALS["ceramic"],
        collection,
        bevel=0.055
    )

    # Machined tube reinforcement collars.
    for z in (2.55, 3.15, 6.95, 7.72):

        add_torus(
            "OPTICAL_TUBE_REINFORCEMENT_COLLAR",
            1.53,
            0.065,
            (0, 0, z),
            MATERIALS["graphite"],
            collection
        )

    # Thin gold accent ring.
    add_torus(
        "OPTICAL_TUBE_ACCENT_RING",
        1.545,
        0.025,
        (0, 0, 4.15),
        MATERIALS["gold"],
        collection
    )

    # Aperture housing.
    add_cylinder(
        "PRIMARY_APERTURE_HOUSING",
        1.43,
        0.32,
        (0, 0, 8.02),
        MATERIALS["graphite"],
        collection
    )

    # Optical aperture rim.
    add_torus(
        "PRIMARY_APERTURE_PRECISION_RIM",
        1.39,
        0.115,
        (0, 0, 8.20),
        MATERIALS["titanium"],
        collection
    )

    add_torus(
        "INNER_APERTURE_ACCENT",
        1.19,
        0.035,
        (0, 0, 8.22),
        MATERIALS["gold"],
        collection
    )

    # Dark primary optical face.
    add_cylinder(
        "OPTICAL_FACE",
        1.20,
        0.035,
        (0, 0, 8.18),
        MATERIALS["dark"],
        collection,
        bevel=0.005
    )

    # Secondary mirror and support struts.
    add_box(
        "SECONDARY_MIRROR_SUPPORT_X",
        (0, 0, 8.25),
        (2.16, 0.035, 0.035),
        MATERIALS["titanium"],
        collection,
        0.012
    )

    add_box(
        "SECONDARY_MIRROR_SUPPORT_Y",
        (0, 0, 8.25),
        (0.035, 2.16, 0.035),
        MATERIALS["titanium"],
        collection,
        0.012
    )

    add_sphere(
        "SECONDARY_OPTICAL_MIRROR",
        (0, 0, 8.30),
        (0.23, 0.23, 0.09),
        MATERIALS["graphite"],
        collection
    )

    # Instrument housings around the tube.
    for side in (-1, 1):

        add_box(
            "OPTICAL_INSTRUMENT_HOUSING",
            (side * 1.48, 0, 3.55),
            (0.34, 0.95, 1.35),
            MATERIALS["graphite"],
            collection,
            0.09
        )

        add_box(
            "OPTICAL_HOUSING_ACCENT",
            (side * 1.68, -0.02, 3.55),
            (0.035, 0.56, 0.82),
            MATERIALS["gold"],
            collection,
            0.012
        )


# ============================================================
# OBSERVATION MODULE
# ============================================================

def build_observation_module():

    collection = COLLECTIONS["OBSERVATION_MODULE"]

    # Compact forward-facing housing.
    add_box(
        "FORWARD_OBSERVATION_MODULE_HOUSING",
        (0, 1.98, 0.65),
        (3.30, 0.90, 1.82),
        MATERIALS["graphite"],
        collection,
        0.32
    )

    # Metallic perimeter frame.
    add_box(
        "OBSERVATION_MODULE_OUTER_FRAME",
        (0, 2.40, 0.65),
        (3.02, 0.12, 1.58),
        MATERIALS["titanium"],
        collection,
        0.25
    )

    # Curved panoramic optical window.
    create_curved_window(
        "ASTRA_PANORAMIC_OBSERVATION_WINDOW",
        2.75,
        1.20,
        0.65,
        2.49,
        0.13,
        MATERIALS["glass"],
        collection
    )

    create_observation_frame(collection)

    # Top and bottom trim.
    for z in (0.02, 1.28):

        add_box(
            "OBSERVATION_MODULE_TRIM",
            (0, 2.50, z),
            (2.82, 0.055, 0.045),
            MATERIALS["gold"],
            collection,
            0.018
        )

    # Instrument indicators.
    for x in (-1.32, 1.32):

        add_sphere(
            "OBSERVATION_NAVIGATION_INDICATOR",
            (x, 2.57, 0.65),
            (0.045, 0.035, 0.045),
            MATERIALS["cyan"],
            collection
        )


# ============================================================
# COMMUNICATIONS AND PROPULSION
# ============================================================

def build_communications():

    collection = COLLECTIONS["COMMUNICATIONS"]

    # Rear-facing communication reflector.
    add_sphere(
        "COMMUNICATIONS_DISH",
        (0, -2.13, 1.32),
        (0.66, 0.16, 0.66),
        MATERIALS["ceramic"],
        collection
    )

    add_sphere(
        "COMMUNICATIONS_DISH_FEED",
        (0, -2.31, 1.32),
        (0.12, 0.09, 0.12),
        MATERIALS["gold"],
        collection
    )

    add_cylinder_between(
        "DISH_SUPPORT_ARM",
        (0, -1.85, 1.32),
        (0, -2.28, 1.32),
        0.055,
        MATERIALS["titanium"],
        collection
    )

    # Upper deployment and navigation antenna booms.
    for side in (-1, 1):

        add_cylinder_between(
            "COMMUNICATIONS_ANTENNA_BOOM",
            (side * 1.32, 0, 1.60),
            (side * 2.45, 0, 2.72),
            0.045,
            MATERIALS["titanium"],
            collection
        )

        add_sphere(
            "COMMUNICATIONS_SENSOR_HEAD",
            (side * 2.45, 0, 2.72),
            (0.18, 0.18, 0.18),
            MATERIALS["gold"],
            collection
        )

    # Small cyan instrument indicators.
    for side in (-1, 1):

        add_sphere(
            "SERVICE_NAVIGATION_LIGHT",
            (side * 1.88, -1.0, -1.92),
            (0.075, 0.075, 0.075),
            MATERIALS["cyan"],
            collection
        )


def build_propulsion():

    collection = COLLECTIONS["PROPULSION"]

    positions = [
        (-0.88, -0.88),
        (0.88, -0.88),
        (-0.88, 0.88),
        (0.88, 0.88),
    ]

    for index, (x, y) in enumerate(positions, start=1):

        add_cone(
            f"MAIN_THRUSTER_NOZZLE_{index}",
            0.34,
            0.19,
            0.72,
            (x, y, -3.12),
            MATERIALS["titanium"],
            collection
        )

        add_cylinder(
            f"THRUSTER_DARK_INTERIOR_{index}",
            0.27,
            0.035,
            (x, y, -3.49),
            MATERIALS["dark"],
            collection,
            bevel=0.005
        )

    # Four small lateral attitude-control ports.
    for side in (-1, 1):

        for z in (-1.7, 0.85):

            add_cylinder(
                "RCS_ATTITUDE_CONTROL_PORT",
                0.14,
                0.17,
                (side * 2.12, 0, z),
                MATERIALS["graphite"],
                collection,
                rotation=(0, math.pi / 2, 0),
                vertices=48
            )


# ============================================================
# RENDER ENVIRONMENT
# ============================================================

def aim_at(obj, target):

    direction = Vector(target) - obj.location

    obj.rotation_euler = direction.to_track_quat(
        "-Z",
        "Y"
    ).to_euler()


def create_area_light(
    name,
    position,
    target,
    energy,
    size,
    color,
    collection
):

    data = bpy.data.lights.new(
        name,
        type="AREA"
    )

    data.energy = energy
    data.shape = "DISK"
    data.size = size
    data.color = color

    obj = bpy.data.objects.new(name, data)

    collection.objects.link(obj)

    obj.location = position
    aim_at(obj, target)

    return obj


def setup_render_environment(scene, rig):

    world = bpy.data.worlds.new(
        "ASTRA_BLOCKOUT_SPACE_WORLD"
    )

    world.use_nodes = True

    background = world.node_tree.nodes.get(
        "Background"
    )

    background.inputs["Color"].default_value = (
        0.008, 0.014, 0.027, 1
    )

    background.inputs["Strength"].default_value = 0.28

    scene.world = world

    create_area_light(
        "ASTRA_KEY_SOFTBOX",
        (8, 11, 14),
        (0, 0, 2),
        1600,
        9,
        (0.80, 0.88, 1.0),
        rig
    )

    create_area_light(
        "ASTRA_FILL_SOFTBOX",
        (-9, 5, 5),
        (0, 0, 2),
        1050,
        8,
        (0.55, 0.70, 1.0),
        rig
    )

    create_area_light(
        "ASTRA_RIM_SOFTBOX",
        (1, -9, 9),
        (0, 0, 2),
        1400,
        7,
        (1.0, 0.73, 0.46),
        rig
    )

    create_area_light(
        "ASTRA_FRONT_FILL",
        (0, 8, 1),
        (0, 0, 1),
        450,
        6,
        (0.40, 0.78, 1.0),
        rig
    )

    camera_data = bpy.data.cameras.new(
        "ASTRA_BLOCKOUT_CAMERA"
    )

    camera_data.type = "ORTHO"

    camera = bpy.data.objects.new(
        "ASTRA_BLOCKOUT_CAMERA",
        camera_data
    )

    rig.objects.link(camera)

    scene.camera = camera

    scene.render.engine = "BLENDER_EEVEE"

    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100

    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"

    scene.view_settings.view_transform = "AgX"
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1

    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 64

    return camera


# ============================================================
# CAMERA FRAMING
# ============================================================

def get_model_bounds():

    mesh_objects = [
        obj for obj in bpy.context.scene.objects
        if obj.type == "MESH"
        and obj.parent == ROOT
    ]

    points = [
        obj.matrix_world @ Vector(corner)
        for obj in mesh_objects
        for corner in obj.bound_box
    ]

    minimum = Vector((
        min(p.x for p in points),
        min(p.y for p in points),
        min(p.z for p in points),
    ))

    maximum = Vector((
        max(p.x for p in points),
        max(p.y for p in points),
        max(p.z for p in points),
    ))

    return minimum, maximum, mesh_objects


def frame_camera(camera, minimum, maximum, direction):

    center = (minimum + maximum) / 2

    size = maximum - minimum

    span = max(size.x, size.y, size.z)

    direction = Vector(direction).normalized()

    camera.location = center + direction * span * 3.5

    orientation = (
        center - camera.location
    ).to_track_quat("-Z", "Y")

    camera.rotation_euler = orientation.to_euler()

    inverse = orientation.inverted()

    corners = [
        Vector((
            minimum.x if x == 0 else maximum.x,
            minimum.y if y == 0 else maximum.y,
            minimum.z if z == 0 else maximum.z,
        ))
        for x in range(2)
        for y in range(2)
        for z in range(2)
    ]

    projected = [
        inverse @ (point - center)
        for point in corners
    ]

    half_width = max(abs(p.x) for p in projected)
    half_height = max(abs(p.y) for p in projected)

    camera.data.ortho_scale = max(
        half_width * 2,
        half_height * 2
    ) * 1.18

    camera.data.clip_start = 0.1
    camera.data.clip_end = span * 15 + 100


# ============================================================
# MAIN BUILD
# ============================================================

def main():

    global ROOT

    print("\n")
    print("=" * 65)
    print(" ASTRA-01 | BLOCKOUT V1 GENERATION")
    print("=" * 65)

    SOURCE_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    RENDER_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # Create an entirely new clean scene.
    bpy.ops.wm.read_factory_settings(
        use_empty=True
    )

    scene = bpy.context.scene

    # Root assembly collection.
    assembly = create_collection(
        "ASTRA-01 | BLOCKOUT V1",
        scene.collection
    )

    # Root empty.
    ROOT = bpy.data.objects.new(
        "ASTRA-01_ROOT",
        None
    )

    ROOT.empty_display_type = "SPHERE"
    ROOT.empty_display_size = 0.55

    assembly.objects.link(ROOT)

    # Separate mechanical systems.
    definitions = [

        ("OPTICAL_SYSTEM", "01 | OPTICAL ASSEMBLY"),

        ("SERVICE_BUS", "02 | SERVICE BUS"),

        ("POWER_SYSTEM", "03 | SOLAR POWER SYSTEM"),

        ("OBSERVATION_MODULE", "04 | OBSERVATION MODULE"),

        ("COMMUNICATIONS", "05 | COMMUNICATIONS"),

        ("PROPULSION", "06 | PROPULSION"),

        ("RENDER_RIG", "90 | RENDER RIG"),

    ]

    for key, name in definitions:
        collection = create_collection(name, assembly)
        COLLECTIONS[key] = collection

    # Materials.
    setup_materials()

    print("\n[01/07] Constructing optical assembly...")

    build_optical_system()

    print("[02/07] Constructing service bus...")

    build_service_bus()

    print("[03/07] Constructing solar power system...")

    build_power_system()

    print("[04/07] Constructing observation module...")

    build_observation_module()

    print("[05/07] Constructing communications...")

    build_communications()

    build_propulsion()

    print("[06/07] Configuring studio lighting and cameras...")

    rig = COLLECTIONS["RENDER_RIG"]

    camera = setup_render_environment(
        scene,
        rig
    )

    minimum, maximum, mesh_objects = get_model_bounds()

    print("\n========== MODEL SUMMARY ==========")

    print(f"Mesh objects: {len(mesh_objects)}")

    print(f"Model bounds: {tuple(maximum - minimum)}")

    print(f"Minimum: {tuple(minimum)}")

    print(f"Maximum: {tuple(maximum)}")

    total_vertices = sum(
        len(obj.data.vertices)
        for obj in mesh_objects
    )

    total_faces = sum(
        len(obj.data.polygons)
        for obj in mesh_objects
    )

    print(f"Total vertices: {total_vertices}")
    print(f"Total faces: {total_faces}")

    print("\n[07/07] Rendering blockout previews...")

    views = {

        "isometric": (1.25, 2.8, 1.65),

        "observation-front": (0.0, 1.0, 0.12),

        "side-profile": (1.0, -0.15, 0.15),

    }

    for name, direction in views.items():

        print(f"\nRendering {name}...")

        frame_camera(
            camera,
            minimum,
            maximum,
            direction
        )

        scene.render.filepath = str(
            RENDER_DIR / f"astra01-{name}.png"
        )

        bpy.ops.render.render(
            write_still=True
        )

        print(f"Saved: {scene.render.filepath}")

    # Leave the saved Blender scene in isometric view.
    frame_camera(
        camera,
        minimum,
        maximum,
        views["isometric"]
    )

    scene.render.filepath = str(
        RENDER_DIR / "astra01-"
    )

    # Save new, independent source project.
    bpy.ops.wm.save_as_mainfile(
        filepath=str(OUTPUT_BLEND)
    )

    print("\n")
    print("=" * 65)
    print(" ASTRA-01 BLOCKOUT V1 COMPLETED")
    print("=" * 65)

    print(f"Blend project: {OUTPUT_BLEND}")

    print(f"Preview renders: {RENDER_DIR}")

    print(f"Mesh objects: {len(mesh_objects)}")

    print("Original Hubble reference files untouched.")

    print("No frontend files modified.")

    print("=" * 65)


if __name__ == "__main__":
    main()