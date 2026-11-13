"""ASTRA-01 V1 geometry audit for Blender 5.2+

Read-only inspection of astra-01-blockout-v1.blend. The source .blend is not
modified or saved. Writes a TXT report and CSV object inventory to:
  design/ASTRA-01/renders/blockout-v1/

Run from the AstroShift-V2 project root:
  blender --background design/ASTRA-01/source/astra-01-blockout-v1.blend --python design/ASTRA-01/scripts/09_audit_astra01_blockout.py
"""

from pathlib import Path
import csv
import bpy
from mathutils import Vector


def fmt_vec(values, digits=4):
    return "(" + ", ".join(f"{v:.{digits}f}" for v in values) + ")"


def world_bounds(obj):
    corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    mins = tuple(min(v[i] for v in corners) for i in range(3))
    maxs = tuple(max(v[i] for v in corners) for i in range(3))
    dims = tuple(maxs[i] - mins[i] for i in range(3))
    return mins, maxs, dims


def safe_material_names(obj):
    names = []
    for slot in obj.material_slots:
        if slot.material:
            names.append(slot.material.name)
    return names


def main():
    script_path = Path(__file__).resolve()
    project_root = script_path.parents[3]
    blend_path = project_root / "design" / "ASTRA-01" / "source" / "astra-01-blockout-v1.blend"
    output_dir = project_root / "design" / "ASTRA-01" / "renders" / "blockout-v1"
    output_dir.mkdir(parents=True, exist_ok=True)

    if not blend_path.exists():
        raise FileNotFoundError(f"Could not find V1 Blender project: {blend_path}")

    print("\n============================================================")
    print(" ASTRA-01 | V1 GEOMETRY AUDIT (READ ONLY)")
    print("============================================================")
    active_blend = Path(bpy.data.filepath).resolve() if bpy.data.filepath else None
    if active_blend != blend_path.resolve():
        raise RuntimeError(
            "The wrong Blender project is open. Expected: "
            f"{blend_path}; currently open: {active_blend}"
        )
    print(f"Auditing already-open project: {active_blend}")
    bpy.context.view_layer.update()

    objects = sorted(list(bpy.data.objects), key=lambda o: (o.type, o.name.lower()))
    mesh_objects = [o for o in objects if o.type == "MESH"]

    txt_path = output_dir / "astra01-v1-geometry-audit.txt"
    csv_path = output_dir / "astra01-v1-object-inventory.csv"

    scene_min = [float("inf")] * 3
    scene_max = [float("-inf")] * 3
    total_vertices = 0
    total_faces = 0
    lines = []
    rows = []

    lines.append("ASTRA-01 BLOCKOUT V1 — GEOMETRY AUDIT")
    lines.append("READ-ONLY: no geometry, materials, or source project data modified.")
    lines.append(f"Source: {blend_path}")
    lines.append("")
    lines.append("SCENE SUMMARY")
    lines.append(f"Total objects: {len(objects)}")
    lines.append(f"Mesh objects: {len(mesh_objects)}")
    lines.append(f"Non-mesh objects: {len(objects) - len(mesh_objects)}")
    lines.append("")

    # Collections and membership provide the semantic grouping used by V2.
    lines.append("COLLECTION INVENTORY")
    for collection in sorted(bpy.data.collections, key=lambda c: c.name.lower()):
        names = sorted(obj.name for obj in collection.objects)
        if names:
            lines.append(f"\n[{collection.name}] — {len(names)} direct objects")
            for name in names:
                lines.append(f"  - {name}")
    lines.append("\nOBJECT INVENTORY (world-space measurements)")

    for obj in objects:
        collection_names = sorted(c.name for c in obj.users_collection)
        loc = tuple(obj.matrix_world.translation)
        rot = tuple(obj.matrix_world.to_euler())
        if obj.type == "MESH":
            mins, maxs, dims = world_bounds(obj)
            verts = len(obj.data.vertices)
            faces = len(obj.data.polygons)
            total_vertices += verts
            total_faces += faces
            for axis in range(3):
                scene_min[axis] = min(scene_min[axis], mins[axis])
                scene_max[axis] = max(scene_max[axis], maxs[axis])
            materials = safe_material_names(obj)
            lines.append(f"\n[{obj.name}]")
            lines.append(f"  collections : {', '.join(collection_names) if collection_names else '(none)'}")
            lines.append(f"  location    : {fmt_vec(loc)}")
            lines.append(f"  rotation XYZ: {fmt_vec(rot)} rad")
            lines.append(f"  dimensions  : {fmt_vec(dims)}")
            lines.append(f"  bounds min  : {fmt_vec(mins)}")
            lines.append(f"  bounds max  : {fmt_vec(maxs)}")
            lines.append(f"  vertices    : {verts}")
            lines.append(f"  faces       : {faces}")
            lines.append(f"  materials   : {', '.join(materials) if materials else '(none)'}")
            rows.append({
                "object_name": obj.name,
                "type": obj.type,
                "collections": " | ".join(collection_names),
                "location_x": loc[0], "location_y": loc[1], "location_z": loc[2],
                "rotation_x_rad": rot[0], "rotation_y_rad": rot[1], "rotation_z_rad": rot[2],
                "dimension_x": dims[0], "dimension_y": dims[1], "dimension_z": dims[2],
                "min_x": mins[0], "min_y": mins[1], "min_z": mins[2],
                "max_x": maxs[0], "max_y": maxs[1], "max_z": maxs[2],
                "vertices": verts,
                "faces": faces,
                "materials": " | ".join(materials),
            })
        else:
            lines.append(f"\n[{obj.name}] ({obj.type})")
            lines.append(f"  collections : {', '.join(collection_names) if collection_names else '(none)'}")
            lines.append(f"  location    : {fmt_vec(loc)}")

    if mesh_objects:
        scene_dims = tuple(scene_max[i] - scene_min[i] for i in range(3))
        lines.extend([
            "\nAGGREGATE MESH SUMMARY",
            f"Total vertices: {total_vertices}",
            f"Total faces: {total_faces}",
            f"World bounds min: {fmt_vec(scene_min)}",
            f"World bounds max: {fmt_vec(scene_max)}",
            f"World dimensions: {fmt_vec(scene_dims)}",
        ])

    lines.extend([
        "\nAUDIT NOTES",
        "- All locations, bounds, and dimensions are in world space.",
        "- Rotation values are XYZ Euler angles in radians.",
        "- Collection membership is listed for every object.",
        "- This audit is descriptive only; it does not infer component function.",
        "- The V1 .blend file was opened for inspection and was not saved.",
    ])

    txt_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    fieldnames = list(rows[0].keys()) if rows else ["object_name", "type"]
    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print("\n========== AUDIT SUMMARY ==========")
    print(f"Objects: {len(objects)}")
    print(f"Mesh objects: {len(mesh_objects)}")
    print(f"Vertices: {total_vertices}")
    print(f"Faces: {total_faces}")
    print(f"TXT report: {txt_path}")
    print(f"CSV inventory: {csv_path}")
    print("Source V1 project not modified.")
    print("===================================\n")


if __name__ == "__main__":
    main()
