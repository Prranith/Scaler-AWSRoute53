export interface HostedZone {
  id: string;
  name: string;
  type: "Public" | "Private";
  comment: string | null;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedZones {
  items: HostedZone[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateZonePayload {
  name: string;
  type: "Public" | "Private";
  comment?: string;
}

export interface UpdateZonePayload {
  comment?: string;
  type?: "Public" | "Private";
}
