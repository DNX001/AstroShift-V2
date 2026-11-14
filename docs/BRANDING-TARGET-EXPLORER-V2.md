# AstroShift — Branding, About & Target Explorer V2

This is a frontend-only update for the private `AstroShift-V2` repository.

## Included

- User-supplied AstroShift project logo, ExploRangers team logo and favicon, optimised into `frontend/public/brand/` assets.
- AstroShift branding in the sidebar and topbar; the full project and team lockups on the About page.
- Browser title, favicon sizes and Apple touch icon updated to AstroShift branding.
- New `/about` route and About page covering NASA Space Apps Challenge 2026, the selected Planet X and SPHEREx theme, AstroShift's intended workflow and the documented team contributions.
- Visible `V2` / `V2.0` labels removed from the main workspace and AstroBot workspace; the product name is AstroShift.
- Mission Control's primary Observatory CTA uses dark text on cyan for stronger contrast.
- Target Explorer upgraded with a coordinate locator plotting the API-returned RA/Dec values, RA/Dec in degrees and sexagesimal formats, copy-to-clipboard, loading/error states and a clear note that the locator is not a photographic sky map.

## Files included

```text
frontend/index.html
frontend/public/brand/*
frontend/src/App.jsx
frontend/src/components/layout/Sidebar.jsx
frontend/src/components/layout/Topbar.jsx
frontend/src/pages/About.jsx
frontend/src/pages/AstroBotWorkspace.jsx
frontend/src/pages/MissionControl.jsx
frontend/src/pages/TargetExplorer.jsx
```

`AppShell.jsx`, backend files, API contracts and all six cinematic scenes are intentionally untouched. In particular, keep the locally validated React 19 `AppShell.jsx` version that avoids synchronous state updates inside an effect.

## Install

Extract this ZIP into the root of the private `AstroShift-V2` repository and overwrite the listed files. Back up existing files first.

## Validate

From the repository root:

```powershell
npm --prefix .\frontend run lint
npm --prefix .\frontend run build
npm --prefix .\frontend run dev
```

Review:

- `/` — Mission Control CTA contrast and branding.
- `/about` — project logo, challenge story and ExploRangers identity.
- `/targets` — live target search, coordinate plot, sexagesimal values and clipboard action.
- `/astrobot` — no visible `V2` product label.

## Integration boundaries

- Target Explorer uses the existing `GET /api/search?query=...` response; no new backend endpoint is assumed.
- The RA/Dec locator is a coordinate visualisation only. It does not imply a catalogue sky image, telescope imagery or additional metadata.
- Team member names and short contribution summaries are based on the project material available during this handoff. Confirm the final roster and role wording with the team before public release.
- The cinematic experience is not modified by this patch.
