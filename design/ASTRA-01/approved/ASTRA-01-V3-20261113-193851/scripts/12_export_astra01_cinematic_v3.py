"""ASTRA-01 | V3 GLB EXPORTER — BLENDER 5.2 COMPATIBILITY FIX

Exports visible mesh objects from:
    design/ASTRA-01/source/astra-01-cinematic-v3.blend

Creates:
    design/ASTRA-01/exports/astra-01-cinematic-v3.glb
    design/ASTRA-01/exports/astra-01-cinematic-v3-export-report.txt

Important:
- Uses Blender 5.2's documented glTF operator parameters directly.
- Does not introspect RNA properties to decide whether export_format exists.
- Hidden/replaced legacy mesh objects are excluded.
- Cameras and lights are not selected and are explicitly excluded.
- The source V3 .blend is opened but never saved or overwritten.

Target: Blender 5.2.x
"""

from __future__ import annotations

import hashlib
import json
import struct
import sys
import traceback
from pathlib import Path

import bpy
from mathutils import Vector


SCRIPT_PATH = Path(__file__).resolve()
ASTRA_DIR = SCRIPT_PATH.parents[1]
SOURCE_BLEND = ASTRA_DIR / "source" / "astra-01-cinematic-v3.blend"
EXPORT_DIR = ASTRA_DIR / "exports"
OUTPUT_GLB = EXPORT_DIR / "astra-01-cinematic-v3.glb"
REPORT_FILE = EXPORT_DIR / "astra-01-cinematic-v3-export-report.txt"


def log(message: str) -> None:
    print(f"[ASTRA-01 GLB] {message}", flush=True)


def ensure_gltf_exporter():
    """Ensure the Blender glTF exporter operator is registered."""
    if hasattr(bpy.ops.export_scene, "gltf"):
        return

    try:
        bpy.ops.preferences.addon_enable(module="io_scene_gltf2")
    except Exception as exc:
        log(f"Could not enable bundled glTF exporter automatically: {exc}")

    if not hasattr(bpy.ops.export_scene, "gltf"):
        raise RuntimeError(
            "Blender's glTF 2.0 exporter is not available. "
            "Enable the glTF 2.0 exporter in Blender, then rerun this script."
        )


def get_visible_mesh_objects():
    visible = []
    hidden = []

    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or obj.data is None:
            continue

        try:
            hidden_in_viewport = obj.hide_get()
        except Exception:
            hidden_in_viewport = False

        if obj.hide_render or hidden_in_viewport:
            hidden.append(obj.name)
            continue

        visible.append(obj)

    return visible, hidden


def calculate_world_bounds(objects):
    corners = []
    for obj in objects:
        for corner in obj.bound_box:
            corners.append(obj.matrix_world @ Vector(corner))

    if not corners:
        return None

    minimum = tuple(min(point[i] for point in corners) for i in range(3))
    maximum = tuple(max(point[i] for point in corners) for i in range(3))
    dimensions = tuple(maximum[i] - minimum[i] for i in range(3))

    return minimum, maximum, dimensions


def export_selected_meshes(objects):
    """Call Blender 5.2's documented glTF exporter directly.

    The previous exporter script inspected RNA property metadata and
    incorrectly concluded that export_format was unavailable. The official
    Blender 5.2 operator exposes export_format, use_selection and the other
    options supplied below, so no property-introspection gate is needed.
    """
    if bpy.context.object and bpy.context.object.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")

    bpy.ops.object.select_all(action="DESELECT")

    for obj in objects:
        obj.select_set(True)

    bpy.context.view_layer.objects.active = objects[0]

    log(f"Selected {len(objects)} visible mesh objects.")
    log("Calling bpy.ops.export_scene.gltf with export_format='GLB'...")

    result = bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT_GLB),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_texcoords=True,
        export_normals=True,
        export_yup=True,
        export_extras=True,
    )

    if "FINISHED" not in result:
        raise RuntimeError(
            f"Blender glTF exporter did not finish successfully. Result: {result}"
        )


def inspect_glb(path: Path):
    """Validate the GLB container and read its glTF JSON metadata."""
    raw = path.read_bytes()

    if len(raw) < 20:
        raise RuntimeError("GLB is unexpectedly small (less than 20 bytes).")

    magic, version, declared_length = struct.unpack_from("<4sII", raw, 0)

    if magic != b"glTF":
        raise RuntimeError("Invalid GLB magic header.")
    if version != 2:
        raise RuntimeError(f"Expected GLB version 2; found {version}.")
    if declared_length != len(raw):
        raise RuntimeError(
            f"GLB header length {declared_length:,} does not match "
            f"actual size {len(raw):,}."
        )

    json_length, json_chunk_type = struct.unpack_from("<II", raw, 12)
    if json_chunk_type != 0x4E4F534A:
        raise RuntimeError("First GLB chunk is not a JSON chunk.")

    json_start = 20
    json_end = json_start + json_length

    if json_end > len(raw):
        raise RuntimeError("GLB JSON chunk length extends beyond file size.")

    json_bytes = raw[json_start:json_end].rstrip(b" \t\r\n\x00")
    document = json.loads(json_bytes.decode("utf-8"))

    if "asset" not in document or document["asset"].get("version") != "2.0":
        raise RuntimeError("GLB JSON does not declare glTF asset version 2.0.")

    return {
        "bytes": len(raw),
        "version": version,
        "asset_version": document["asset"]["version"],
        "nodes": len(document.get("nodes", [])),
        "meshes": len(document.get("meshes", [])),
        "materials": len(document.get("materials", [])),
        "textures": len(document.get("textures", [])),
        "images": len(document.get("images", [])),
        "scenes": len(document.get("scenes", [])),
        "sha256": hashlib.sha256(raw).hexdigest(),
    }


def write_export_report(objects, hidden_objects, stats, bounds):
    lines = [
        "ASTRA-01 CINEMATIC V3 — GLB EXPORT REPORT",
        "==========================================",
        f"Source Blender project: {SOURCE_BLEND}",
        f"Output GLB: {OUTPUT_GLB}",
        "",
        "EXPORT SUMMARY",
        f"Visible mesh objects selected: {len(objects):,}",
        f"Hidden/replaced mesh objects excluded: {len(hidden_objects):,}",
        f"GLB file size: {stats['bytes']:,} bytes "
        f"({stats['bytes'] / (1024 * 1024):.2f} MiB)",
        f"GLB container version: {stats['version']}",
        f"glTF asset version: {stats['asset_version']}",
        f"glTF nodes: {stats['nodes']:,}",
        f"glTF meshes: {stats['meshes']:,}",
        f"glTF materials: {stats['materials']:,}",
        f"glTF textures: {stats['textures']:,}",
        f"glTF images: {stats['images']:,}",
        f"glTF scenes: {stats['scenes']:,}",
        f"SHA-256: {stats['sha256']}",
        "",
        "WORLD-SPACE BOUNDS",
    ]

    if bounds:
        minimum, maximum, dimensions = bounds
        lines.extend([
            f"Minimum: ({minimum[0]:.5f}, {minimum[1]:.5f}, {minimum[2]:.5f})",
            f"Maximum: ({maximum[0]:.5f}, {maximum[1]:.5f}, {maximum[2]:.5f})",
            f"Dimensions: ({dimensions[0]:.5f}, {dimensions[1]:.5f}, {dimensions[2]:.5f})",
        ])

    lines.extend([
        "",
        "EXCLUDED HIDDEN MESH OBJECTS",
        *[f"- {name}" for name in sorted(hidden_objects)],
        "",
        "VALIDATION",
        "- GLB magic header: PASS",
        "- GLB version 2: PASS",
        "- GLB declared file length: PASS",
        "- GLB JSON chunk: PASS",
        "- glTF asset version 2.0: PASS",
        "- Source Blender project saved/overwritten: NO",
    ])

    REPORT_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    log("=" * 68)
    log("ASTRA-01 | CINEMATIC V3 GLB EXPORT")
    log("=" * 68)

    if not SOURCE_BLEND.exists():
        raise FileNotFoundError(f"V3 Blender project not found: {SOURCE_BLEND}")

    EXPORT_DIR.mkdir(parents=True, exist_ok=True)

    log(f"Opening source project: {SOURCE_BLEND}")
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE_BLEND))

    ensure_gltf_exporter()

    objects, hidden_objects = get_visible_mesh_objects()
    if not objects:
        raise RuntimeError("No visible mesh objects were found for export.")

    vertex_count = sum(len(obj.data.vertices) for obj in objects)
    face_count = sum(len(obj.data.polygons) for obj in objects)
    bounds = calculate_world_bounds(objects)

    log(f"Visible mesh objects: {len(objects):,}")
    log(f"Vertices selected: {vertex_count:,}")
    log(f"Faces selected: {face_count:,}")
    log(f"Hidden/replaced mesh objects excluded: {len(hidden_objects):,}")

    export_selected_meshes(objects)

    if not OUTPUT_GLB.exists():
        raise RuntimeError(
            "The exporter returned FINISHED but did not create the expected GLB."
        )

    stats = inspect_glb(OUTPUT_GLB)
    write_export_report(objects, hidden_objects, stats, bounds)

    log("=" * 68)
    log("ASTRA-01 V3 GLB EXPORT COMPLETED")
    log("=" * 68)
    log(f"GLB: {OUTPUT_GLB}")
    log(f"Report: {REPORT_FILE}")
    log(
        f"File size: {stats['bytes']:,} bytes "
        f"({stats['bytes'] / (1024 * 1024):.2f} MiB)"
    )
    log(f"glTF nodes: {stats['nodes']:,}")
    log(f"glTF meshes: {stats['meshes']:,}")
    log(f"glTF materials: {stats['materials']:,}")
    log("GLB structural validation: PASS")
    log("The source V3 .blend was not saved or overwritten.")
    log("=" * 68)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("\nASTRA-01 GLB EXPORT FAILED", file=sys.stderr)
        print(f"Reason: {exc}", file=sys.stderr)
        traceback.print_exc()
        raise
