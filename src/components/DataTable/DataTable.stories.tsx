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
