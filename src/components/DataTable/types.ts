export interface SelectOption {
  label: string;
  value: string;
}

export interface ColumnDef {
  key: string;
  label: string;
  width?: number;
  align?: "left" | "right" | "center";
  type?: "string" | "number" | "select";
  options?: SelectOption[];
  editable?: boolean;
  placeholder?: string;
  showTotal?: boolean;   // include this column in the totals row (type='number' required for sum)
  totalLabel?: string;   // static text label in totals row (for non-number columns)
}

export interface RowData {
  id: string;
  [key: string]: unknown;
}

export interface DataTableProps {
  columns: ColumnDef[];
  rows: RowData[];
  height?: number | "fill";
  className?: string;
  initialFocusedCell?: { rowIndex: number; colIndex: number };
  onCellChange?: (rowId: string, colKey: string, value: string) => void;
}
