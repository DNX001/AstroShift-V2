# AstroShift — About, Brand Consistency & Mission Control Polish V1

This patch implements the non-asset-dependent items requested before moving on to Target Explorer.

## Included

- Mission Control primary CTA now uses high-contrast dark text on the cyan button. It reads **Open Observatory** and links to `/observatory`; the secondary **Explore Targets** action links to `/targets`.
- Adds an **ABOUT** navigation group and an `/about` page.
- The About page covers NASA Space Apps Challenge 2026, the selected challenge framing **Planet X and SPHEREx**, the AstroShift project workflow, the five named contributors present in the supplied team notes, and scientific-integrity boundaries.
- Removes visible product/version labels such as `V2.0` and `ASTROBOT V2` from the sidebar, mobile topbar and AstroBot workspace.
- Sets the browser title and description to AstroShift instead of the Vite placeholder title.

## Files replaced

- `frontend/index.html`
- `frontend/src/App.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/components/layout/Topbar.jsx`
- `frontend/src/pages/About.jsx` (new)
- `frontend/src/pages/AstroBotWorkspace.jsx`
- `frontend/src/pages/MissionControl.jsx`

`AppShell.jsx`, `index.css`, API services, and all six cinematic scenes remain untouched.

## Branding assets still required

The provided ZIP archives did not contain the custom AstroShift wordmark, ExploRangers team logo, or custom AstroShift favicon. The current `frontend/public/favicon.svg` is the Vite starter lightning mark, not the team's custom favicon. This patch therefore leaves the favicon file path in place rather than inventing or redrawing the official marks.

Once supplied, place the files as follows (or use their original extensions and adjust paths):

- `frontend/public/branding/astroshift-logo.svg` — AstroShift project logo; use in the sidebar and project-facing areas.
- `frontend/public/branding/explorangers-logo.svg` — ExploRangers team logo; use in the About team section and sidebar footer.
- `frontend/public/favicon.svg` — replace the Vite starter icon with the official AstroShift favicon.

Recommended placements after the assets are received:

- AstroShift logo: sidebar brand lockup and Mission Control brand stamp.
- ExploRangers logo: About page team section and sidebar footer.
- AstroShift favicon: browser tab, bookmarks and installed shortcuts.
- Cosmic experience: keep the project logo for its opening/closing brand moments only; do not place a persistent logo over the six-scene cinematic imagery.

## Accuracy notes

The available planning notes name five contributors: Sneha, Trina, Debjyoti Nath, Saayaantan and Pushpendu. No sixth member's name/role was present in the inspected notes, so this page does not invent one. Add the sixth member only after the exact name and contribution are confirmed.

The About page describes AstroShift as a project prototype and distinguishes potential image changes from confirmed discoveries. It does not claim NASA endorsement, automatic submission to NASA, or completed backend analysis where that integration is not yet available.

## Install

From the AstroShift-V2 repository root, back up the seven listed files, extract this ZIP into the repository root, then run:

```powershell
npm --prefix .\frontend run lint
npm --prefix .\frontend run build
npm --prefix .\frontend run dev
```

Inspect `/`, `/about`, `/astrobot`, and the mobile navigation. Confirm the cinematic `/cosmos-preview` route still works and remains visually unchanged.
