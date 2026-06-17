import React, { useRef, useState, useEffect } from "react";
import styles from "./ColumnHeader.module.css";
import type { ColumnDef } from "../types";

interface ColumnHeaderProps {
  column: ColumnDef;
}

function ChevronIcon() {
  return (
    <svg
      width="8"
      height="6"
      viewBox="0 0 8 6"
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points="1,1 4,5 7,1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MENU_ITEMS = [
  "Sort Ascending",
  "Sort Descending",
  "Group by this field",
  "Filter by this field",
  "Hide Column",
  "Pin to left",
] as const;

export function ColumnHeader({ column }: ColumnHeaderProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const thStyle: React.CSSProperties = column.width
    ? { width: column.width, minWidth: column.width, maxWidth: column.width }
    : {};

  return (
    <th
      scope="col"
      className={styles.th}
      style={thStyle}
      aria-label={column.label}
    >
      <div className={styles.inner}>
        <span className={styles.label} title={column.label}>
          {column.label}
        </span>
        <div className={styles.dropdownWrapper} ref={wrapperRef}>
          <button
            className={styles.chevronButton}
            aria-label={`Column options for ${column.label}`}
            aria-haspopup="menu"
            aria-expanded={open}
            type="button"
            onClick={() => setOpen((prev) => !prev)}
          >
            <ChevronIcon />
          </button>
          {open && (
            <div
              role="menu"
              aria-label={`Column options for ${column.label}`}
              className={styles.dropdown}
            >
              {MENU_ITEMS.map((item) => (
                <button
                  key={item}
                  role="menuitem"
                  className={styles.dropdownItem}
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </th>
  );
}
