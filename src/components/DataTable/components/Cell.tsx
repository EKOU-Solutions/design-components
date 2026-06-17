import React from "react";
import styles from "./Cell.module.css";

interface CellProps {
  value: unknown;
  align?: "left" | "right" | "center";
  selected?: boolean;
  width?: number;
}

export function Cell({ value, align = "left", selected = false, width }: CellProps) {
  const displayValue = value == null ? "" : String(value);
  const style: React.CSSProperties = width
    ? { width, minWidth: width, maxWidth: width }
    : {};

  return (
    <td
      className={styles.cell}
      data-align={align}
      data-selected={selected}
      title={displayValue}
      style={style}
    >
      {displayValue}
      {selected && <span className={styles.selectedIndicator} aria-hidden="true" />}
    </td>
  );
}
