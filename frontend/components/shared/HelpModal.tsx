"use client";

import { useEffect, useState } from "react";
import { X, HelpCircle, Keyboard, FileText, Globe } from "lucide-react";

export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"shortcuts" | "help" | "bind">("shortcuts");

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("show-shortcuts", handleOpen);
    window.addEventListener("close-modal", handleClose);

    return () => {
      window.removeEventListener("show-shortcuts", handleOpen);
      window.removeEventListener("close-modal", handleClose);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          backgroundColor: "var(--aws-sidebar-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
            backgroundColor: "var(--aws-navy)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HelpCircle size={18} style={{ color: "var(--aws-orange)" }} />
            <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 600 }}>
              Route 53 Help & Console shortcuts
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.7)",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-color)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          {[
            { id: "shortcuts", label: "Shortcuts", icon: <Keyboard size={14} /> },
            { id: "help", label: "Route 53 Concepts", icon: <Globe size={14} /> },
            { id: "bind", label: "BIND Import Format", icon: <FileText size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--aws-orange)" : "2px solid transparent",
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px", maxHeight: "400px", overflowY: "auto", color: "var(--text-primary)" }}>
          {activeTab === "shortcuts" && (
            <div>
              <p style={{ fontSize: "13px", margin: "0 0 16px 0", color: "var(--text-secondary)" }}>
                Use these keyboard shortcuts anywhere on the dashboard to speed up your workflow.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { keys: ["?"], desc: "Open this Help and console shortcuts overlay" },
                  { keys: ["Esc"], desc: "Close any active modal or dropdown" },
                  { keys: ["N"], desc: "Create a new Hosted Zone (on Dashboard) or new DNS Record (in Zone Details)" },
                  { keys: ["R"], desc: "Refresh the current table data (Zones or Records)" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>{item.desc}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            fontFamily: "monospace",
                            fontSize: "11px",
                            fontWeight: 600,
                            boxShadow: "0 1.5px 0 var(--border-color)",
                            color: "var(--aws-orange)",
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "help" && (
            <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>Hosted Zones</h4>
              <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)" }}>
                A hosted zone is a container for records, which hold information about how you want to route traffic for
                a domain and its subdomains. 
              </p>
              <ul style={{ margin: "0 0 16px 0", paddingLeft: "20px", color: "var(--text-secondary)" }}>
                <li><strong>Public Hosted Zones:</strong> Determine how traffic is routed on the Internet.</li>
                <li><strong>Private Hosted Zones:</strong> Route traffic within an Amazon VPC network container.</li>
              </ul>

              <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>Supported Record Types</h4>
              <p style={{ margin: "0 0 0 0", color: "var(--text-secondary)" }}>
                Route 53 supports standard DNS record types:
              </p>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px", color: "var(--text-secondary)" }}>
                <li><strong>A:</strong> Map domain to IPv4 addresses.</li>
                <li><strong>AAAA:</strong> Map domain to IPv6 addresses.</li>
                <li><strong>CNAME:</strong> Canonical name to redirect alias domains.</li>
                <li><strong>MX:</strong> Direct mail delivery handlers.</li>
                <li><strong>TXT:</strong> Validate domain ownership (SPF/DKIM tokens).</li>
                <li><strong>SRV:</strong> Define specific port configurations for service lookup (e.g. Minecraft nodes).</li>
              </ul>
            </div>
          )}

          {activeTab === "bind" && (
            <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
              <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)" }}>
                The <strong>Import BIND</strong> engine parses files that conform to the BIND zone file format. Sample files can be found in the <code>bind_samples/</code> directory.
              </p>
              <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>Valid Format Example</h4>
              <pre
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "12px",
                  overflowX: "auto",
                  color: "var(--text-primary)",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  margin: 0,
                }}
              >
{`$TTL 3600
@           IN  A       198.51.100.12
www         IN  CNAME   @
api         300 IN  A   198.51.100.100
@           IN  MX      10 mail.acme-corp.com.
@           IN  TXT     "v=spf1 include:_spf.google.com ~all"`}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px 20px",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "rgba(0, 0, 0, 0.1)",
          }}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-secondary btn-sm"
            style={{ minWidth: "80px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
