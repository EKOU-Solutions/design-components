# Design Components

Component library for the EKOU design system. Components are built from scratch in React + TypeScript, documented in Storybook, and tested with Vitest.

---

## Stack

| Tool | Version | Role |
|------|---------|------|
| React | 19 | UI runtime |
| TypeScript | 6 | Type safety |
| Vite | 8 | Dev server & bundler |
| Storybook | 10 | Component explorer & docs |
| Vitest | 4 | Unit tests |
| CSS Modules | — | Scoped styles |

---

## Getting started

```bash
npm install

# Component explorer (localhost:6006)
npm run storybook

# Run all tests
npm test

# Watch mode
npm run test:watch

# Build static Storybook
npm run build-storybook
```

---

## Project structure

```
src/
└── components/
    ├── Button.tsx                  # Example button
    └── DataTable/
        ├── DataTable.tsx           # Main component
        ├── DataTable.module.css    # Root styles
        ├── DataTable.stories.tsx   # Storybook stories
        ├── DataTable.mdx           # Docs page (architecture, props, examples)
        ├── tokens.css              # CSS custom properties
        ├── types.ts                # TypeScript interfaces
        └── components/
            ├── Cell.tsx
            ├── CellEditor.tsx      # Text, number, and select editors
            ├── ColumnHeader.tsx    # Sortable header with dropdown
            ├── DataRow.tsx
            ├── Toolbar.tsx
            └── TotalsRow.tsx
```

---

## Components

### DataTable

An Excel-like data grid for accounting and tabular workflows.

**Features:**
- Keyboard navigation following the ARIA grid pattern (arrow keys, Home/End, Ctrl+Home/End)
- Inline cell editing — text, number, and custom select editors
- Auto-computed totals footer (always visible, full container width)
- Add row via toolbar, delete rows with per-row trash icon
- Disabled rows (read-only, visually muted, skipped during keyboard navigation)
- `height` prop: fixed `px` or `"fill"` to stretch to the parent container
- Fully themeable via CSS custom properties

**Quick example:**

```tsx
import { DataTable } from './components/DataTable/DataTable';
import type { ColumnDef, RowData } from './components/DataTable/types';

const columns: ColumnDef[] = [
  { key: 'description', label: 'Description', width: 200, type: 'string' },
  { key: 'amount',      label: 'Amount',      width: 120, type: 'number', align: 'right', showTotal: true },
  {
    key: 'status', label: 'Status', width: 140, type: 'select',
    options: [
      { label: 'Pending',  value: 'pending' },
      { label: 'Approved', value: 'approved' },
    ],
  },
];

const rows: RowData[] = [
  { id: '1', description: 'Office supplies', amount: '1234.50', status: 'pending' },
  { id: '2', description: 'Travel expense',  amount: '560.00',  status: 'approved' },
];

function App() {
  const [data, setData] = useState(rows);

  return (
    <DataTable
      columns={columns}
      rows={data}
      height={400}
      onCellChange={(rowId, colKey, value) =>
        setData(prev => prev.map(r => r.id === rowId ? { ...r, [colKey]: value } : r))
      }
      onAddRow={() =>
        setData(prev => [...prev, { id: Date.now().toString(), description: '', amount: '', status: '' }])
      }
      deletable
      onDeleteRow={(rowId) => setData(prev => prev.filter(r => r.id !== rowId))}
    />
  );
}
```

Full prop reference and interactive examples are in the **Docs** tab inside Storybook.

---

## Adding a new component

1. Create `src/components/MyComponent/MyComponent.tsx`
2. Add `MyComponent.stories.tsx` — at minimum a `Default` story
3. Add `MyComponent.mdx` for the docs page (copy the DataTable one as a template)
4. Add `__tests__/MyComponent.test.tsx` with core unit tests

### Theming

All design tokens are CSS custom properties. Override them on any ancestor element — no need to edit source files:

```css
.my-section {
  --table-bg:           #1e1e1e;
  --table-border:       #444;
  --table-header-bg:    #2d2d2d;
  --table-header-color: #f0f0f0;
  --table-font-size:    12px;
}
```

All available tokens are declared in `src/components/DataTable/tokens.css`.

---

## Testing

Tests live in `__tests__/` next to the component they cover. The suite runs against jsdom via Vitest and uses `@testing-library/react` + `@testing-library/user-event` for interaction testing.

```bash
npm test              # single run
npm run test:watch    # re-runs on file change
```

---

## Contributing

- Components are built with composition over inheritance — no base classes
- Data-down, events-up — components own no state, they emit callbacks
- No external component library dependencies — everything is built from scratch
- CSS Modules for scoped styles, CSS custom properties for theming
