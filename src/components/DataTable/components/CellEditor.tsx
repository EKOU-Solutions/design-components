import React, { useState, useRef, useEffect } from "react";
import styles from "./CellEditor.module.css";
import type { ColumnDef } from "../types";

interface CellEditorProps {
  column: ColumnDef;
  initialValue: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onTabCommit: (value: string) => void;
  onEditChange: (value: string) => void;
}

function ChevronDownIcon() {
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" aria-hidden="true" focusable="false">
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

function TextEditor({
  column,
  initialValue,
  onCommit,
  onCancel,
  onTabCommit,
  onEditChange,
}: CellEditorProps) {
  const [value, setValue] = useState(initialValue);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onEditChange(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      onCommit(value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    } else if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      onTabCommit(value);
    }
  }

  return (
    <div className={styles.editorWrapper}>
      <input
        type={column.type === "number" ? "number" : "text"}
        autoFocus
        className={styles.input}
        value={value}
        placeholder={column.placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label={column.label}
      />
    </div>
  );
}

function SelectEditor({
  column,
  initialValue,
  onCommit,
  onCancel,
  onEditChange,
}: CellEditorProps) {
  const options = column.options ?? [];
  const [open, setOpen] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(() => {
    const idx = options.findIndex((o) => o.value === initialValue);
    return idx >= 0 ? idx : 0;
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const currentLabel = options.find((o) => o.value === initialValue)?.label ?? initialValue;

  // Auto-focus the trigger button on mount
  useEffect(() => {
    triggerRef.current?.focus();
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[role="option"]');
    items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  // Close when clicking outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onCommit(initialValue);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [initialValue, onCommit]);

  function handleSelect(value: string) {
    onEditChange(value);
    onCommit(value);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        e.stopPropagation();
        if (options[highlightedIndex]) {
          handleSelect(options[highlightedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        onCancel();
        break;
      case "Tab":
        e.preventDefault();
        e.stopPropagation();
        if (options[highlightedIndex]) {
          handleSelect(options[highlightedIndex].value);
        }
        break;
    }
  }

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.selectWrapper} ref={wrapperRef}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.selectTrigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={column.label}
          aria-activedescendant={open ? `${column.key}-opt-${highlightedIndex}` : undefined}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={handleKeyDown}
        >
          <span className={styles.selectText}>{currentLabel || column.placeholder || "Select"}</span>
          <span className={styles.chevron}>
            <ChevronDownIcon />
          </span>
        </button>
        {open && (
          <ul
            ref={listRef}
            role="listbox"
            aria-label={column.label}
            className={styles.dropdown}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
          >
            {options.map((opt, index) => (
              <li
                key={opt.value}
                id={`${column.key}-opt-${index}`}
                role="option"
                aria-selected={opt.value === initialValue}
                data-highlighted={index === highlightedIndex ? "true" : undefined}
                className={[
                  styles.option,
                  opt.value === initialValue ? styles.optionActive : "",
                  index === highlightedIndex ? styles.optionHighlighted : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt.value);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function CellEditor(props: CellEditorProps) {
  if (props.column.type === "select") {
    return <SelectEditor {...props} />;
  }
  return <TextEditor {...props} />;
}
