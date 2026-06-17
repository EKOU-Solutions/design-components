import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./DataTable";
import type { ColumnDef, RowData, TotalsData } from "./types";

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
  { key: "pettyCash", label: "Petty Cash F", width: 120 },
  { key: "debit", label: "Debit...", width: 110, align: "right" },
  { key: "credit", label: "Credi...", width: 110, align: "right" },
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
    credit: "50,000.00",
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
    debit: "50,000.00",
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

const accountingTotals: TotalsData = {
  pettyCash: "",
  debit: "50,000....",
  credit: "50,000....",
  memo: "",
  po: "",
  check: "",
  customer: "",
  project: "",
  account: "",
  subAccount: "",
  vendor: "",
};

export const Default: Story = {
  args: {
    columns: accountingColumns,
    rows: accountingRows,
    totals: accountingTotals,
    height: 300,
  },
};

export const Selected: Story = {
  args: {
    columns: accountingColumns,
    rows: accountingRows,
    totals: accountingTotals,
    selectedCell: { rowId: "row-1", colKey: "account" },
  },
};

const manyColumns: ColumnDef[] = Array.from({ length: 12 }, (_, i) => ({
  key: `col${i}`,
  label: `Column ${i + 1}`,
  width: 120,
  align: i % 3 === 1 ? ("right" as const) : ("left" as const),
}));

const manyRows: RowData[] = Array.from({ length: 5 }, (_, rowIdx) => ({
  id: `row-${rowIdx}`,
  ...Object.fromEntries(
    manyColumns.map((col, colIdx) => [
      col.key,
      colIdx % 3 === 1 ? `${(rowIdx + 1) * 1000}.00` : `Value ${rowIdx + 1}-${colIdx + 1}`,
    ])
  ),
}));

const manyTotals: TotalsData = Object.fromEntries(
  manyColumns.map((col, i) => [col.key, i % 3 === 1 ? "15,000.00" : ""])
);

export const ManyColumns: Story = {
  args: {
    columns: manyColumns,
    rows: manyRows,
    totals: manyTotals,
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
    totals: accountingTotals,
  },
};
