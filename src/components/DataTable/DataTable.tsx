import React from "react";
import styles from "./DataTable.module.css";
import { Toolbar } from "./components/Toolbar";
import { ColumnHeader } from "./components/ColumnHeader";
import { DataRow } from "./components/DataRow";
import { TotalsRow } from "./components/TotalsRow";
import type { DataTableProps } from "./types";

export function DataTable({
  columns,
  rows,
  totals,
  selectedCell,
  height,
  className,
}: DataTableProps) {
  const isFill = height === "fill";

  const rootClass = [
    styles.root,
    isFill ? styles.rootFill : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const scrollClass = [
    styles.scrollWrapper,
    isFill ? styles.scrollWrapperFill : "",
  ]
    .filter(Boolean)
    .join(" ");

  const scrollStyle: React.CSSProperties =
    typeof height === "number" ? { maxHeight: height } : {};

  return (
    <div className={rootClass}>
      <Toolbar />

      <div className={scrollClass} style={scrollStyle}>
        <table
          className={styles.table}
          role="grid"
          aria-label="Data table"
          aria-rowcount={rows.length + (totals ? 1 : 0)}
          aria-colcount={columns.length}
        >
          <thead>
            <tr role="row">
              {columns.map((col) => (
                <ColumnHeader key={col.key} column={col} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <DataRow
                key={row.id}
                row={row}
                columns={columns}
                selectedColKey={
                  selectedCell?.rowId === row.id
                    ? selectedCell.colKey
                    : undefined
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {totals && (
        <div className={styles.totalsWrapper}>
          <table className={styles.totalsTable} aria-hidden="true">
            <colgroup>
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={
                    col.width
                      ? { width: col.width, minWidth: col.width }
                      : undefined
                  }
                />
              ))}
            </colgroup>
            <tfoot>
              <TotalsRow columns={columns} totals={totals} />
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
