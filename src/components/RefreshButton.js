import React from "react";

export default function RefreshButton({ onClick, loading, disabled }) {
  return (
    <button
      type="button"
      className={`refresh-btn${loading ? " is-loading" : ""}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label="Refresh"
      title="Refresh"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-2.3-6" />
        <path d="M21 3v6h-6" />
      </svg>
    </button>
  );
}
