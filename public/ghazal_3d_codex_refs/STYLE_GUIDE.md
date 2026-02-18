# Ghazal Tech – Codex Reference Pack (2D layout + 3D placement notes)

This folder is meant to be placed in your Next.js `public/` so Codex can reference it by path.

## What’s inside
- `assets/home-light.png` and `assets/home-dark.png`
  - Screenshot references of the current homepage (light & dark).
- `mocks/index-light.html` and `mocks/index-dark.html`
  - Minimal HTML mocks that preserve the **layout grid** and **overlay regions** where the Three.js canvases should live.
- `mocks/styles.css`
  - CSS variables for light/dark tokens matching your current feel.
- `services.json`
  - Service items used in the 3D stacked panel highlight logic.

## 3D integration boundaries (important)
- Keep **all text and buttons as HTML** (SEO).
- The 3D Canvas should be an absolutely-positioned layer behind the hero content:
  - `.hero-3d-layer` (full bleed)
- Services 3D stacked panel area:
  - `.services-3d-panel` (fixed sized container) where the WebGL panel will render.
  - `.services-copy` for RTL text + cards.

## Visual targets (from the building-company reel)
Match:
- dark cinematic background, soft fog, subtle bloom-ish glow
- glass cards with neon cyan/teal edges
- gentle parallax + slow float