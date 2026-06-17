import React, { useState, useRef } from "react";
import styles from "./DataTable.module.css";
import { Toolbar } from "./components/Toolbar";
import { ColumnHeader } from "./components/ColumnHeader";
import { DataRow } from "./components/DataRow";
import { TotalsRow } from "./components/TotalsRow";
import type { DataTableProps } from "./types";

interface FocusedCell {
  rowIndex: number;
  colIndex: number;
}

export function DataTable({
  columns,
  rows,
  height,
  className,
  initialFocusedCell,
  onCellChange,
}: DataTableProps) {
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(
    initialFocusedCell ?? null
  );
  const [editingCell, setEditingCell] = useState<FocusedCell | null>(null);
  // Ref so click-away commit can read the latest value without stale closure
  const editValueRef = useRef<string>("");

  const isFill = height === "fill";

  const rootClass = [styles.root, isFill ? styles.rootFill : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  const scrollClass = [styles.scrollWrapper, isFill ? styles.scrollWrapperFill : ""]
    .filter(Boolean)
    .join(" ");

  const scrollStyle: React.CSSProperties =
    typeof height === "number" ? { maxHeight: height } : {};

  // --- Edit helpers ---

  function enterEditMode(rowIndex: number, colIndex: number) {
    const col = columns[colIndex];
    if (col.editable === false) return;
    const row = rows[rowIndex];
    const currentValue = row[col.key] != null ? String(row[col.key]) : "";
    editValueRef.current = currentValue;
    setEditingCell({ rowIndex, colIndex });
  }

  function commitEdit(value: string) {
    if (!editingCell) return;
    const col = columns[editingCell.colIndex];
    const row = rows[editingCell.rowIndex];
    onCellChange?.(row.id, col.key, value);
    editValueRef.current = "";
    setEditingCell(null);
  }

  function cancelEdit() {
    editValueRef.current = "";
    setEditingCell(null);
  }

  function handleCommit(value: string) {
    commitEdit(value);
  }

  function handleCancel() {
    cancelEdit();
  }

  function handleTabCommit(value: string) {
    if (!editingCell) return;
    commitEdit(value);
    const { rowIndex, colIndex } = editingCell;
    const nextCol = Math.min(colIndex + 1, columns.length - 1);
    setFocusedCell({ rowIndex, colIndex: nextCol });
    enterEditMode(rowIndex, nextCol);
  }

  function handleEditChange(value: string) {
    editValueRef.current = value;
  }

  // --- Cell interaction ---

  function handleCellClick(rowIndex: number, colIndex: number) {
    const isAlreadyFocused =
      focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex;

    if (editingCell) {
      const isSameCell =
        editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex;
      if (!isSameCell) {
        commitEdit(editValueRef.current);
        setFocusedCell({ rowIndex, colIndex });
      }
      return;
    }

    if (isAlreadyFocused) {
      enterEditMode(rowIndex, colIndex);
    } else {
      setFocusedCell({ rowIndex, colIndex });
    }
  }

  function handleCellFocus(rowIndex: number, colIndex: number) {
    // Browser focus via Tab key — sync state without entering edit mode
    if (!focusedCell || focusedCell.rowIndex !== rowIndex || focusedCell.colIndex !== colIndex) {
      setFocusedCell({ rowIndex, colIndex });
    }
  }

  // --- Keyboard navigation on <table> ---

  function handleTableFocus(e: React.FocusEvent<HTMLTableElement>) {
    if (e.target === e.currentTarget && focusedCell === null) {
      setFocusedCell({ rowIndex: 0, colIndex: 0 });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTableElement>) {
    // When editing, CellEditor handles its own keys
    if (editingCell !== null) return;
    if (!focusedCell) return;

    const { rowIndex, colIndex } = focusedCell;
    const maxRow = rows.length - 1;
    const maxCol = columns.length - 1;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        setFocusedCell({ rowIndex, colIndex: Math.min(colIndex + 1, maxCol) });
        break;
      case "ArrowLeft":
        e.preventDefault();
        setFocusedCell({ rowIndex, colIndex: Math.max(colIndex - 1, 0) });
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedCell({ rowIndex: Math.min(rowIndex + 1, maxRow), colIndex });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedCell({ rowIndex: Math.max(rowIndex - 1, 0), colIndex });
        break;
      case "Home":
        e.preventDefault();
        if (e.ctrlKey) {
          setFocusedCell({ rowIndex: 0, colIndex: 0 });
        } else {
          setFocusedCell({ rowIndex, colIndex: 0 });
        }
        break;
      case "End":
        e.preventDefault();
        if (e.ctrlKey) {
          setFocusedCell({ rowIndex: maxRow, colIndex: maxCol });
        } else {
          setFocusedCell({ rowIndex, colIndex: maxCol });
        }
        break;
      case "Enter":
      case "F2":
        e.preventDefault();
        enterEditMode(rowIndex, colIndex);
        break;
      default:
        break;
    }
  }

  const activeCellId = focusedCell
    ? `cell-${focusedCell.rowIndex}-${focusedCell.colIndex}`
    : undefined;

  // Compute totals from column config + current rows (live, updates on every render)
  const hasTotals = columns.some((c) => c.showTotal);
  const computedTotals: Record<string, string> = {};
  if (hasTotals) {
    for (const col of columns) {
      if (!col.showTotal) continue;
      if (col.totalLabel != null) {
        computedTotals[col.key] = col.totalLabel;
      } else if (col.type === "number") {
        const sum = rows.reduce((acc, row) => {
          const raw = String(row[col.key] ?? "").replace(/,/g, "");
          const val = parseFloat(raw);
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
        computedTotals[col.key] = sum.toFixed(2);
      } else {
        computedTotals[col.key] = "";
      }
    }
  }

  return (
    <div className={rootClass} data-fill={isFill ? "true" : undefined}>
      <Toolbar />

      <div className={scrollClass} style={scrollStyle} data-scroll-wrapper="true">
        <table
          className={styles.table}
          role="grid"
          aria-label="Data table"
          aria-rowcount={rows.length + 1}
          aria-colcount={columns.length}
          aria-activedescendant={activeCellId}
          tabIndex={focusedCell === null ? 0 : -1}
          onFocus={handleTableFocus}
          onKeyDown={handleKeyDown}
        >
          <thead>
            <tr role="row" aria-rowindex={1}>
              {columns.map((col) => (
                <ColumnHeader key={col.key} column={col} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const isEditingRow = editingCell?.rowIndex === rowIndex;
              const focusedColIndex =
                focusedCell?.rowIndex === rowIndex ? focusedCell.colIndex : null;
              const editingColIndex = isEditingRow ? editingCell.colIndex : null;
              return (
                <DataRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  rowIndex={rowIndex}
                  isEditingRow={isEditingRow}
                  focusedColIndex={focusedColIndex}
                  editingColIndex={editingColIndex}
                  onCellClick={handleCellClick}
                  onCellFocus={handleCellFocus}
                  onCommit={handleCommit}
                  onCancel={handleCancel}
                  onTabCommit={handleTabCommit}
                  onEditChange={handleEditChange}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {hasTotals && (
        <div className={styles.totalsWrapper}>
          <table className={styles.totalsTable} aria-hidden="true">
            <colgroup>
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                />
              ))}
            </colgroup>
            <tfoot>
              <TotalsRow columns={columns} totals={computedTotals} />
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
