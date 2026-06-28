"use client";

import { useState } from "react";
import { HostedZone } from "@/types/zone";
import { useUpdateZone } from "@/hooks/useZones";
import { X } from "lucide-react";

export function EditZoneModal({ zone, onClose }: { zone: HostedZone; onClose: () => void }) {
  const [type, setType] = useState<"Public" | "Private">(zone.type);
  const [comment, setComment] = useState(zone.comment ?? "");
  const updateMutation = useUpdateZone(zone.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      type,
      comment: comment.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit Hosted Zone</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Domain name</label>
              <input className="form-control" value={zone.name} disabled />
              <div className="form-hint">Domain name cannot be changed after creation</div>
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
                placeholder="Optional description"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={256}
                autoFocus
              />
              <div className="form-hint">{comment.length}/256</div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
