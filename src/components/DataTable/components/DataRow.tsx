import React from "react";
import styles from "./DataRow.module.css";
import { Cell } from "./Cell";
import type { ColumnDef, RowData } from "../types";

interface DataRowProps {
  row: RowData;
  columns: ColumnDef[];
  selectedColKey?: string;
}

export function DataRow({ row, columns, selectedColKey }: DataRowProps) {
  return (
    <tr className={styles.row}>
      {columns.map((col) => (
        <Cell
          key={col.key}
          value={row[col.key]}
          align={col.align}
          selected={selectedColKey === col.key}
          width={col.width}
        />
      ))}
    </tr>
  );
}
