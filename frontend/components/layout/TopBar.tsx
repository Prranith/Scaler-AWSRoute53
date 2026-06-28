"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";
import { Moon, Sun, LogOut, User, Globe, Search, Bell, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export function TopBar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const notify = useNotificationStore();
  const [darkMode, setDarkMode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [unreadCount, setUnreadCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: "1", title: "API Gateway online", desc: "Route53 Clone backend server started successfully.", time: "Just now", type: "success", read: false },
    { id: "2", title: "Database seeded", desc: "Seeded 44 hosted zones and DNS records successfully.", time: "10 mins ago", type: "info", read: false },
    { id: "3", title: "Global region selector active", desc: "Region routing configured for Global DNS entries.", time: "1 hour ago", type: "warning", read: false },
  ]);

  const searchItems = [
    { name: "Hosted Zones", path: "/zones", desc: "Route 53 DNS Zones and domain routing records" },
    { name: "Create Hosted Zone", path: "/zones/create", desc: "Provision public or private DNS zones linked to VPCs" },
    { name: "Health Checks", path: "/health-checks", desc: "Monitor servers, endpoints, and health failovers" },
    { name: "Traffic Policies", path: "/traffic-policies", desc: "Configure advanced DNS routing flows and geolocations" },
    { name: "Resolver (Endpoints & Rules)", path: "/resolver", desc: "Configure hybrid network DNS forwarding and query rules" },
    { name: "Domain Registration Availability", path: "/dashboard", desc: "Check if a domain name is available for registration" },
  ];

  const filteredItems = searchQuery
    ? searchItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchItems;

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const handleClose = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
      setShowSearchDropdown(false);
    };
    window.addEventListener("close-modal", handleClose);
    window.addEventListener("click", handleClose);

    const handleConsoleNotification = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log("[TopBar] received console-notification event:", detail);
      const newNotif = {
        id: String(Date.now()),
        title: detail.title,
        desc: detail.message || "Action completed successfully.",
        time: "Just now",
        type: detail.type,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    window.addEventListener("console-notification", handleConsoleNotification);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "s" || e.key === "S" || e.key === "ß")) {
        e.preventDefault();
        const searchInput = document.getElementById("aws-nav-search-input");
        if (searchInput) {
          searchInput.focus();
          setShowSearchDropdown(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("close-modal", handleClose);
      window.removeEventListener("click", handleClose);
      window.removeEventListener("console-notification", handleConsoleNotification);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    notify.info("Signed out", "You have been logged out successfully");
    router.replace("/login");
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const toggleNotifications = () => {
    setShowNotifications(s => !s);
  };

  const openHelp = () => {
    window.dispatchEvent(new CustomEvent("show-shortcuts"));
  };

  return (
    <header className="topbar">
      {/* Left side: AWS Logo & Services Button */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="/aws-logo.jpg"
            alt="AWS Console"
            style={{
              height: "19px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Link>
        
        {/* Vertical divider */}
        <div style={{ width: "1px", height: "14px", backgroundColor: "rgba(255, 255, 255, 0.25)" }} />

        {/* Services Dropdown Trigger button */}
        <button
          style={{
            background: "none",
            border: "none",
            color: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "2px",
            transition: "background 150ms",
            height: "28px"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ opacity: 0.95, display: "block" }}>
            <rect x="0" y="0" width="3.5" height="3.5" rx="0.5" />
            <rect x="5.25" y="0" width="3.5" height="3.5" rx="0.5" />
            <rect x="10.5" y="0" width="3.5" height="3.5" rx="0.5" />
            <rect x="0" y="5.25" width="3.5" height="3.5" rx="0.5" />
            <rect x="5.25" y="5.25" width="3.5" height="3.5" rx="0.5" />
            <rect x="10.5" y="5.25" width="3.5" height="3.5" rx="0.5" />
            <rect x="0" y="10.5" width="3.5" height="3.5" rx="0.5" />
            <rect x="5.25" y="10.5" width="3.5" height="3.5" rx="0.5" />
            <rect x="10.5" y="10.5" width="3.5" height="3.5" rx="0.5" />
          </svg>
          Services
        </button>
      </div>

      {/* Middle: AWS Styled Global Search Bar with option+s badge */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-start", maxWidth: "420px", marginLeft: "12px", position: "relative" }}>
        <div style={{ position: "relative", width: "100%" }} onClick={(e) => e.stopPropagation()}>
          <Search
            size={12}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          />
          <input
            id="aws-nav-search-input"
            style={{
              width: "100%",
              padding: "4px 80px 4px 28px",
              background: "#161b22",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#ffffff",
              outline: "none",
              transition: "all 150ms",
              height: "25px",
            }}
            placeholder="Search for services, features, blogs, docs, and more"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
          />
          <div
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "9px",
              color: "rgba(255, 255, 255, 0.4)",
              background: "rgba(255, 255, 255, 0.08)",
              padding: "1px 5px",
              borderRadius: "3px",
              pointerEvents: "none",
              fontWeight: 500,
            }}
          >
            [Option+S]
          </div>

          {/* Search Dropdown overlay */}
          {showSearchDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 6,
                backgroundColor: "#161b22",
                border: "1px solid #2b343f",
                borderRadius: "4px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
                maxHeight: "320px",
                overflowY: "auto",
                padding: "6px 0",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255, 255, 255, 0.4)", padding: "4px 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Services & Features
              </div>
              {filteredItems.length === 0 ? (
                <div style={{ padding: "12px 14px", color: "rgba(255, 255, 255, 0.5)", fontSize: "12px" }}>
                  No results match &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery("");
                      router.push(item.path);
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      transition: "background 150ms",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: "12px", color: "#ffffff", fontWeight: 500, textAlign: "left" }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", textAlign: "left" }}>
                      {item.desc}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Global Actions (User, Region, Signout dropdowns, Darkmode) */}
      <div className="topbar-actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        
        {/* Notifications Icon dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNotifications();
            }}
            className="topbar-action-item"
            data-tooltip="Console notifications"
            style={{ position: "relative" }}
          >
            <Bell size={15} style={{ color: "rgba(255, 255, 255, 0.85)" }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "var(--aws-orange)",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                width: "320px",
                backgroundColor: "var(--aws-sidebar-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
                color: "var(--text-primary)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--border-color)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600 }}>Console Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--aws-orange)",
                      fontSize: "11px",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Items */}
              <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "12px" }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid var(--border-color)",
                        display: "flex",
                        gap: 10,
                        backgroundColor: notif.read ? "transparent" : "rgba(236, 114, 17, 0.03)",
                        transition: "background-color 150ms",
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: notif.read ? "transparent" : "var(--aws-orange)",
                          marginTop: 5,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: "12px", fontWeight: notif.read ? 400 : 600, color: "var(--text-primary)" }}>
                          {notif.title}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.3 }}>
                          {notif.desc}
                        </span>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: 2 }}>
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Support/Help Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openHelp();
          }}
          className="topbar-action-item"
          data-tooltip="Console help & shortcuts"
        >
          <HelpCircle size={15} style={{ color: "rgba(255, 255, 255, 0.85)" }} />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDark}
          className="topbar-action-item"
          data-tooltip={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? <Sun size={15} style={{ color: "rgba(255, 255, 255, 0.85)" }} /> : <Moon size={15} style={{ color: "rgba(255, 255, 255, 0.85)" }} />}
        </button>

        {/* Global Selector dropdown text item */}
        <div
          className="topbar-action-item"
          data-tooltip="Global Service (Route 53)"
          style={{ cursor: "default", gap: 4, fontWeight: 500 }}
        >
          <span>Global</span>
          <span style={{ fontSize: "8px", opacity: 0.7, transform: "scale(0.8)", display: "inline-block" }}>▼</span>
        </div>

        {/* User Account Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowUserMenu(!showUserMenu);
            }}
            className="topbar-action-item"
            style={{ gap: 6, fontWeight: 600 }}
          >
            <User size={13} style={{ color: "var(--aws-orange)" }} />
            <span>{user?.username || "Alan Blackmore"}</span>
            <span style={{ fontSize: "8px", opacity: 0.7, transform: "scale(0.8)", display: "inline-block" }}>▼</span>
          </button>

          {showUserMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                width: "220px",
                backgroundColor: "var(--aws-sidebar-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
                color: "var(--text-primary)",
              }}
            >
              {/* Profile details */}
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {user?.username || "Alan Blackmore"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 2 }}>
                  Account ID: 1234-5678
                </div>
              </div>
              
              {/* Dropdown Menu actions */}
              <div style={{ padding: "6px" }}>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "none",
                    border: "none",
                    color: "var(--text-primary)",
                    textAlign: "left",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: "4px",
                    transition: "background 150ms",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--aws-sidebar-hover)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
