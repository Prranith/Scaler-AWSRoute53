"use client";

import { useZones } from "@/hooks/useZones";
import { useState, useRef } from "react";
import Link from "next/link";
import { Globe, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";

export default function DashboardPage() {
  const { data: zonesData } = useZones({ size: 5 });
  const notify = useNotificationStore();
  const domainInputRef = useRef<HTMLInputElement>(null);

  // Domain Registration Mock State
  const [domainName, setDomainName] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    available: boolean;
    message: string;
    domain: string;
  } | null>(null);

  // Handle Domain Check
  const handleCheckDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const d = domainName.trim();
    if (!d) return;

    setChecking(true);
    setCheckResult(null);

    setTimeout(() => {
      setChecking(false);
      // Basic validation
      const isValid = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/.test(d.replace(/\.$/, ""));
      
      if (!isValid) {
        setCheckResult({
          available: false,
          message: "Please enter a valid domain format.",
          domain: d,
        });
        return;
      }

      // Random availability mock
      const isAvailable = Math.random() > 0.4;
      setCheckResult({
        available: isAvailable,
        message: isAvailable 
          ? `Success! ${d} is available for purchase. Price: $12.00/year.`
          : `Sorry, ${d} is already registered. Try another name.`,
        domain: d,
      });

      if (isAvailable) {
        notify.success("Domain available", `${d} can be registered!`);
      } else {
        notify.warning("Domain unavailable", `${d} is already taken.`);
      }
    }, 1200);
  };

  const handleRegisterDomainClick = () => {
    domainInputRef.current?.focus();
    domainInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div>
      {/* AWS Breadcrumbs */}
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
        <Link href="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Route 53</Link>
        <span style={{ margin: "0 6px" }}>&gt;</span>
        <span style={{ color: "var(--text-muted)" }}>Dashboard</span>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 24, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            Route 53 Dashboard
            <span style={{ fontSize: 13, color: "var(--text-link)", fontWeight: 400, cursor: "pointer" }}>Info</span>
          </h1>
        </div>
      </div>

      {/* AWS Route53 Main Features Panel */}
      <div className="card" style={{ padding: 0, marginBottom: 24, overflow: "hidden" }}>
        <div className="aws-dashboard-grid" style={{ padding: "8px 0" }}>
          {/* Column 1: DNS Management */}
          <div className="aws-dashboard-column">
            <div>
              <div className="aws-dashboard-header">DNS management</div>
              <div className="aws-dashboard-desc">
                A hosted zone tells Route 53 how to respond to DNS queries for a domain such as example.com.
              </div>
            </div>
            <Link href="/zones/create" className="aws-dashboard-btn">
              Create hosted zone
            </Link>
          </div>

          {/* Column 2: Traffic Management */}
          <div className="aws-dashboard-column">
            <div>
              <div className="aws-dashboard-header">Traffic management</div>
              <div className="aws-dashboard-desc">
                A visual tool that lets you easily create policies for multiple endpoints in complex configurations.
              </div>
            </div>
            <Link href="/traffic-policies" className="aws-dashboard-btn">
              Create policy
            </Link>
          </div>

          {/* Column 3: Availability Monitoring */}
          <div className="aws-dashboard-column">
            <div>
              <div className="aws-dashboard-header">Availability monitoring</div>
              <div className="aws-dashboard-desc">
                Health checks monitor your applications and web resources, and direct DNS queries to healthy resources.
              </div>
            </div>
            <Link href="/health-checks" className="aws-dashboard-btn">
              Create health check
            </Link>
          </div>

          {/* Column 4: Domain Registration */}
          <div className="aws-dashboard-column">
            <div>
              <div className="aws-dashboard-header">Domain registration</div>
              <div className="aws-dashboard-desc">
                A domain is the name, such as example.com, that your users use to access your application.
              </div>
            </div>
            <button onClick={handleRegisterDomainClick} className="aws-dashboard-btn">
              Register domain
            </button>
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="aws-dashboard-stats-row">
          <div className="aws-dashboard-stat">
            <div className="aws-dashboard-stat-val">{zonesData?.total ?? "—"}</div>
            <Link href="/zones" className="aws-dashboard-stat-label">
              Hosted zones
            </Link>
          </div>
          <div className="aws-dashboard-stat">
            <div className="aws-dashboard-stat-val">0</div>
            <Link href="/health-checks" className="aws-dashboard-stat-label">
              Readiness checks
            </Link>
          </div>
          <div className="aws-dashboard-stat">
            <div className="aws-dashboard-stat-val">0</div>
            <Link href="/traffic-policies" className="aws-dashboard-stat-label">
              Control panels
            </Link>
          </div>
        </div>
      </div>

      {/* Register Domain Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title" style={{ fontSize: 16, fontWeight: 700 }}>Register domain</span>
        </div>
        <div className="card-body" style={{ padding: "20px" }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px 0" }}>
            Find and register an available domain, or transfer your existing domains to Route 53.
          </p>
          
          <form onSubmit={handleCheckDomain} style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: "800px" }}>
            <input
              ref={domainInputRef}
              className="form-control"
              type="text"
              placeholder="Enter a domain name"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              style={{ width: "100%", height: "34px", padding: "6px 12px", border: "1px solid var(--border-color)", borderRadius: "4px", outline: "none" }}
            />
            
            {/* Subtext info */}
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
              Each label (each part between dots) can be up to 63 characters long and must start with a-z or 0-9. Maximum length: 255 characters, including dots. Valid characters: a-z, 0-9, and - (hyphen)
            </div>

            {/* Check Button */}
            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                className="aws-dashboard-btn"
                disabled={checking}
                style={{ padding: "6px 20px", display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                {checking && <Loader2 size={13} className="spinner" />}
                Check
              </button>
            </div>
          </form>

          {/* Check Results */}
          {checkResult && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                borderRadius: "4px",
                border: `1px solid ${checkResult.available ? "rgba(46, 204, 113, 0.25)" : "rgba(231, 76, 60, 0.25)"}`,
                backgroundColor: checkResult.available ? "rgba(46, 204, 113, 0.05)" : "rgba(231, 76, 60, 0.05)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                maxWidth: "800px",
              }}
            >
              {checkResult.available ? (
                <CheckCircle size={16} style={{ color: "#2ecc71", flexShrink: 0, marginTop: 1 }} />
              ) : (
                <AlertCircle size={16} style={{ color: "#e74c3c", flexShrink: 0, marginTop: 1 }} />
              )}
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {checkResult.message}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card">
        <div
          className="card-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span className="card-title" style={{ fontSize: 16, fontWeight: 700 }}>Notifications</span>
          <button className="btn btn-ghost btn-sm" style={{ padding: 4, display: "flex", alignItems: "center" }} onClick={() => window.location.reload()}>
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="card-body" style={{ padding: "20px" }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px 0" }}>
            Review recent operational notifications and background activity.
          </p>

          <div
            style={{
              border: "1px solid var(--border-color)",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px", backgroundColor: "rgba(255,255,255,0.01)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
                <CheckCircle size={15} style={{ color: "#2ecc71", marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>AWS Route53 Core Services Active</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                    API Gateway is online, database engine WAL mode loaded.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Globe size={15} style={{ color: "var(--aws-orange)", marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>DNS Database Loaded Successfully</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                    44 hosted zones loaded. Regional resolver synced with Global endpoints.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
