import React from "react";
import styles from "./DataRow.module.css";
import { Cell } from "./Cell";
import type { ColumnDef, RowData } from "../types";

interface DataRowProps {
  row: RowData;
  columns: ColumnDef[];
  rowIndex: number;
  isEditingRow: boolean;
  focusedColIndex: number | null;
  editingColIndex: number | null;
  onCellClick: (rowIndex: number, colIndex: number) => void;
  onCellFocus: (rowIndex: number, colIndex: number) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onTabCommit: (value: string) => void;
  onEditChange: (value: string) => void;
}

export function DataRow({
  row,
  columns,
  rowIndex,
  isEditingRow,
  focusedColIndex,
  editingColIndex,
  onCellClick,
  onCellFocus,
  onCommit,
  onCancel,
  onTabCommit,
  onEditChange,
}: DataRowProps) {
  return (
    <tr className={styles.row} data-editing={isEditingRow ? "true" : undefined}>
      {columns.map((col, colIndex) => (
        <Cell
          key={col.key}
          value={row[col.key]}
          align={col.align}
          width={col.width}
          isFocused={focusedColIndex === colIndex}
          isEditing={editingColIndex === colIndex && isEditingRow}
          isEditingRow={isEditingRow}
          column={col}
          rowIndex={rowIndex}
          colIndex={colIndex}
          onCellClick={onCellClick}
          onCellFocus={onCellFocus}
          onCommit={onCommit}
          onCancel={onCancel}
          onTabCommit={onTabCommit}
          onEditChange={onEditChange}
        />
      ))}
    </tr>
  );
}
