"use client";

import { useState } from "react";
import { useCreateRecord } from "@/hooks/useRecords";
import { RECORD_TYPES, TTL_PRESETS, RecordType } from "@/types/record";
import { X, Plus, Minus, Info } from "lucide-react";

interface Props {
  zoneId: string;
  zoneName: string;
  onClose: () => void;
}

const typeHints: Partial<Record<RecordType, string>> = {
  A: "Enter one or more IPv4 addresses (e.g. 192.0.2.1)",
  AAAA: "Enter one or more IPv6 addresses (e.g. 2001:db8::1)",
  CNAME: "Enter the canonical name (e.g. www.example.com.)",
  TXT: "Enter text values in quotes (e.g. \"v=spf1 include:example.com ~all\")",
  MX: "Enter mail server hostname. Set priority below.",
  NS: "Enter nameserver hostnames",
  PTR: "Enter the fully qualified domain name",
  SRV: "Format: target.example.com (set priority separately)",
  CAA: "Format: 0 issue \"letsencrypt.org\"",
};

export function CreateRecordModal({ zoneId, zoneName, onClose }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<RecordType>("A");
  const [ttl, setTtl] = useState(300);
  const [customTtl, setCustomTtl] = useState(false);
  const [routingPolicy, setRoutingPolicy] = useState("Simple");
  const [values, setValues] = useState([""]);
  const [priority, setPriority] = useState(10);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateRecord(zoneId);

  const addValue = () => setValues([...values, ""]);
  const removeValue = (i: number) => setValues(values.filter((_, idx) => idx !== i));
  const updateValue = (i: number, v: string) => {
    const n = [...values];
    n[i] = v;
    setValues(n);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Record name is required";
    if (values.every(v => !v.trim())) e.values = "At least one value is required";
    if (type === "CNAME" && values.filter(v => v.trim()).length > 1) {
      e.values = "CNAME records can only have one value";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const cleanValues = values.filter(v => v.trim());
    await createMutation.mutateAsync({
      name: name.trim() || "@",
      type,
      ttl,
      routing_policy: routingPolicy as any,
      value: cleanValues,
      priority: ["MX", "SRV"].includes(type) ? priority : undefined,
      comment: comment.trim() || undefined,
    });
    onClose();
  };

  const needsPriority = ["MX", "SRV"].includes(type);
  const singleValue = type === "CNAME";

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">Create DNS Record</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Record name */}
              <div className="form-group" style={{ gridColumn: "1" }}>
                <label className="form-label">
                  Record name <span className="required">*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <input
                    className="form-control"
                    style={{ borderRadius: "4px 0 0 4px", borderRight: "none" }}
                    placeholder="www"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors({}); }}
                    autoFocus
                  />
                  <div
                    style={{
                      padding: "8px 10px",
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0 4px 4px 0",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    .{zoneName}
                  </div>
                </div>
                {errors.name && <div className="form-error">{errors.name}</div>}
                <div className="form-hint">Leave blank or enter @ for the zone apex</div>
              </div>

              {/* Record type */}
              <div className="form-group" style={{ gridColumn: "2" }}>
                <label className="form-label">Record type <span className="required">*</span></label>
                <select
                  className="form-control form-select"
                  value={type}
                  onChange={(e) => { setType(e.target.value as RecordType); setValues([""]); }}
                >
                  {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* TTL */}
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
                    {TTL_PRESETS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  {customTtl && (
                    <input
                      className="form-control"
                      type="number"
                      min={0}
                      max={2147483647}
                      value={ttl}
                      onChange={(e) => setTtl(parseInt(e.target.value) || 300)}
                      style={{ width: 100 }}
                    />
                  )}
                </div>
              </div>

              {/* Routing policy */}
              <div className="form-group">
                <label className="form-label">Routing policy</label>
                <select
                  className="form-control form-select"
                  value={routingPolicy}
                  onChange={(e) => setRoutingPolicy(e.target.value)}
                >
                  {["Simple", "Weighted", "Latency", "Failover", "Multivalue"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority for MX/SRV */}
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
                <div className="form-hint">Lower values have higher priority</div>
              </div>
            )}

            {/* Values */}
            <div className="form-group">
              <label className="form-label">
                Value <span className="required">*</span>
              </label>
              {typeHints[type] && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, padding: "8px 12px", background: "var(--aws-blue-light)", borderRadius: 4 }}>
                  <Info size={13} style={{ color: "var(--aws-blue)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{typeHints[type]}</span>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {values.map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <input
                      className="form-control"
                      placeholder={`Value ${i + 1}`}
                      value={v}
                      onChange={(e) => updateValue(i, e.target.value)}
                      style={{ fontFamily: "Monaco, Menlo, monospace", fontSize: 12 }}
                    />
                    {!singleValue && values.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeValue(i)}
                        style={{ color: "var(--aws-red)", flexShrink: 0 }}
                      >
                        <Minus size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {errors.values && <div className="form-error">{errors.values}</div>}
                {!singleValue && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={addValue}
                    style={{ alignSelf: "flex-start" }}
                  >
                    <Plus size={13} />
                    Add value
                  </button>
                )}
              </div>
            </div>

            {/* Comment */}
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
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Creating...</>
                : "Create record"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
