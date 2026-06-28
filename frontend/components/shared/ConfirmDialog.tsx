"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {variant === "danger" && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(203,36,49,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={16} style={{ color: "var(--aws-red)" }} />
              </div>
            )}
            <h2 className="modal-title">{title}</h2>
          </div>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>
            {message}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
            style={{ background: "var(--aws-red)", color: "#fff", borderColor: "var(--aws-red)" }}
          >
            {loading ? (
              <>
                <Loader2 size={13} style={{ animation: "spin 600ms linear infinite" }} />
                Deleting...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
