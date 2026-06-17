import React from "react";
import styles from "./TotalsRow.module.css";
import type { ColumnDef } from "../types";

interface TotalsRowProps {
  columns: ColumnDef[];
  totals: Record<string, string>;
  deletable?: boolean;
  withFiller?: boolean;
}

export function TotalsRow({ columns, totals, deletable, withFiller }: TotalsRowProps) {
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
      {deletable && <td className={styles.deleteCell} />}
      {withFiller && <td className={styles.fillerCell} />}
    </tr>
  );
}
