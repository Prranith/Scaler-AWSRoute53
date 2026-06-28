"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { KeyboardShortcutsHandler } from "@/components/shared/KeyboardShortcutsHandler";
import { HelpModal } from "@/components/shared/HelpModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after Zustand has finished rehydrating from localStorage
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Show a loading state while Zustand is rehydrating
  if (!_hasHydrated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--aws-navy)",
        }}
      >
        <div className="spinner spinner-lg" style={{ borderTopColor: "#ec7211" }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <div className="content">{children}</div>
      </div>
      <KeyboardShortcutsHandler />
      <HelpModal />
    </div>
  );
}
