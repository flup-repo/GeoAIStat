# AI Adoption Geography Globe v1 Plan

## Current Status as of 2026-03-08
- The current implementation is real and reviewable at repo HEAD `b360272` (`update the ui`).
- The app is a `React 19 + Vite + TypeScript` single-route experience with URL-synced query state for `provider`, `metric`, `period`, `mode`, and `selection`.
- The data layer is static-first and locally generated:
  - canonical schemas live in `src/types/data.ts`
  - curated provider snapshot seeds still exist for `openai` and `anthropic`
  - `scripts/build-data.ts` now emits manifest, datasets, story presets, and local geometry artifacts
  - `scripts/refresh-data.ts` evaluates cadence and can rebuild artifacts when a refresh is due
- The current globe experience is implemented as a lazy-loaded Three scene with:
  - atmosphere shell
  - star field
  - graticule lines
  - textured globe base using `public/earth-topology.png`
  - filled country and US state polygons from local build artifacts
  - mesh-based hover and selection
  - mode-aware camera framing and selection transitions
  - HTML tooltip and selection beacon on active geography
  - reduced-motion / no-WebGL fallback panel
- The current UI shell includes:
  - left control rail
  - right detail sheet with sparkline and source links
  - legend
  - bottom timeline scrubber
- Verified locally on 2026-03-08:
  - `npm run test:run`
  - `npm run lint`
  - `npm run build`
- Current gaps confirmed during review:
  - provider adapters still use curated sample values rather than real upstream parsing
  - there is cadence-aware rebuild logic, but no upstream provider fetch yet
  - integration coverage exists for artifact emission and cadence decisions, but there is still no browser E2E suite
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
- Tighten the camera choreography and mobile treatment now that polygon rendering exists.
- Revisit bundle size after the geometry path is stable; the `three-core` chunk is still large enough to trigger a Vite warning.

### Data Pipeline
Done now:
- Canonical schema and manifest types are in place.
- Seed adapters for OpenAI and Anthropic produce normalized curated datasets.
- `build:data` computes normalized values, ranks, checksums, manifest entries, story presets, and render-ready geometry artifacts.
- Static artifacts are emitted into `public/data/`.
- Local geometry is generated from versioned atlas packages instead of runtime network fetches.

Follow next:
- Replace curated values with real upstream ingestion and mapping for the chosen provider releases.
- Add validation for missing, partial, or changed upstream snapshots.
- Consider moving provider source snapshots out of inline TypeScript and into raw checked-in inputs or fetched upstream artifacts.

### Delivery and Operations
Done now:
- Static build path works locally with no backend dependency.
- The app can be built and previewed from generated artifacts.
- `config/data-refresh.json` exists and defines provider cadence.
- `scripts/refresh-data.ts` can skip or rebuild based on cadence or force mode.
- A scheduled and manually triggerable GitHub Actions workflow is present for artifact refreshes.

Follow next:
- Wire the refresh workflow to real upstream fetch/parsing once provider ingestion is implemented.
- Defer Vercel/GitHub deployment automation until live data ingestion is stable enough to avoid churn.

### Testing and Verification
Done now:
- Unit coverage exists for query-state sanitization/serialization.
- Unit coverage exists for data build normalization and ranking.
- Integration-style coverage exists for artifact emission, geometry output, and refresh decision logic.
- Current repo state passes `test`, `lint`, and `build` locally.

Follow next:
- Add E2E coverage for:
  - globe load
  - provider / metric / mode / period URL sync
  - geography selection
  - fallback rendering
  - mobile behavior

## Improvement Notes From This Review
- The biggest product gap is now data provenance rather than rendering. The geometry path is local and deterministic, but provider values are still curated inputs.
- The globe interaction model is now in the right place architecturally: geometry is generated at build time and selection happens on meshes instead of marker proxies.
- The current app architecture is solid enough to keep: query-state contract, static artifact flow, typed schemas, lazy scene loading, and fallback handling are all worth preserving.
- Performance work should be focused, not premature. Do a targeted pass after polygon assets and live data are in place, then reduce the `three-core` bundle and any unnecessary scene work.

## Next Execution Order
1. Replace curated provider values with real upstream ingestion and add validation for incomplete or changed source snapshots.
2. Add browser E2E coverage around globe load, URL sync, geography selection, fallback rendering, and mobile layout.
3. Do a focused performance pass on the `three-core` chunk and scene work now that the geometry path is stable.
4. Revisit deployment automation after live data ingestion is stable.

## Assumptions
- v1 remains public and read-only.
- v1 does not require auth, CMS, or a database.
- Source data remains periodic and small enough to ship as static artifacts.
- Cross-provider comparisons stay relative unless methodologies clearly align.
- Deployment stays static-first unless the refresh workflow or data size proves otherwise.
