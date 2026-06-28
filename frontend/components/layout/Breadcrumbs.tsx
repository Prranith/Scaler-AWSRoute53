"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: "12px",
        color: "var(--text-secondary)",
        marginBottom: "12px",
      }}
    >
      <Link
        href="/zones"
        style={{
          color: "var(--text-secondary)",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Route 53
      </Link>
      {items.map((item, idx) => (
        <span key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ChevronRight size={12} style={{ color: "var(--text-muted)", opacity: 0.8 }} />
          {item.href ? (
            <Link
              href={item.href}
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
