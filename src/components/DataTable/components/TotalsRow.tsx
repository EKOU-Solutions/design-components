import React from "react";
import styles from "./TotalsRow.module.css";
import type { ColumnDef } from "../types";

interface TotalsRowProps {
  columns: ColumnDef[];
  totals: Record<string, string>;
}

export function TotalsRow({ columns, totals }: TotalsRowProps) {
  return (
    <tr className={styles.row} role="row" aria-label="Totals">
      {columns.map((col) => {
        const displayValue = totals[col.key] ?? "";
        return (
          <td
            key={col.key}
            className={styles.cell}
            data-align={col.align ?? "left"}
            title={displayValue}
          >
            {displayValue}
          </td>
        );
      })}
    </tr>
  );
}
