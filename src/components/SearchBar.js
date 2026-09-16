import React, { useEffect, useRef, useState } from "react";

function SearchIcon() {
  return (
    <svg
      className="search-icon"
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
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export default function SearchBar({ value, onChange }) {
  const inputRef = useRef(null);
  const valueRef = useRef(value);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );
  const [expanded, setExpanded] = useState(() =>
    typeof window !== "undefined" && !window.matchMedia("(max-width: 767px)").matches
  );

  valueRef.current = value;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChangeViewport = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      setExpanded(!mobile || Boolean(valueRef.current));
    };
    mq.addEventListener("change", onChangeViewport);
    return () => mq.removeEventListener("change", onChangeViewport);
  }, []);

  const focusInput = () => {
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const openSearch = () => {
    setExpanded(true);
    focusInput();
  };

  const closeSearch = () => {
    if (!isMobile) return;
    setExpanded(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && isMobile) {
      e.currentTarget.blur();
      setExpanded(false);
    }
  };

  return (
    <div className={`search-bar${expanded ? " is-expanded" : ""}${value ? " has-value" : ""}`}>
      {expanded ? (
        <span className="search-icon-btn" aria-hidden="true">
          <SearchIcon />
        </span>
      ) : (
        <button
          type="button"
          className="search-icon-btn"
          aria-label="Search"
          onClick={openSearch}
        >
          <SearchIcon />
        </button>
      )}
      <input
        ref={inputRef}
        type="search"
        className="search-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isMobile ? "Search name, team, or ID..." : "Search"}
        aria-label="Search name, team, or ID"
        tabIndex={expanded || !isMobile ? 0 : -1}
      />
      {isMobile && expanded && (
        <button
          type="button"
          className="search-close"
          aria-label="Close search"
          onClick={closeSearch}
        >
          ×
        </button>
      )}
    </div>
  );
}
