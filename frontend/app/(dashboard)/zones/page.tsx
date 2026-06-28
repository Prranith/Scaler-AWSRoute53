"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useZones, useDeleteZone } from "@/hooks/useZones";
import { HostedZone } from "@/types/zone";
import { EditZoneModal } from "@/components/zones/EditZoneModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import {
  Plus, Search, RefreshCw, Trash2, Pencil, Globe, ExternalLink,
  Lock, ChevronUp, ChevronDown, Download
} from "lucide-react";
import { zonesApi } from "@/lib/api";

type SortKey = "name" | "type" | "record_count" | "created_at";
type SortDir = "asc" | "desc";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function ZonesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [editZone, setEditZone] = useState<HostedZone | null>(null);
  const [deleteZone, setDeleteZone] = useState<HostedZone | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const deleteMutation = useDeleteZone();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on search
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const { data, isLoading, refetch } = useZones({ page, size: 20, q: debouncedSearch || undefined });

  // Keyboard shortcuts
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

  // Sorting (client-side on current page)
  const zones = data?.items ?? [];
  const sorted = [...zones].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === "string"
      ? av.localeCompare(bv as string)
      : (av as number) - (bv as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map(z => z.id)));
  };

  const handleDeleteSelected = async () => {
    for (const id of selected) {
      await deleteMutation.mutateAsync(id);
    }
    setSelected(new Set());
  };

  const handleExport = async (zone: HostedZone, format: "json" | "bind") => {
    try {
      const res = await zonesApi.export(zone.id, format);
      const content = format === "json" ? JSON.stringify(res.data, null, 2) : res.data;
      const blob = new Blob([content as string], {
        type: format === "json" ? "application/json" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${zone.name.replace(/\.$/, "")}.${format === "json" ? "json" : "zone"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : null;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Hosted Zones" }]} />
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Hosted Zones</h1>
          <p className="page-subtitle">
            {data ? `${data.total} hosted zone${data.total !== 1 ? "s" : ""}` : "Manage your DNS hosted zones"}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => refetch()} title="Refresh (R)">
            <RefreshCw size={13} />
            Refresh
          </button>
          <button id="create-zone-btn" className="btn btn-primary" onClick={() => router.push("/zones/create")}>
            <Plus size={15} />
            Create hosted zone
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="card">
        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="bulk-bar">
            <span className="bulk-bar-count">{selected.size} zone(s) selected</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDeleteSelected}
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={13} />
              Delete selected
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
              Clear selection
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box">
              <Search size={14} />
              <input
                ref={searchRef}
                className="search-input"
                placeholder="Search by domain name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="table-toolbar-right">
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Press <span className="kbd">N</span> to create, <span className="kbd">?</span> for shortcuts
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
                    checked={selected.size > 0 && selected.size === sorted.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="sortable" onClick={() => toggleSort("name")}>
                  Domain Name <SortIcon k="name" />
                </th>
                <th className="sortable" onClick={() => toggleSort("type")}>
                  Type <SortIcon k="type" />
                </th>
                <th className="sortable" onClick={() => toggleSort("record_count")}>
                  Records <SortIcon k="record_count" />
                </th>
                <th>Hosted Zone ID</th>
                <th className="sortable" onClick={() => toggleSort("created_at")}>
                  Created <SortIcon k="created_at" />
                </th>
                <th>Comment</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="loading-overlay">
                      <div className="spinner spinner-lg" />
                    </div>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Globe size={48} />
                      <h3>{debouncedSearch ? "No results found" : "No hosted zones yet"}</h3>
                      <p>
                        {debouncedSearch
                          ? `No hosted zones matching "${debouncedSearch}"`
                          : "Create your first hosted zone to start managing DNS records."}
                      </p>
                      {!debouncedSearch && (
                        <button className="btn btn-primary" onClick={() => router.push("/zones/create")}>
                          <Plus size={15} />
                          Create hosted zone
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((zone) => (
                  <tr
                    key={zone.id}
                    className={selected.has(zone.id) ? "selected" : ""}
                  >
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selected.has(zone.id)}
                        onChange={() => toggleSelect(zone.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => router.push(`/zones/${zone.id}`)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-link)",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 13,
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {zone.name}
                        <ExternalLink size={11} style={{ opacity: 0.5 }} />
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${zone.type === "Public" ? "badge-info" : "badge-neutral"}`}>
                        {zone.type === "Public"
                          ? <><Globe size={10} /> Public</>
                          : <><Lock size={10} /> Private</>
                        }
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{zone.record_count}</span>
                    </td>
                    <td>
                      <code className="mono">{zone.id}</code>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                      {new Date(zone.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12, maxWidth: 200 }}>
                      <span className="truncate" style={{ display: "block" }}>
                        {zone.comment || "—"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleExport(zone, "json")}
                          data-tooltip="Export JSON"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditZone(zone)}
                          data-tooltip="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteZone(zone)}
                          data-tooltip="Delete"
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

        {/* Pagination */}
        {data && data.pages > 1 && (
          <Pagination
            page={page}
            pages={data.pages}
            total={data.total}
            size={20}
            onPage={setPage}
          />
        )}
      </div>

      {/* Modals */}
      {editZone && <EditZoneModal zone={editZone} onClose={() => setEditZone(null)} />}
      {deleteZone && (
        <ConfirmDialog
          title="Delete hosted zone"
          message={
            <>
              Are you sure you want to delete <strong>{deleteZone.name}</strong>?
              <br />
              <span style={{ color: "var(--aws-red)", fontSize: 12, marginTop: 8, display: "block" }}>
                This will permanently delete all {deleteZone.record_count} DNS records in this zone. This action cannot be undone.
              </span>
            </>
          }
          confirmLabel="Delete"
          variant="danger"
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deleteZone.id);
            setDeleteZone(null);
          }}
          onCancel={() => setDeleteZone(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
