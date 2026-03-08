# GeoAIStat

GeoAIStat is a static-first React app for exploring AI adoption geography across countries and US states.

The current build ships as a client-only editorial globe with:

- URL-synced provider, metric, period, mode, and selection state
- local country and US state geometry rendered as selectable meshes
- generated static data artifacts in `public/data/`
- a reduced-motion / no-WebGL fallback panel
- a cadence-aware data refresh script and GitHub Actions workflow

## Stack

- React 19
- Vite
- TypeScript
- Three.js via `@react-three/fiber` and `@react-three/drei`
- Zod for artifact validation

## Getting Started

```bash
npm install
npm run dev
```

The dev server serves the generated artifacts from `public/data/`.

## Commands

```bash
npm run dev
npm run build:data
npm run refresh:data
npm run build
npm run lint
npm run test:run
npm run preview
```

## Data Pipeline

`npm run build:data` runs [scripts/build-data.ts](/Users/flaviu/work/Projects/globe/scripts/build-data.ts), which generates:

- `public/data/manifest.json`
- dataset files under `public/data/world/` and `public/data/us/`
- story presets in `public/data/stories.json`
- local geometry assets in `public/data/geometry/world.json` and `public/data/geometry/us.json`

Geometry is built locally from `world-atlas` and `us-atlas` through [scripts/geography.ts](/Users/flaviu/work/Projects/globe/scripts/geography.ts).

Current provider values are still curated snapshot inputs defined in:

- [scripts/providers/openai.ts](/Users/flaviu/work/Projects/globe/scripts/providers/openai.ts)
- [scripts/providers/anthropic.ts](/Users/flaviu/work/Projects/globe/scripts/providers/anthropic.ts)

They are not live upstream ingestions yet.

## Refresh Workflow

Cadence settings live in [config/data-refresh.json](/Users/flaviu/work/Projects/globe/config/data-refresh.json).

`npm run refresh:data` runs [scripts/refresh-data.ts](/Users/flaviu/work/Projects/globe/scripts/refresh-data.ts), which:

- reads the current manifest
- checks whether provider cadence has elapsed
- rebuilds artifacts only when needed
- supports forced refresh via `--force` or `FORCE_REFRESH=true`

The scheduled/manual GitHub Actions workflow lives at [.github/workflows/data-refresh.yml](/Users/flaviu/work/Projects/globe/.github/workflows/data-refresh.yml).

## Project Structure

```text
src/
  components/
    globe/
    panels/
  lib/
  types/
scripts/
  providers/
public/data/
config/
```

Key files:

- [src/App.tsx](/Users/flaviu/work/Projects/globe/src/App.tsx): app bootstrap, URL state, dataset + geometry loading
- [src/components/globe/GlobeScene.tsx](/Users/flaviu/work/Projects/globe/src/components/globe/GlobeScene.tsx): Three scene, mesh interaction, camera behavior
- [src/lib/data.ts](/Users/flaviu/work/Projects/globe/src/lib/data.ts): manifest, dataset, and geometry loaders
- [src/types/data.ts](/Users/flaviu/work/Projects/globe/src/types/data.ts): canonical runtime schemas and shared types

## Verification

Current local verification path:

```bash
npm run test:run
npm run lint
npm run build
```

## Current Gaps

- provider adapters still use curated values instead of real upstream ingestion
- there is no browser E2E suite yet
- the production build still warns about the large `three-core` chunk

