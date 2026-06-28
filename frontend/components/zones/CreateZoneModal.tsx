"use client";

import { useState } from "react";
import { useCreateZone } from "@/hooks/useZones";
import { X, Globe, Info } from "lucide-react";

export function CreateZoneModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"Public" | "Private">("Public");
  const [comment, setComment] = useState("");
  const [nameError, setNameError] = useState("");
  const createMutation = useCreateZone();

  const validateDomain = (val: string) => {
    const v = val.trim().replace(/\.$/, "");
    if (!v) return "Domain name is required";
    if (!/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/.test(v)) {
      return "Enter a valid domain name (e.g. example.com)";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateDomain(name);
    if (err) { setNameError(err); return; }
    setNameError("");
    await createMutation.mutateAsync({
      name: name.trim(),
      type,
      comment: comment.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create Hosted Zone</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                padding: "12px 14px",
                background: "var(--aws-blue-light)",
                borderRadius: 4,
                marginBottom: 20,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <Info size={15} style={{ color: "var(--aws-blue)", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Hosted zones contain DNS records for your domain. Each zone is charged separately on AWS Route53. You can create public zones (accessible from the internet) or private zones (VPC only).
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Domain name <span className="required">*</span>
              </label>
              <input
                className={`form-control ${nameError ? "error" : ""}`}
                type="text"
                placeholder="example.com"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                autoFocus
                style={{ borderColor: nameError ? "var(--aws-red)" : undefined }}
              />
              {nameError && <div className="form-error">{nameError}</div>}
              <div className="form-hint">Enter the domain name (trailing dot will be added automatically)</div>
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: "flex", gap: 12 }}>
                {(["Public", "Private"] as const).map((t) => (
                  <label
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      padding: "10px 16px",
                      border: `2px solid ${type === t ? "var(--aws-blue)" : "var(--border-color)"}`,
                      borderRadius: 6,
                      flex: 1,
                      background: type === t ? "var(--aws-blue-light)" : "transparent",
                      transition: "all 150ms",
                    }}
                  >
                    <input
                      type="radio"
                      value={t}
                      checked={type === t}
                      onChange={() => setType(t)}
                      style={{ accentColor: "var(--aws-blue)" }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {t === "Public" ? "Accessible from internet" : "VPC only"}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Comment</label>
              <textarea
                className="form-control"
                placeholder="Optional description for this zone"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                maxLength={256}
              />
              <div className="form-hint">{comment.length}/256</div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <><span className="spinner" style={{ width: 14, height: 14 }} /> Creating...</>
              ) : (
                <><Globe size={14} /> Create hosted zone</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
