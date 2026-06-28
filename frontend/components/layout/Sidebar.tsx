"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronDown, ChevronRight } from "lucide-react";

interface SubItem {
  href: string;
  label: string;
}

interface NavGroup {
  label: string;
  items: SubItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Group collapse states
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Traffic flow": true,
    "Domains": false,
    "Resolver": true,
    "DNS Firewall": false,
    "Application Recovery Controller": false,
  });

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && href !== "/dashboard" && pathname.startsWith(href));

  // Toggle mobile sidebar via window events if needed
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("close-sidebar", handleClose);

    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("close-sidebar", handleClose);
    };
  }, []);

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Sidebar Header: Brand name & Close button */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-text" style={{ fontSize: 16, fontWeight: 700 }}>
          Route 53
        </span>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "var(--aws-sidebar-text-secondary)",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Direct Links */}
        <Link
          href="/dashboard"
          className={`sidebar-nav-item ${isActive("/dashboard") ? "active" : ""}`}
          style={{ paddingLeft: 20 }}
        >
          Dashboard
        </Link>

        <Link
          href="/zones"
          className={`sidebar-nav-item ${isActive("/zones") ? "active" : ""}`}
          style={{ paddingLeft: 20 }}
        >
          Hosted zones
        </Link>

        <Link
          href="/health-checks"
          className={`sidebar-nav-item ${isActive("/health-checks") ? "active" : ""}`}
          style={{ paddingLeft: 20 }}
        >
          Health checks
        </Link>

        {/* Collapsible Section: Traffic flow */}
        <div>
          <div className="sidebar-section-label" onClick={() => toggleGroup("Traffic flow")}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {openGroups["Traffic flow"] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Traffic flow
            </span>
          </div>
          {openGroups["Traffic flow"] && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Link
                href="/traffic-policies"
                className={`sidebar-nav-item ${isActive("/traffic-policies") ? "active" : ""}`}
                style={{ paddingLeft: 38 }}
              >
                Traffic policies
              </Link>
              <Link
                href="/traffic-policies"
                className="sidebar-nav-item"
                style={{ paddingLeft: 38 }}
              >
                Policy records
              </Link>
            </div>
          )}
        </div>

        {/* Collapsible Section: Domains */}
        <div>
          <div className="sidebar-section-label" onClick={() => toggleGroup("Domains")}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {openGroups["Domains"] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Domains
            </span>
          </div>
          {openGroups["Domains"] && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Link href="/zones" className="sidebar-nav-item" style={{ paddingLeft: 38 }}>
                Registered domains
              </Link>
              <Link href="/zones" className="sidebar-nav-item" style={{ paddingLeft: 38 }}>
                Pending requests
              </Link>
            </div>
          )}
        </div>

        {/* Collapsible Section: Resolver */}
        <div>
          <div className="sidebar-section-label" onClick={() => toggleGroup("Resolver")}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {openGroups["Resolver"] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Resolver
            </span>
          </div>
          {openGroups["Resolver"] && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Link
                href="/resolver"
                className={`sidebar-nav-item ${isActive("/resolver") ? "active" : ""}`}
                style={{ paddingLeft: 38 }}
              >
                VPCs
              </Link>
              <Link href="/resolver" className="sidebar-nav-item" style={{ paddingLeft: 38 }}>
                Inbound endpoints
              </Link>
              <Link href="/resolver" className="sidebar-nav-item" style={{ paddingLeft: 38 }}>
                Outbound endpoints
              </Link>
              <Link
                href="/profiles"
                className={`sidebar-nav-item ${isActive("/profiles") ? "active" : ""}`}
                style={{ paddingLeft: 38 }}
              >
                Rules
              </Link>
              <Link href="/resolver" className="sidebar-nav-item" style={{ paddingLeft: 38 }}>
                Query logging
              </Link>
            </div>
          )}
        </div>

        {/* Collapsible Section: DNS Firewall */}
        <div>
          <div className="sidebar-section-label" onClick={() => toggleGroup("DNS Firewall")}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {openGroups["DNS Firewall"] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              DNS Firewall
            </span>
          </div>
          {openGroups["DNS Firewall"] && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Link href="/zones" className="sidebar-nav-item" style={{ paddingLeft: 38 }}>
                Rule groups
              </Link>
              <Link href="/zones" className="sidebar-nav-item" style={{ paddingLeft: 38 }}>
                Domain lists
              </Link>
            </div>
          )}
        </div>

        {/* Collapsible Section: Application Recovery Controller */}
        <div>
          <div className="sidebar-section-label" onClick={() => toggleGroup("Application Recovery Controller")}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {openGroups["Application Recovery Controller"] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Application Recovery Controller
            </span>
          </div>
          {openGroups["Application Recovery Controller"] && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Link href="/health-checks" className="sidebar-nav-item" style={{ paddingLeft: 38 }}>
                Getting started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Footer shortcut helper info */}
      <div className="sidebar-footer">
        <div style={{ fontSize: "11px", color: "var(--aws-sidebar-text-secondary)", marginBottom: "2px" }}>
          Press <span style={{ fontWeight: 600, color: "var(--aws-sidebar-text)" }}>?</span> for shortcuts
        </div>
      </div>
    </aside>
  );
}
