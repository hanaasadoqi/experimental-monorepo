"use client";

import React from "react";

export const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  options?: { enabled?: boolean }
) => {
  const { enabled = true } = options || {};

  React.useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClickOutside, enabled]);
};
