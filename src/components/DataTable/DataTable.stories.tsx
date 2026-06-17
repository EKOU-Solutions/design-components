import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./DataTable";
import type { ColumnDef, RowData } from "./types";

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const accountingColumns: ColumnDef[] = [
  { key: "pettyCash", label: "Petty Cash F", width: 120, showTotal: true, totalLabel: "TOT..." },
  { key: "debit", label: "Debit...", width: 110, align: "right", type: "number", showTotal: true },
  { key: "credit", label: "Credi...", width: 110, align: "right", type: "number", showTotal: true },
  { key: "memo", label: "Item Memo", width: 130 },
  { key: "po", label: "PO#", width: 90 },
  { key: "check", label: "Check #", width: 90 },
  { key: "customer", label: "Customer", width: 120 },
  { key: "project", label: "Project/.", width: 110 },
  { key: "account", label: "Account", width: 110 },
  { key: "subAccount", label: "Sub Accc", width: 100 },
  { key: "vendor", label: "Vendor", width: 100 },
];

const accountingRows: RowData[] = [
  {
    id: "row-1",
    pettyCash: "",
    debit: "",
    credit: "50000",
    memo: "2nd paymen...",
    po: "",
    check: "501",
    customer: "MARQUEE S...",
    project: "99 - COR...",
    account: "14001 - ...",
    subAccount: "",
    vendor: "",
  },
  {
    id: "row-2",
    pettyCash: "",
    debit: "50000",
    credit: "",
    memo: "",
    po: "",
    check: "",
    customer: "",
    project: "99 - COR...",
    account: "11001 - ...",
    subAccount: "",
    vendor: "",
  },
];

export const Default: Story = {
  args: {
    columns: accountingColumns,
    rows: accountingRows,
    height: 300,
  },
};

export const Selected: Story = {
  args: {
    columns: accountingColumns,
    rows: accountingRows,
    height: 300,
    initialFocusedCell: { rowIndex: 0, colIndex: 8 },
    // No onCellChange — edit mode is optional; navigation + yellow highlight only
  },
};

const manyColumns: ColumnDef[] = Array.from({ length: 12 }, (_, i) => ({
  key: `col${i}`,
  label: `Column ${i + 1}`,
  width: 120,
  align: i % 3 === 1 ? ("right" as const) : ("left" as const),
  ...(i % 3 === 1 ? { type: "number" as const, showTotal: true } : {}),
}));

const manyRows: RowData[] = Array.from({ length: 5 }, (_, rowIdx) => ({
  id: `row-${rowIdx}`,
  ...Object.fromEntries(
    manyColumns.map((col, colIdx) => [
      col.key,
      colIdx % 3 === 1 ? `${(rowIdx + 1) * 1000}` : `Value ${rowIdx + 1}-${colIdx + 1}`,
    ])
  ),
}));

export const ManyColumns: Story = {
  args: {
    columns: manyColumns,
    rows: manyRows,
  },
};

export const FillParent: Story = {
  render: (args) => (
    <div style={{ height: 400, display: "flex", flexDirection: "column" }}>
      <DataTable {...args} height="fill" />
    </div>
  ),
  args: {
    columns: accountingColumns,
    rows: accountingRows,
  },
};

const editableColumns: ColumnDef[] = [
  { key: "invoice", label: "AR Invoice", width: 140, type: "string", showTotal: true, totalLabel: "TOT..." },
  { key: "debit", label: "Debit", width: 110, align: "right", type: "number", showTotal: true },
  { key: "credit", label: "Credit", width: 110, align: "right", type: "number", showTotal: true },
  {
    key: "memo",
    label: "Item Memo",
    width: 160,
    type: "string",
    placeholder: "Enter item memo",
  },
  {
    key: "code",
    label: "1099 Code",
    width: 160,
    type: "select",
    options: [
      { label: "Rents (Box 1 MISC)", value: "box1" },
      { label: "Royalties (Box 2 MISC)", value: "box2" },
      { label: "Other Income (Box 3 MISC)", value: "box3" },
      { label: "Federal Income Tax Withheld (Box 4 MISC)", value: "box4" },
      { label: "Non-Employee Compensation (Box 1 NEC)", value: "box5" },
    ],
  },
];

const initialEditableRows: RowData[] = [
  { id: "row-1", invoice: "11044-01", debit: "", credit: "45062.70", memo: "11044 JOHN DE...", code: "" },
  { id: "row-2", invoice: "", debit: "", credit: "45062.70", memo: "", code: "box2" },
  { id: "row-3", invoice: "", debit: "0.00", credit: "", memo: "qadsd", code: "" },
];

export const Editable: Story = {
  render: (args) => {
    const [rows, setRows] = useState<RowData[]>(initialEditableRows);
    function handleCellChange(rowId: string, colKey: string, value: string) {
      setRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, [colKey]: value } : r))
      );
    }
    return <DataTable {...args} rows={rows} onCellChange={handleCellChange} />;
  },
  args: {
    columns: editableColumns,
    rows: initialEditableRows,
    height: 350,
  },
};

/**
 * Click the + button in the toolbar to append a new empty row.
 * The parent owns the data — onAddRow is a signal to create and prepend/append a row.
 */
export const WithAddRow: Story = {
  render: (args) => {
    const [rows, setRows] = useState<RowData[]>(initialEditableRows);
    function handleAddRow() {
      const newRow: RowData = {
        id: `row-${Date.now()}`,
        ...Object.fromEntries(editableColumns.map((c) => [c.key, ""])),
      };
      setRows((prev) => [...prev, newRow]);
    }
    function handleCellChange(rowId: string, colKey: string, value: string) {
      setRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, [colKey]: value } : r))
      );
    }
    return (
      <DataTable
        {...args}
        rows={rows}
        onAddRow={handleAddRow}
        onCellChange={handleCellChange}
      />
    );
  },
  args: {
    columns: editableColumns,
    rows: initialEditableRows,
    height: 350,
  },
};

/**
 * Each row has a red trash icon. The parent is responsible for removing the row
 * from its data source when onDeleteRow fires with the row's id.
 */
export const WithDeleteRow: Story = {
  render: (args) => {
    const [rows, setRows] = useState<RowData[]>(initialEditableRows);
    function handleDeleteRow(rowId: string) {
      setRows((prev) => prev.filter((r) => r.id !== rowId));
    }
    function handleCellChange(rowId: string, colKey: string, value: string) {
      setRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, [colKey]: value } : r))
      );
    }
    return (
      <DataTable
        {...args}
        rows={rows}
        deletable
        onDeleteRow={handleDeleteRow}
        onCellChange={handleCellChange}
      />
    );
  },
  args: {
    columns: editableColumns,
    rows: initialEditableRows,
    height: 350,
  },
};

/**
 * Full CRUD: + button to add rows, trash icon to delete rows, inline cell editing.
 * The parent manages all data — DataTable only emits events.
 */
export const WithAddAndDelete: Story = {
  render: (args) => {
    const [rows, setRows] = useState<RowData[]>(initialEditableRows);
    function handleAddRow() {
      setRows((prev) => [
        ...prev,
        { id: `row-${Date.now()}`, ...Object.fromEntries(editableColumns.map((c) => [c.key, ""])) },
      ]);
    }
    function handleDeleteRow(rowId: string) {
      setRows((prev) => prev.filter((r) => r.id !== rowId));
    }
    function handleCellChange(rowId: string, colKey: string, value: string) {
      setRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, [colKey]: value } : r))
      );
    }
    return (
      <DataTable
        {...args}
        rows={rows}
        onAddRow={handleAddRow}
        deletable
        onDeleteRow={handleDeleteRow}
        onCellChange={handleCellChange}
      />
    );
  },
  args: {
    columns: editableColumns,
    rows: initialEditableRows,
    height: 350,
  },
};

/**
 * Rows marked as disabled are shown in a muted gray, are not keyboard-navigable,
 * and cannot enter edit mode. Pass getRowDisabled to control which rows are disabled.
 */
export const WithDisabledRows: Story = {
  args: {
    columns: accountingColumns,
    rows: [
      { id: "row-1", pettyCash: "", debit: "", credit: "50,000.00", memo: "2nd paymen...", po: "", check: "501", customer: "MARQUEE S...", project: "99 - COR...", account: "14001 - ...", subAccount: "", vendor: "" },
      { id: "row-2", pettyCash: "", debit: "50,000.00", credit: "", memo: "", po: "", check: "", customer: "", project: "99 - COR...", account: "11001 - ...", subAccount: "", vendor: "" },
      { id: "row-3", pettyCash: "", debit: "10,000.00", credit: "", memo: "Third entry", po: "", check: "502", customer: "ACME Corp", project: "88 - PROJ...", account: "12001 - ...", subAccount: "", vendor: "" },
    ],
    getRowDisabled: (row: RowData) => row.id === "row-2",
    height: 300,
  },
};
