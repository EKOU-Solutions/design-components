import React, { useRef, useEffect } from "react";
import styles from "./Cell.module.css";
import { CellEditor } from "./CellEditor";
import type { ColumnDef } from "../types";

interface CellProps {
  value: unknown;
  align?: "left" | "right" | "center";
  width?: number;
  isFocused: boolean;
  isEditing: boolean;
  isEditingRow: boolean;
  column: ColumnDef;
  rowIndex: number;
  colIndex: number;
  onCellClick: (rowIndex: number, colIndex: number) => void;
  onCellFocus: (rowIndex: number, colIndex: number) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onTabCommit: (value: string) => void;
  onEditChange: (value: string) => void;
}

export function Cell({
  value,
  align,
  width,
  isFocused,
  isEditing,
  isEditingRow,
  column,
  rowIndex,
  colIndex,
  onCellClick,
  onCellFocus,
  onCommit,
  onCancel,
  onTabCommit,
  onEditChange,
}: CellProps) {
  const tdRef = useRef<HTMLTableCellElement>(null);
  const displayValue = value == null ? "" : String(value);
  const initialEditValue = displayValue;

  useEffect(() => {
    if (isFocused && !isEditing && tdRef.current) {
      tdRef.current.focus({ preventScroll: true });
      tdRef.current.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [isFocused, isEditing]);

  const cellStyle: React.CSSProperties = width
    ? { width, minWidth: width, maxWidth: width }
    : {};

  const cellId = `cell-${rowIndex}-${colIndex}`;

  return (
    <td
      ref={tdRef}
      id={cellId}
      className={styles.cell}
      data-align={align}
      data-focused={isFocused && !isEditingRow ? "true" : undefined}
      data-editing={isEditing ? "true" : undefined}
      data-editing-row={isEditingRow ? "true" : undefined}
      title={isEditing ? undefined : displayValue}
      style={cellStyle}
      tabIndex={isFocused ? 0 : -1}
      role="gridcell"
      aria-rowindex={rowIndex + 2}
      aria-colindex={colIndex + 1}
      onFocus={() => onCellFocus(rowIndex, colIndex)}
      onClick={() => onCellClick(rowIndex, colIndex)}
    >
      {isEditing ? (
        <CellEditor
          column={column}
          initialValue={initialEditValue}
          onCommit={onCommit}
          onCancel={onCancel}
          onTabCommit={onTabCommit}
          onEditChange={onEditChange}
        />
      ) : (
        <>
          {displayValue}
          {isFocused && !isEditingRow && (
            <span className={styles.selectedIndicator} aria-hidden="true" />
          )}
        </>
      )}
    </td>
  );
}
