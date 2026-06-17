import React, { useEffect, useRef } from "react";
import styles from "./DataRow.module.css";
import { Cell } from "./Cell";
import type { ColumnDef, RowData } from "../types";

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M3 3.5l.7 8a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  deletable?: boolean;
  onDeleteRow?: (rowId: string) => void;
  isDeleteFocused?: boolean;
  disabled?: boolean;
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
  deletable,
  onDeleteRow,
  isDeleteFocused,
  disabled,
}: DataRowProps) {
  const deleteTdRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (isDeleteFocused && deleteTdRef.current) {
      deleteTdRef.current.focus({ preventScroll: true });
      deleteTdRef.current.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [isDeleteFocused]);

  return (
    <tr
      className={styles.row}
      data-editing={isEditingRow ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled ? "true" : undefined}
    >
      {columns.map((col, colIndex) => (
        <Cell
          key={col.key}
          value={row[col.key]}
          align={col.align}
          width={col.width}
          isFocused={!disabled && focusedColIndex === colIndex}
          isEditing={!disabled && editingColIndex === colIndex && isEditingRow}
          isEditingRow={!disabled && isEditingRow}
          isDisabled={disabled}
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
      {deletable && (
        <td
          ref={deleteTdRef}
          id={`cell-${rowIndex}-${columns.length}`}
          className={styles.deleteCell}
          tabIndex={isDeleteFocused ? 0 : -1}
          aria-colindex={columns.length + 1}
          aria-rowindex={rowIndex + 2}
          data-focused={isDeleteFocused ? "true" : undefined}
          onFocus={() => onCellFocus(rowIndex, columns.length)}
        >
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onDeleteRow?.(row.id)}
            tabIndex={-1}
            aria-label={`Delete row ${rowIndex + 1}`}
            disabled={disabled}
          >
            <TrashIcon />
          </button>
        </td>
      )}
    </tr>
  );
}
