# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run storybook       # dev server at localhost:6006
npm run build-storybook # static build into storybook-static/

npm test                # vitest run (single pass)
npm run test:watch      # vitest watch mode

# Run a single test file
npx vitest run src/components/DataTable/__tests__/DataTable.test.tsx

# Type check (no emit)
npx tsc --noEmit
```

## Architecture

### Principles

- **Data-down, events-up.** Components own no state. All mutations go through callbacks (`onCellChange`, `onAddRow`, `onDeleteRow`). The parent controls data.
- **No external component libraries.** Everything is built from scratch.
- **CSS Modules + CSS custom properties.** Styles are scoped via `.module.css` files; theming is done by overriding `--table-*` variables on any ancestor element. Tokens live in `tokens.css` alongside the component.

### Component anatomy

Each component folder contains:

```
ComponentName/
├── ComponentName.tsx           # Component implementation
├── ComponentName.module.css    # Scoped styles
├── ComponentName.stories.tsx   # Storybook stories (no autodocs tag — MDX handles docs)
├── ComponentName.mdx           # Docs page: architecture, props table, Canvas examples
├── tokens.css                  # CSS custom properties (imported by module.css)
├── types.ts                    # Exported TypeScript interfaces
├── components/                 # Sub-components (not exported publicly)
└── __tests__/
    └── ComponentName.test.tsx
```

### DataTable internals

The only complex component currently. Key design decisions worth knowing before touching it:

- **Two-table layout for totals.** The `<tfoot>` lives in a *separate* `<table>` outside the scroll container so the totals footer is always visible and always fills `100%` of the container width. Do not merge them back into one table — it breaks `height="fill"` mode.
- **ARIA grid pattern.** `<table role="grid">` + `aria-activedescendant`. Cells have `id="cell-{rowIndex}-{colIndex}"`. Keyboard state (`focusedCell`, `editingCell`) lives in `DataTable.tsx`; sub-components receive it as props and are otherwise stateless.
- **`height="fill"` mode.** The scroll wrapper gets `flex: 1; min-height: 0`. Do not apply `min-height` or `height` to the `<table>` itself — browsers distribute the extra height to rows and deform cells.
- **Select editor key events.** `ArrowUp`/`ArrowDown` inside `SelectEditor` call `e.stopPropagation()` to prevent bubbling to the table's `onKeyDown` handler.
- **Totals computation.** Runs on every render directly in `DataTable.tsx` (no memo). Strips commas before `parseFloat` to handle formatted numbers like `"1,234.56"`.

### Storybook docs setup

Docs pages use MDX. Required configuration already in place:

- `@storybook/addon-docs` registered in `.storybook/main.ts`
- `remark-gfm` plugin enabled so GFM tables render correctly
- Blocks imported from `@storybook/addon-docs/blocks` (not `@storybook/blocks`, which does not exist in v10)
- MDX uses `<Meta of={StoriesFile} />` — do **not** also add `tags: ['autodocs']` to the stories meta or Storybook will error on duplicate docs entries
