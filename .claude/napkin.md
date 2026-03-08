# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-03-08 | self | Assumed the repo already had a napkin file. | Check for `.claude/napkin.md` at session start and create it immediately if missing. |
| 2026-03-08 | self | Assumed `/Users/flaviu/work/Projects/globe` was a git repo before checking status. | Verify `.git` exists before relying on git commands in minimal exploration workspaces. |
| 2026-03-08 | self | Tried to run `create-vite` in a non-empty repo root and it cancelled. | Scaffold into a temporary directory first when the root already contains planning/docs files, then merge the generated app files into place. |
| 2026-03-08 | self | Tried to land the whole greenfield implementation in one giant patch after installs had already mutated `package.json`. | Patch config and source in smaller batches when generated files or installers may have changed context. |
| 2026-03-08 | self | Started from `PLAN.md` assumptions before re-checking the implemented app and build output. | Treat planning docs as potentially stale; re-verify the repo, latest commit, and verification commands before updating plans. |
| 2026-03-08 | self | Tried to restore generated artifacts with `tsx --eval` using top-level `await` and shell-interpolated template syntax. | Wrap eval scripts in an async IIFE and avoid backticks that the shell can expand before execution. |

## User Preferences
- Write planning artifacts into the repo before implementation when the user asks for it explicitly.
- When formalizing the repo for git, include documentation folders in ignore rules if requested rather than assuming all docs should be tracked.

## Patterns That Work
- Treat this workspace as greenfield unless files beyond `docs/` are added; architecture decisions need to be explicit in the plan.
- Bootstrap from standard tooling when the repo only contains planning docs; it is faster and less error-prone than hand-creating the initial Vite structure.
- Seed the first iteration with generated static artifacts in `public/data/` and a `build:data` script; this keeps the app verifiable before real provider ingestion is wired in.
- Lazy-load the Three scene and split vendor chunks early; otherwise the initial bundle grows too quickly in this stack.
- Run `npm run test:run`, `npm run lint`, and `npm run build` before revising planning docs; they expose the actual state faster than static reading alone.
- This repo's `npm run build` regenerates `public/data/*` with a fresh timestamp; restore those artifacts if the task is UI-only and generated data should stay unchanged.

## Patterns That Don't Work

## Domain Notes
- Product direction for this repo is `AI adoption geography globe`, not a generic all-provider live activity globe.
- The repo is now a git workspace with implementation commits on `master`; planning notes from early bootstrapping are outdated unless re-checked.
- The current globe scene renders point markers plus a runtime-fetched Natural Earth country wireframe from GitHub raw; geography assets are not yet part of the local build pipeline.
