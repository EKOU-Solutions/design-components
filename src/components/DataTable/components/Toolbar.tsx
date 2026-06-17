import React from "react";
import styles from "./Toolbar.module.css";

function ZoomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="4" x2="6" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="7" y1="4" x2="7" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <path
        d="M2 7a5 5 0 1 0 1-3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <polyline points="1,2 1,5 4,5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="10" height="7" viewBox="0 0 10 7" aria-hidden="true" focusable="false">
      <polyline points="1,6 5,2 9,6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="10" height="7" viewBox="0 0 10 7" aria-hidden="true" focusable="false">
      <polyline points="1,1 5,5 9,1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Toolbar() {
  return (
    <div role="toolbar" aria-label="Table actions" className={styles.toolbar}>
      <button className={styles.iconButton} aria-label="Zoom">
        <ZoomIcon />
      </button>

      <div className={styles.divider} aria-hidden="true" />

      <span className={styles.pageIndicator} aria-label="Page 1">1</span>

      <div className={styles.arrowGroup}>
        <button className={styles.iconButton} aria-label="Previous page">
          <ChevronUpIcon />
        </button>
        <button className={styles.iconButton} aria-label="Next page">
          <ChevronDownIcon />
        </button>
      </div>

      <button className={styles.iconButton} aria-label="Add row">
        <AddIcon />
      </button>

      <div className={styles.divider} aria-hidden="true" />

      <button className={styles.iconButton} aria-label="Refresh">
        <RefreshIcon />
      </button>
    </div>
  );
}
