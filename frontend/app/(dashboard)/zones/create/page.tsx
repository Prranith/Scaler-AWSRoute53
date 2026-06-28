"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateZone } from "@/hooks/useZones";
import { Info, X, MapPin, Layers, Server } from "lucide-react";
import Link from "next/link";

interface VPCAssociation {
  region: string;
  vpcId: string;
}

export default function CreateZonePage() {
  const router = useRouter();
  const createMutation = useCreateZone();

  // Form State
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [type, setType] = useState<"Public" | "Private">("Public");
  const [nameError, setNameError] = useState("");

  // VPC Association State (only for Private zones)
  const [showVpcAlert, setShowVpcAlert] = useState(true);
  const [vpcList, setVpcList] = useState<VPCAssociation[]>([
    { region: "", vpcId: "" }
  ]);

  const validateDomain = (val: string) => {
    const v = val.trim().replace(/\.$/, "");
    if (!v) return "Domain name is required";
    if (!/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/.test(v)) {
      return "Enter a valid domain name (e.g. example.com)";
    }
    return "";
  };

  const handleAddVpc = () => {
    setVpcList([...vpcList, { region: "", vpcId: "" }]);
  };

  const handleRemoveVpc = (index: number) => {
    setVpcList(vpcList.filter((_, idx) => idx !== index));
  };

  const handleVpcChange = (index: number, field: keyof VPCAssociation, value: string) => {
    const updated = [...vpcList];
    updated[index][field] = value;
    setVpcList(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateDomain(name);
    if (err) {
      setNameError(err);
      return;
    }
    setNameError("");

    await createMutation.mutateAsync({
      name: name.trim(),
      type,
      comment: comment.trim() || undefined,
    });
    
    router.push("/zones");
  };

  return (
    <div>
      {/* AWS Breadcrumbs */}
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
        <Link href="/dashboard" style={{ color: "var(--text-link)", textDecoration: "none" }}>Route 53</Link>
        <span style={{ margin: "0 6px" }}>&gt;</span>
        <Link href="/zones" style={{ color: "var(--text-link)", textDecoration: "none" }}>Hosted zones</Link>
        <span style={{ margin: "0 6px" }}>&gt;</span>
        <span style={{ color: "var(--text-muted)" }}>Create hosted zone</span>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 24, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            Create hosted zone
            <span style={{ fontSize: 13, color: "var(--text-link)", fontWeight: 400, cursor: "pointer" }}>Info</span>
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card 1: Hosted Zone Configuration */}
        <div className="card" style={{ marginBottom: 24, padding: 0 }}>
          <div className="card-header" style={{ padding: "16px 20px" }}>
            <span className="card-title" style={{ fontSize: 16, fontWeight: 700 }}>Hosted zone configuration</span>
          </div>
          <div className="card-body" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.
            </p>

            {/* Field: Domain Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                Domain name
                <span style={{ fontSize: 12, color: "var(--text-link)", fontWeight: 400, cursor: "pointer" }}>Info</span>
              </label>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
                This is the name of the domain that you want to route traffic for.
              </div>
              <input
                className={`form-control ${nameError ? "error" : ""}`}
                type="text"
                placeholder="example.com"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
                autoFocus
                style={{ width: "100%", maxWidth: "800px", height: "34px", padding: "6px 12px", border: "1px solid var(--border-color)", borderRadius: "4px" }}
              />
              {nameError && <div className="form-error" style={{ color: "var(--aws-red)", fontSize: 12, marginTop: 4 }}>{nameError}</div>}
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                Valid characters: a-z, 0-9, ! &quot; # $ % &amp; &apos; ( ) * + , - / : ; &lt; = &gt; ? @ [ \ ] ^ _ ` &#123; | &#125; . ~
              </div>
            </div>

            {/* Field: Description */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                Description - <i>optional</i>
                <span style={{ fontSize: 12, color: "var(--text-link)", fontWeight: 400, cursor: "pointer" }}>Info</span>
              </label>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
                This value lets you distinguish hosted zones that have the same name.
              </div>
              <textarea
                className="form-control"
                placeholder="The hosted zone is used for..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={256}
                style={{ width: "100%", maxWidth: "800px", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "4px" }}
              />
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                The description can have up to 256 characters. {comment.length}/256
              </div>
            </div>

            {/* Field: Type (Visual boxes) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                Type
                <span style={{ fontSize: 12, color: "var(--text-link)", fontWeight: 400, cursor: "pointer" }}>Info</span>
              </label>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
                The type indicates whether you want to route traffic on the internet or in an Amazon VPC.
              </div>
              
              <div style={{ display: "flex", gap: 16, maxWidth: "800px", flexWrap: "wrap" }}>
                {(["Public", "Private"] as const).map((t) => (
                  <label
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: "pointer",
                      padding: "16px",
                      border: `2px solid ${type === t ? "var(--aws-blue)" : "var(--border-color)"}`,
                      borderRadius: 6,
                      flex: 1,
                      minWidth: "250px",
                      background: type === t ? "var(--aws-blue-light)" : "transparent",
                      transition: "all 150ms",
                    }}
                  >
                    <input
                      type="radio"
                      value={t}
                      checked={type === t}
                      onChange={() => setType(t)}
                      style={{ accentColor: "var(--aws-blue)", marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                        {t === "Public" ? "Public hosted zone" : "Private hosted zone"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {t === "Public"
                          ? "A public hosted zone determines how traffic is routed on the internet."
                          : "A private hosted zone determines how traffic is routed within an Amazon VPC."
                        }
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: VPCs to associate (only shown when Private hosted zone is selected) */}
        {type === "Private" && (
          <div className="card" style={{ marginBottom: 24, padding: 0 }}>
            <div className="card-header" style={{ padding: "16px 20px" }}>
              <span className="card-title" style={{ fontSize: 16, fontWeight: 700 }}>
                VPCs to associate with the hosted zone
                <span style={{ fontSize: 12, color: "var(--text-link)", fontWeight: 400, marginLeft: 8, cursor: "pointer" }}>Info</span>
              </span>
            </div>
            <div className="card-body" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                To use this hosted zone to resolve DNS queries for one or more VPCs, choose the VPCs. To associate a VPC with a hosted zone when the VPC was created using a different AWS account, you must use a programmatic method, such as the AWS CLI.
              </p>

              {/* Closable VPC Info Banner */}
              {showVpcAlert && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: "4px",
                    border: "1px solid rgba(52, 152, 219, 0.25)",
                    backgroundColor: "rgba(52, 152, 219, 0.05)",
                    position: "relative",
                  }}
                >
                  <Info size={16} style={{ color: "#3498db", marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", paddingRight: 24, lineHeight: 1.5 }}>
                    For each VPC that you associate with a private hosted zone, you must set the Amazon VPC settings <strong>enableDnsHostnames</strong> and <strong>enableDnsSupport</strong> to <strong>true</strong>.
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVpcAlert(false)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "none",
                      border: "none",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Dynamic VPC Grid List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                {vpcList.map((vpc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 12,
                      flexWrap: "wrap",
                      maxWidth: "800px",
                    }}
                  >
                    {/* Region Selector */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
                        Region
                        <span style={{ fontSize: 11, color: "var(--text-link)", marginLeft: 6, fontWeight: 400, cursor: "pointer" }}>Info</span>
                      </label>
                      <select
                        className="filter-select"
                        value={vpc.region}
                        onChange={(e) => handleVpcChange(idx, "region", e.target.value)}
                        style={{ width: "100%", height: "34px", padding: "0 10px", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 4, color: "var(--text-primary)" }}
                      >
                        <option value="">Choose region</option>
                        <option value="us-east-1">US East (N. Virginia)</option>
                        <option value="us-west-2">US West (Oregon)</option>
                        <option value="eu-west-1">Europe (Ireland)</option>
                        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                      </select>
                    </div>

                    {/* VPC ID Selector */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
                        VPC ID
                        <span style={{ fontSize: 11, color: "var(--text-link)", marginLeft: 6, fontWeight: 400, cursor: "pointer" }}>Info</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Choose VPC (e.g. vpc-08e13f41)"
                        value={vpc.vpcId}
                        onChange={(e) => handleVpcChange(idx, "vpcId", e.target.value)}
                        style={{ width: "100%", height: "34px", padding: "6px 12px", border: "1px solid var(--border-color)", borderRadius: "4px" }}
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveVpc(idx)}
                      disabled={vpcList.length === 1}
                      className="btn btn-secondary"
                      style={{
                        height: "34px",
                        padding: "0 16px",
                        border: "1px solid var(--border-color)",
                        background: "transparent",
                        color: vpcList.length === 1 ? "var(--text-muted)" : "var(--text-primary)",
                      }}
                    >
                      Remove VPC
                    </button>
                  </div>
                ))}
              </div>

              {/* Add VPC Button */}
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleAddVpc}
                  className="btn btn-secondary"
                  style={{
                    height: "34px",
                    padding: "0 16px",
                    border: "1px solid var(--border-color)",
                    background: "transparent",
                    color: "var(--text-primary)",
                  }}
                >
                  Add VPC
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Form Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
            borderTop: "1px solid var(--border-color)",
            paddingTop: 20,
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push("/zones")}
            style={{ padding: "8px 24px" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createMutation.isPending}
            style={{ padding: "8px 24px" }}
          >
            {createMutation.isPending ? "Creating..." : "Create hosted zone"}
          </button>
        </div>
      </form>
    </div>
  );
}
