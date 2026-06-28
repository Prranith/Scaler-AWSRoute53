export type RecordType = "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS" | "PTR" | "SRV" | "CAA";
export type RoutingPolicy = "Simple" | "Weighted" | "Latency" | "Failover" | "Multivalue";

export interface DNSRecord {
  id: string;
  zone_id: string;
  name: string;
  type: RecordType;
  ttl: number;
  routing_policy: RoutingPolicy;
  value: string[];
  priority: number | null;
  weight: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedRecords {
  items: DNSRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateRecordPayload {
  name: string;
  type: RecordType;
  ttl: number;
  routing_policy: RoutingPolicy;
  value: string[];
  priority?: number;
  weight?: number;
  comment?: string;
}

export interface UpdateRecordPayload {
  name?: string;
  ttl?: number;
  routing_policy?: RoutingPolicy;
  value?: string[];
  priority?: number;
  weight?: number;
  comment?: string;
}

export const RECORD_TYPES: RecordType[] = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"];
export const TTL_PRESETS = [
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "1 hour", value: 3600 },
  { label: "1 day", value: 86400 },
  { label: "Custom", value: -1 },
];
