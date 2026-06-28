"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useZone } from "@/hooks/useZones";
import { useRecords, useDeleteRecord, useBulkDeleteRecords } from "@/hooks/useRecords";
import { DNSRecord, RECORD_TYPES } from "@/types/record";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CreateRecordModal } from "@/components/records/CreateRecordModal";
import { EditRecordModal } from "@/components/records/EditRecordModal";
import {
  Plus, Search, RefreshCw, Trash2, Pencil, ChevronLeft,
  Globe, Upload, ChevronUp, ChevronDown, Filter, Download,
} from "lucide-react";
import { recordsApi, zonesApi } from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function ZoneDetailPage() {
  const params = useParams();
  const zoneId = params.zoneId as string;
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState<DNSRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<DNSRecord | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const notify = useNotificationStore();

  const { data: zone, isLoading: zoneLoading } = useZone(zoneId);
  const deleteMutation = useDeleteRecord(zoneId);
  const bulkDeleteMutation = useBulkDeleteRecords(zoneId);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, typeFilter]);

  const { data: recordsData, isLoading: recordsLoading, refetch } = useRecords(zoneId, {
    page,
    size: 20,
    q: debouncedSearch || undefined,
    type: typeFilter || undefined,
  });

  useEffect(() => {
    const onNew = () => setShowCreate(true);
    const onRefresh = () => refetch();
    window.addEventListener("shortcut-new", onNew);
    window.addEventListener("shortcut-refresh", onRefresh);
    return () => {
      window.removeEventListener("shortcut-new", onNew);
      window.removeEventListener("shortcut-refresh", onRefresh);
    };
  }, [refetch]);

  const records = recordsData?.items ?? [];

  const toggleSelect = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    setSelected(selected.size === records.length ? new Set() : new Set(records.map((r: DNSRecord) => r.id)));
  };

  const handleBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync([...selected]);
    setSelected(new Set());
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await recordsApi.import(zoneId, file);
      notify.success(`Successfully imported ${res.data.imported} records out of ${res.data.total_parsed} parsed!`);
      refetch();
    } catch (err: any) {
      notify.error("Failed to import BIND zone file", err.response?.data?.detail);
    }
    setImporting(false);
    e.target.value = "";
  };

  const handleExport = async (format: "bind" | "json") => {
    if (!zone) return;
    setExporting(true);
    try {
      const res = await zonesApi.export(zoneId, format);
      const data = res.data;
      const blob = new Blob(
        [format === "bind" ? data : JSON.stringify(data, null, 2)],
        { type: format === "bind" ? "text/plain" : "application/json" }
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${zone.name.replace(/\.$/, "")}.${format === "bind" ? "zone" : "json"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success(`Zone exported in ${format.toUpperCase()} format successfully!`);
    } catch (err: any) {
      notify.error(`Failed to export zone as ${format.toUpperCase()}`, err.response?.data?.detail);
    }
    setExporting(false);
  };

  const getRecordTypeBadge = (type: string) => (
    <span className={`record-type-badge record-type-${type}`}>{type}</span>
  );

  if (zoneLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <div className="loading-text" style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>
          Please wait, while we are fetching data from the backend. This may take up to a few seconds...
        </div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="empty-state">
        <Globe size={48} />
        <h3>Zone not found</h3>
        <p>The hosted zone you're looking for doesn't exist or you don't have access.</p>
        <Link href="/zones" className="btn btn-primary">Back to Hosted Zones</Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Hosted Zones", href: "/zones" }, { label: zone.name }]} />
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{zone.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
            <span className="badge badge-neutral">ID: <code style={{ fontSize: 11 }}>{zone.id}</code></span>
            <span className={`badge ${zone.type === "Public" ? "badge-info" : "badge-neutral"}`}>{zone.type}</span>
            <span className="badge badge-neutral">{zone.record_count} records</span>
            {zone.comment && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{zone.comment}</span>}
          </div>
        </div>
        <div className="page-actions">
          <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
            <Upload size={13} />
            {importing ? "Importing..." : "Import BIND"}
            <input type="file" accept=".zone,.txt" onChange={handleImport} style={{ display: "none" }} />
          </label>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport("bind")} disabled={exporting}>
            <Download size={13} />
            Export BIND
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport("json")} disabled={exporting}>
            <Download size={13} />
            Export JSON
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => refetch()}>
            <RefreshCw size={13} />
            Refresh
          </button>
          <button id="create-record-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Create record
          </button>
        </div>
      </div>

      {/* Records table */}
      <div className="card">
        {selected.size > 0 && (
          <div className="bulk-bar">
            <span className="bulk-bar-count">{selected.size} record(s) selected</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 size={13} />
              Delete selected
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box">
              <Search size={14} />
              <input
                className="search-input"
                placeholder="Search by record name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="table-toolbar-right">
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {recordsData?.total ?? 0} record(s)
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-checkbox">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selected.size > 0 && selected.size === records.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Record name</th>
                <th>Type</th>
                <th>TTL (seconds)</th>
                <th>Routing policy</th>
                <th>Value/Route traffic to</th>
                <th>Comment</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recordsLoading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="loading-overlay">
                      <div className="spinner spinner-lg" />
                      <div className="loading-text" style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>
                        Please wait, while we are fetching data from the backend. This may take up to a few seconds...
                      </div>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Globe size={40} />
                      <h3>{debouncedSearch || typeFilter ? "No records match your filters" : "No DNS records yet"}</h3>
                      <p>
                        {debouncedSearch || typeFilter
                          ? "Try clearing your search or type filter."
                          : "Add DNS records to configure how traffic is routed for this domain."}
                      </p>
                      {!debouncedSearch && !typeFilter && (
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                          <Plus size={15} /> Create record
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record: DNSRecord) => (
                  <tr key={record.id} className={selected.has(record.id) ? "selected" : ""}>
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selected.has(record.id)}
                        onChange={() => toggleSelect(record.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: 12 }}>{record.name}</span>
                    </td>
                    <td>{getRecordTypeBadge(record.type)}</td>
                    <td>{record.ttl.toLocaleString()}</td>
                    <td>
                      <span className="badge badge-neutral">{record.routing_policy}</span>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {record.value.slice(0, 3).map((v, i) => (
                          <span key={i} className="mono truncate" style={{ fontSize: 12, display: "block" }}>
                            {record.priority != null ? `${record.priority} ` : ""}{v}
                          </span>
                        ))}
                        {record.value.length > 3 && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            +{record.value.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {record.comment || "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditRecord(record)}
                          data-tooltip="Edit record"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteRecord(record)}
                          data-tooltip="Delete record"
                          style={{ color: "var(--aws-red)" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {recordsData && recordsData.pages > 1 && (
          <Pagination
            page={page}
            pages={recordsData.pages}
            total={recordsData.total}
            size={20}
            onPage={setPage}
          />
        )}
      </div>

      {showCreate && <CreateRecordModal zoneId={zoneId} zoneName={zone.name} onClose={() => setShowCreate(false)} />}
      {editRecord && <EditRecordModal record={editRecord} zoneId={zoneId} onClose={() => setEditRecord(null)} />}
      {deleteRecord && (
        <ConfirmDialog
          title="Delete DNS record"
          message={
            <>
              Are you sure you want to delete the <strong>{deleteRecord.type}</strong> record for{" "}
              <strong>{deleteRecord.name}</strong>?
              <br />
              <span style={{ color: "var(--aws-red)", fontSize: 12, marginTop: 8, display: "block" }}>
                This action cannot be undone.
              </span>
            </>
          }
          confirmLabel="Delete"
          variant="danger"
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deleteRecord.id);
            setDeleteRecord(null);
          }}
          onCancel={() => setDeleteRecord(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
