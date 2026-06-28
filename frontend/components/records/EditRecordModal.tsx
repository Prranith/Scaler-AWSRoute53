"use client";

import { useState } from "react";
import { useUpdateRecord } from "@/hooks/useRecords";
import { DNSRecord, TTL_PRESETS } from "@/types/record";
import { X, Plus, Minus } from "lucide-react";

interface Props {
  record: DNSRecord;
  zoneId: string;
  onClose: () => void;
}

export function EditRecordModal({ record, zoneId, onClose }: Props) {
  const [name, setName] = useState(record.name);
  const [ttl, setTtl] = useState(record.ttl);
  const [customTtl, setCustomTtl] = useState(
    !TTL_PRESETS.some(p => p.value === record.ttl && p.value !== -1)
  );
  const [values, setValues] = useState<string[]>(record.value);
  const [priority, setPriority] = useState(record.priority ?? 10);
  const [comment, setComment] = useState(record.comment ?? "");

  const updateMutation = useUpdateRecord(zoneId, record.id);

  const addValue = () => setValues([...values, ""]);
  const removeValue = (i: number) => setValues(values.filter((_, idx) => idx !== i));
  const updateValue = (i: number, v: string) => {
    const n = [...values]; n[i] = v; setValues(n);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanValues = values.filter(v => v.trim());
    await updateMutation.mutateAsync({
      name: name.trim(),
      ttl,
      value: cleanValues,
      priority: ["MX", "SRV"].includes(record.type) ? priority : undefined,
      comment: comment.trim() || undefined,
    });
    onClose();
  };

  const needsPriority = ["MX", "SRV"].includes(record.type);
  const singleValue = record.type === "CNAME";

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`record-type-badge record-type-${record.type}`}>{record.type}</span>
            <h2 className="modal-title">Edit DNS Record</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Record name</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Record type</label>
                <input className="form-control" value={record.type} disabled />
                <div className="form-hint">Record type cannot be changed</div>
              </div>

              <div className="form-group">
                <label className="form-label">TTL (seconds)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    className="form-control form-select"
                    value={customTtl ? -1 : ttl}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (v === -1) setCustomTtl(true);
                      else { setCustomTtl(false); setTtl(v); }
                    }}
                  >
                    {TTL_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  {customTtl && (
                    <input
                      className="form-control"
                      type="number"
                      min={0}
                      value={ttl}
                      onChange={(e) => setTtl(parseInt(e.target.value) || 300)}
                      style={{ width: 100 }}
                    />
                  )}
                </div>
              </div>

              {needsPriority && (
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <input
                    className="form-control"
                    type="number"
                    min={0}
                    max={65535}
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                    style={{ width: 120 }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Values</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {values.map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <input
                      className="form-control"
                      value={v}
                      onChange={(e) => updateValue(i, e.target.value)}
                      style={{ fontFamily: "Monaco, Menlo, monospace", fontSize: 12 }}
                    />
                    {!singleValue && values.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeValue(i)}
                        style={{ color: "var(--aws-red)" }}
                      >
                        <Minus size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {!singleValue && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addValue} style={{ alignSelf: "flex-start" }}>
                    <Plus size={13} /> Add value
                  </button>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Comment</label>
              <input
                className="form-control"
                placeholder="Optional description"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={256}
              />
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
