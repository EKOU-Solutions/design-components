export interface ColumnDef {
  key: string;
  label: string;
  width?: number;
  align?: "left" | "right" | "center";
}

export interface RowData {
  id: string;
  [key: string]: unknown;
}

export interface TotalsData {
  [key: string]: unknown;
}

export interface DataTableProps {
  columns: ColumnDef[];
  rows: RowData[];
  totals?: TotalsData;
  selectedCell?: { rowId: string; colKey: string };
  height?: number | "fill";
  className?: string;
}
