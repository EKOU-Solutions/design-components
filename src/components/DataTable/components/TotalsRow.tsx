import React from "react";
import styles from "./TotalsRow.module.css";
import type { ColumnDef, TotalsData } from "../types";

interface TotalsRowProps {
  columns: ColumnDef[];
  totals: TotalsData;
}

export function TotalsRow({ columns, totals }: TotalsRowProps) {
  return (
    <tr className={styles.row} role="row" aria-label="Totals">
      {columns.map((col) => {
        const value = totals[col.key];
        const displayValue = value == null ? "" : String(value);
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
