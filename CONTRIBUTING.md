# Contributing to DOMus

Thanks for considering a contribution. DOMus is intentionally small — the whole app is ~3 000 lines of TypeScript — so a single, focused PR is the easiest to review and merge.

## Setup

```bash
git clone <fork-url>
cd domus
npm install
npm run dev   # http://localhost:5173/DOMus/
```

## Workflow

1. **Open an issue first** for anything beyond a typo. Ideas, especially around new furniture kinds or style guides, benefit from a short design discussion before code.
2. **Fork & branch** from `main`:
   ```bash
   git checkout -b feat/short-slug
   ```
3. **Make your change.** Keep it focused — one feature or fix per PR.
4. **Run the test suite** before pushing:
   ```bash
   npm test
   ```
   Vitest covers every store mutation path (footprint clamping, undo/redo, scale ranges, etc.).
5. **Typecheck**: `npm run lint` (this is just `tsc -b --noEmit`).
6. **Open the PR** against `main`. Reference the issue it closes.

CI will run automatically on every push and PR. The merge is gated on CI passing.

## Code style

- TypeScript strict. Don't disable `strict` flags in `tsconfig.json` to make a problem go away.
- Match the file you're editing — if you change `src/scene/`, follow the pattern already there.
- Prefer named exports.
- Keep components small; split when a file grows past ~150 lines.

## Adding a new furniture kind

1. `src/store/catalog.ts` — append a `FurnitureDefinition` entry (footprint, scale range, default colors).
2. `src/scene/furniture/<Kind>.tsx` — parametric component built from `<mesh>`s. Local origin at the floor center.
3. `src/scene/FurnitureMesh.tsx` — add a `case '<kind>':` in the dispatcher.

The WebMCP `add_furniture` tool's `kind` enum picks the new kind up automatically because it derives from `Object.keys(CATALOG)`-style metadata.

## Adding a new design style

1. `src/mcp/skills/guides/<Style>Guide.ts` — write a markdown guide covering palette, rules, recommended furniture composition, and clearance hints.
2. `src/mcp/skills/palettes.ts` — add a 5-color `Palette` entry.
3. `src/mcp/skills/types.ts` — add the style id to `STYLE_IDS`.
4. `src/mcp/skills/index.ts` — register the guide in `GUIDES`, a tagline in `TAGLINES`, and a `furnitureCombo` switch case.

## Forking

If you fork for a different deployment URL (custom domain, user pages, etc.), update `base` in `vite.config.ts` to match the new path. Keep `package.json` `license` at `MIT` unless you intend a relicense.

## Reporting bugs

Open an issue. Please include:
- The browser + version you tested.
- Whether you exercised the UI, the WebMCP tools, or both.
- Reproduction steps; a screenshot or short screen recording is welcome.

## Security

WebMCP executes arbitrary handler code in response to tool calls. DOMus trusts the calling agent — do not add network calls or credential reads to handler bodies without an explicit threat model.
