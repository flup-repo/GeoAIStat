# AI Adoption Geography Globe v1 Plan

## Current Status as of 2026-03-08
- The current implementation is real and reviewable at repo HEAD `b360272` (`update the ui`).
- The app is a `React 19 + Vite + TypeScript` single-route experience with URL-synced query state for `provider`, `metric`, `period`, `mode`, and `selection`.
- The data layer is static-first and locally generated:
  - canonical schemas live in `src/types/data.ts`
  - sample provider seeds exist for `openai` and `anthropic`
  - `scripts/build-data.ts` emits `public/data/manifest.json`, dataset artifacts, and story presets
- The current globe experience is implemented as a lazy-loaded Three scene with:
  - atmosphere shell
  - star field
  - graticule lines
  - textured globe base using `public/earth-topology.png`
  - pulsing point markers for each observation
  - HTML tooltip on hover/selection
  - reduced-motion / no-WebGL fallback panel
- The current UI shell includes:
  - left control rail
  - right detail sheet with sparkline and source links
  - legend
  - bottom timeline scrubber
- Country geography has started, but only as a runtime-fetched Natural Earth wireframe overlay inside `GlobeScene.tsx`.
- Verified locally on 2026-03-08:
  - `npm run test:run`
  - `npm run lint`
  - `npm run build`
- Current gaps confirmed during review:
  - runtime dependency on GitHub raw for country geometry
  - no local build-time geography asset pipeline
  - no filled country polygons and no US state geometry rendering
  - selection still depends on point markers rather than geography meshes
  - provider adapters still use seeded sample data rather than live upstream parsing
  - no cadence-aware refresh config or GitHub Actions workflow
  - no integration or E2E coverage
  - build still warns about a large `three-core` production chunk

## Product Direction
- Build a public, read-only editorial globe for AI adoption geography.
- Keep v1 static-first: ship generated JSON artifacts and avoid introducing a database or server runtime.
- Compare providers only within valid methodological boundaries; do not imply raw cross-provider equivalence.
- Support two scopes in v1:
  - global country view
  - US state drill-down where source data exists

## Implementation Snapshot

### Frontend Experience
Done now:
- Full-viewport globe stage with cinematic lighting and atmospheric treatment.
- Lazy-loaded `GlobeScene` to keep the initial app shell smaller.
- URL-synced provider, metric, period, mode, and selection state.
- Story presets that jump to curated query states.
- Detail sheet with selected geography summary, sparkline history, and source/methodology links.
- Fallback 2D panel when WebGL is unavailable.
- Manual chunking in `vite.config.ts` for React and Three-related vendor code.

Follow next:
- Replace the runtime GitHub country wireframe fetch with local, versioned geometry assets generated during the build step.
- Render actual country and US state polygons, not just points and line segments.
- Move selection and hover to geography meshes so users can interact with real shapes.
- Improve camera framing, selection transitions, and mobile treatment once polygon rendering exists.
- Revisit bundle size after the geometry path is stable; the `three-core` chunk is still large enough to trigger a Vite warning.

### Data Pipeline
Done now:
- Canonical schema and manifest types are in place.
- Seed adapters for OpenAI and Anthropic produce normalized sample datasets.
- `build:data` computes normalized values, ranks, checksums, manifest entries, and story presets.
- Static artifacts are emitted into `public/data/`.

Follow next:
- Replace seeded values with real upstream ingestion and mapping for the chosen provider releases.
- Add validation for missing, partial, or changed upstream snapshots.
- Join geography boundaries during the build so the client receives render-ready local assets.
- Add a small refresh config file that tracks cadence, enabled providers, and manual override behavior.

### Delivery and Operations
Done now:
- Static build path works locally with no backend dependency.
- The app can be built and previewed from generated artifacts.

Follow next:
- Add `config/data-refresh.json`.
- Add cadence-aware refresh gating against manifest state.
- Add a scheduled and manually triggerable GitHub Actions refresh workflow.
- Defer Vercel/GitHub deployment automation until data ingestion and geography rendering are stable enough to avoid churn.

### Testing and Verification
Done now:
- Unit coverage exists for query-state sanitization/serialization.
- Unit coverage exists for data build normalization and ranking.
- Current repo state passes `test`, `lint`, and `build` locally.

Follow next:
- Add integration tests for artifact emission and checksum stability.
- Add tests for cadence gating and refresh decisions.
- Add E2E coverage for:
  - globe load
  - provider / metric / mode / period URL sync
  - geography selection
  - fallback rendering
  - mobile behavior

## Improvement Notes From This Review
- The biggest implementation risk is the runtime geometry fetch in `src/components/globe/GlobeScene.tsx`. It creates an external availability dependency for a feature that should be part of the shipped app.
- Geography rendering is partially started, but not in the right form yet for final UX. The next step should be local build-time geometry plus polygon interaction, not more polish on marker-only selection.
- The current app architecture is solid enough to keep: query-state contract, static artifact flow, typed schemas, lazy scene loading, and fallback handling are all worth preserving.
- Performance work should be focused, not premature. Do a targeted pass after polygon assets and live data are in place, then reduce the `three-core` bundle and any unnecessary scene work.

## Next Execution Order
1. Move geography data into the local build pipeline and render real country polygons plus US state geometry.
2. Replace seeded provider values with real upstream ingestion and add validation for incomplete or changed source snapshots.
3. Shift interactions from point markers to geography meshes, then improve camera framing, hover behavior, and mobile UX.
4. Add cadence config and GitHub Actions refresh automation.
5. Expand integration and E2E coverage around the stabilized data and interaction model.
6. Do a focused performance and deployment pass after the above is stable.

## Assumptions
- v1 remains public and read-only.
- v1 does not require auth, CMS, or a database.
- Source data remains periodic and small enough to ship as static artifacts.
- Cross-provider comparisons stay relative unless methodologies clearly align.
- Deployment stays static-first unless the refresh workflow or data size proves otherwise.
