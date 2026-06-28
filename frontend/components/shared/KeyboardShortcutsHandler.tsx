"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcutsHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      switch (e.key) {
        case "?":
          // Show shortcuts modal - dispatch custom event
          window.dispatchEvent(new CustomEvent("show-shortcuts"));
          break;
        case "Escape":
          window.dispatchEvent(new CustomEvent("close-modal"));
          break;
        case "n":
        case "N":
          // Navigate to new record/zone from context
          window.dispatchEvent(new CustomEvent("shortcut-new"));
          break;
        case "r":
        case "R":
          if (e.ctrlKey || e.metaKey) return; // Don't intercept Ctrl+R
          window.dispatchEvent(new CustomEvent("shortcut-refresh"));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
