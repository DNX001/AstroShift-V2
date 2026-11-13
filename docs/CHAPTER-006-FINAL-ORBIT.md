# AstroShift — Chapter 006: The Final Orbit (Close Opening Revision)

This revision keeps Chapter 006 deliberately simple: one real 3D orbital environment, the approved ASTRA-01 V3 model, an independent camera move, and a quiet fade to the final title.

## Camera choreography

1. The first Chapter 006 camera position and look target exactly match the existing Chapter 005 endpoint. There is no camera-position snap at the chapter boundary.
2. During the first 7.5% of Chapter 006, the camera glides a short distance closer to ASTRA-01's optical instrument end. This creates the tight opening close-up while preserving the Chapter 005 handoff.
3. From 7.5% to 82%, the camera physically dollies backward along its own world-space path. The view opens from the optical assembly to the spacecraft body, solar arrays and Earth.
4. At 82%, the camera reaches the wide composition and holds while ASTRA-01 continues its independent orbital movement. The environment then fades to black while the final AstroShift title remains visible.

This is a physical camera translation with changing perspective and parallax, not a focal-length-only zoom. The short opening glide is intentional: it preserves the exact Chapter 005 handoff while establishing the tighter close-up almost immediately.

## What is removed from Chapter 006

- All camera-facing image plates, including the control-room ending.
- The deep-space nebula backdrop image plane.
- The glass/entry flash.
- Orbital dust and shooting-star overlays.
- The previous multi-pass camera fly-around.
- The shared spacecraft-and-camera orbital translation that made their relative motion disappear.

## What is retained

- The approved `astra-01-cinematic-v3.glb`.
- The four Earth texture maps in `frontend/public/environments/earth/`.
- The mapped Earth sphere, day/night map, independent cloud shell and atmosphere.
- The 3D point starfield.
- The Chapter 005 -> Chapter 006 handoff position and look target.
- Chapters 001–005 content, timing, camera paths and controllers. No files for Chapters 001–005 need to be replaced; the existing Chapter 005 ending is used as the exact Chapter 006 opening handoff.

## Install

Extract this ZIP into the repository root and overwrite the five listed files. Back up the exact files first:

```powershell
$backup = Join-Path "$HOME\Downloads\AstroShift-Chapter006-FinalOrbit-Backup" (Get-Date -Format "yyyyMMdd-HHmmss")
$files = @(
  ".\frontend\src\experience\scenes\CosmicScene.jsx",
  ".\frontend\src\experience\scenes\ObservatoryScene.jsx",
  ".\frontend\src\experience\scenes\chapterSixOrbit.js",
  ".\frontend\src\experience\effects\PlanetaryHorizon.jsx",
  ".\frontend\src\pages\CosmicPreview.jsx"
)
foreach ($file in $files) {
  if (-not (Test-Path $file)) { throw "Missing expected file: $file" }
  $relative = $file.Substring(2)
  $destination = Join-Path $backup $relative
  New-Item -ItemType Directory -Force (Split-Path $destination) | Out-Null
  Copy-Item -LiteralPath $file -Destination $destination
}
Write-Host "Backups created at: $backup" -ForegroundColor Green
```

Extract `AstroShift-Chapter006-Final-Orbit-Close-Opening.zip` into the repository root.

## Validate

```powershell
npm --prefix .\frontend run lint
npm --prefix .\frontend run build
npm --prefix .\frontend run dev
```

Open `http://localhost:5173/cosmos-preview` and inspect the Chapter 005 -> 006 transition.

## Visual acceptance checks

- Chapter 005 ends exactly where Chapter 006 begins; no camera-position or look-target jump.
- The opening of Chapter 006 quickly settles into a tight view of ASTRA-01's optical instrument end.
- The camera then moves backward independently, revealing the spacecraft body and solar arrays before the wide Earth composition.
- ASTRA-01 moves relative to Earth; the camera does not inherit the spacecraft's orbital offset.
- Earth remains a fixed world-space body, with its own surface, cloud and atmosphere animation.
- No control-room plate, nebula image plate, entry flash, shooting stars or orbital dust appears.
- The wide composition is reached at 82% and held before the final fade.
- The final AstroShift title and return link remain visible above the fade.

## Composition values

World-space references used by the supplied scene: Earth centre `[0, -1740, -5850]`, radius `1780`; ASTRA-01 base position `[0, 0, -3700]`, scale `18`. The close-up and wide framing coordinates are a first camera composition pass and must be visually reviewed in the browser before calling the shot final.

This revision intentionally does not use the separate optical-core cutaway builder. It is not needed for the simpler ending.
