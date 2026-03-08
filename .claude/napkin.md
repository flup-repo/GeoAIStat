# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-03-08 | self | Assumed the repo already had a napkin file. | Check for `.claude/napkin.md` at session start and create it immediately if missing. |
| 2026-03-08 | self | Assumed `/Users/flaviu/work/Projects/globe` was a git repo before checking status. | Verify `.git` exists before relying on git commands in minimal exploration workspaces. |
| 2026-03-08 | self | Tried to run `create-vite` in a non-empty repo root and it cancelled. | Scaffold into a temporary directory first when the root already contains planning/docs files, then merge the generated app files into place. |
| 2026-03-08 | self | Tried to land the whole greenfield implementation in one giant patch after installs had already mutated `package.json`. | Patch config and source in smaller batches when generated files or installers may have changed context. |

## User Preferences
- Write planning artifacts into the repo before implementation when the user asks for it explicitly.
- When formalizing the repo for git, include documentation folders in ignore rules if requested rather than assuming all docs should be tracked.

## Patterns That Work
- Treat this workspace as greenfield unless files beyond `docs/` are added; architecture decisions need to be explicit in the plan.
- Bootstrap from standard tooling when the repo only contains planning docs; it is faster and less error-prone than hand-creating the initial Vite structure.
- Seed the first iteration with generated static artifacts in `public/data/` and a `build:data` script; this keeps the app verifiable before real provider ingestion is wired in.
- Lazy-load the Three scene and split vendor chunks early; otherwise the initial bundle grows too quickly in this stack.

## Patterns That Don't Work

## Domain Notes
- Product direction for this repo is `AI adoption geography globe`, not a generic all-provider live activity globe.
- As of 2026-03-08 this repo contains only planning/docs files and no `.git` directory yet, so implementation work should not assume git metadata or branch operations are available.
