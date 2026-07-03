# DOMus

A 3D bedroom configurator that you can drive two ways: with the **UI sidebar**, or by letting an **LLM agent call WebMCP tools** directly. Same store, two callers.

![Screenshot placeholder](docs/screenshot.png)

## Features

- **Parametric 3D scene** — walls, floor, ceiling and furniture composed from `<mesh>` primitives. Fully resizable and recolorable at runtime.
- **UI sidebar** with tabs for room dimensions, the furniture catalog, per-item editing (position, rotation, scale, colors), and undo/redo.
- **WebMCP server** — exposes the room as an MCP server via `navigator.modelContext`, so any MCP-aware client can drive the same scene.
- **Two tiers of tools**:
  - **Advisor skills** (read-only, text-returning) — 5 curated bedroom design guides (Scandinavian, Japandi, Boho, Industrial, Minimalist), a style picker, palette suggestions, layout hints, and short design-principle explanations.
  - **Action tools** (mutating) — `add_furniture`, `move_furniture`, `rotate_furniture`, `set_furniture_color`, `set_furniture_scale`, `set_room_dimensions`, `set_room_colors`, `remove_furniture`, undo/redo, `reset_room`.
- **Undo/redo** on every mutation (Zundo temporal middleware).
- **Persistence** to `localStorage` (Zustand `persist` middleware) — your room survives a refresh.

## Tech stack

| Layer | Library |
|---|---|
| Build | [Vite](https://vitejs.dev) |
| UI | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| 3D | [three.js](https://threejs.org) + [React Three Fiber](https://r3f.docs.pmnd.rs) + [drei](https://drei.docs.pmnd.rs) |
| State | [Zustand](https://zustand.docs.pmnd.rs) + [zundo](https://github.com/charkour/zundo) (undo) + `immer` |
| WebMCP | [@mcp-b/react-webmcp](https://github.com/webmcp-org/npm-packages) + [@mcp-b/webmcp-polyfill](https://github.com/webmcp-org/npm-packages) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |

## Live demo

Deployed automatically to GitHub Pages on every push to `main`. See the `Actions` tab for the latest URL (the `github-pages` environment shows the deployed address).

## Install & run

```bash
npm install
npm run dev          # http://localhost:5173/DOMus/   (Vite base is /DOMus/)
```

### Other commands

| Command | What it does |
|---|---|
| `npm run build` | Typecheck + production bundle into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | `tsc -b --noEmit` (typecheck only) |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |

## How WebMCP works here

DOMus registers **19 tools** (6 advisor skills + 13 action tools) on `navigator.modelContext`. The MCP-B polyfill handles browsers that don't ship the API natively.

```ts
// Inside React
useWebMCP({
  name: 'add_furniture',
  description: 'Add a furniture item at exact room-local coordinates (meters).',
  inputSchema: { kind: z.enum([...]), position: Vec3, ... },
  handler: async ({ kind, position }) => {
    const id = useRoomStore.getState().addFurniture(kind, { position });
    return { id, message: `Added ${kind}` };
  },
});
```

The agent and the UI share the same store:

```
      ┌──── UI components ─────┐
      │  RoomPanel · ItemsPanel│
      └─────────┬───────────────┘
                ▼
      ┌───── useRoomStore ─────┐
      └─────────┬───────────────┘
                ▲
      ┌────── WebMCP handlers ─┐
      │  add_furniture, …      │
      └────────────────────────┘
```

The HTML `<script type="agent-context">` block (in `index.html`) acts as a SKILL.md for MCP-aware agents — it lists the toolset and a recommended workflow.

### End-to-end LLM scenario

> "Design me a cozy minimalist bedroom."

The agent typically:
1. `list_room_styles` → picks "Scandinavian".
2. `get_style_guide({ style: "scandinavian" })` → learns palette + proportions.
3. `furniture_combo_for_style({ style: "scandinavian" })` → gets a concrete recommendation.
4. `set_room_dimensions({4, 4, 2.7})`, then `set_room_colors(...)`.
5. `add_furniture({ kind: "bed", position: { x: 2, y: 0, z: 0.4 } })` — exact coords.
6. `set_furniture_color({ id, slot: "primary", hex: "#2E3440" })` — colors per the guide.
7. `undo` if anything looks off.

## Project structure

```
src/
├── main.tsx               # bootstraps React + initializes the WebMCP polyfill
├── App.tsx                # registers all WebMCP tools + lays out Sidebar + Scene
├── store/                 # Zustand store, catalog, types
├── scene/                 # React Three Fiber components (room + furniture)
├── ui/                    # Sidebar and panels
└── mcp/
    ├── useSkillTools.ts   # 6 advisor (text-returning) skill registrations
    ├── useActionTools.ts  # 13 mutating action registrations
    └── skills/
        ├── palettes.ts    # one palette per style
        └── guides/        # one markdown guide per style
tests/                     # Vitest unit tests (store actions + footprint clamping)
scripts/smoke-test.ts      # Integration walk of every store mutation path
.github/workflows/         # CI + Pages deploy workflows
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the short version. The two most common contributions are:

### Add a new furniture kind

1. Add a `FurnitureDefinition` to `src/store/catalog.ts` (id, label, footprint, scale range, default colors).
2. Create a parametric component in `src/scene/furniture/<Kind>.tsx`.
3. Add a switch case in `src/scene/FurnitureMesh.tsx`.
4. The Zod enum in `src/mcp/useActionTools.ts` (`add_furniture` inputSchema) picks the new kind up automatically through `src/store/catalog.ts`.

### Add a new design style

1. Write a style guide in `src/mcp/skills/guides/<Style>Guide.ts` (export a single markdown string).
2. Add a `Palette` to `src/mcp/skills/palettes.ts`.
3. Register the style ID in `src/mcp/skills/types.ts` (`STYLE_IDS`).
4. Add `GUIDES` / `TAGLINES` entries and the `furnitureCombo` case in `src/mcp/skills/index.ts`.

## License

[MIT](LICENSE) — Copyright (c) 2026 DOMus contributors.

## Credits

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) and [drei](https://github.com/pmndrs/drei) for declarative Three.js in React.
- [Zustand](https://github.com/pmndrs/zustand) for the store, [zundo](https://github.com/charkour/zundo) for time-travel.
- [MCP-B](https://github.com/webmcp-org/npm-packages) for bringing the Web Model Context API to every browser.
