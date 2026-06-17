import React from "react";

export interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

export function Button({ label, variant = "primary", onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 4,
        border: "none",
        cursor: "pointer",
        background: variant === "primary" ? "#0070f3" : "#eaeaea",
        color: variant === "primary" ? "#fff" : "#000",
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}
