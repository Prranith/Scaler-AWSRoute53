import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    console.log("[API Interceptor] URL:", config.url, "Found Token:", token ? token.substring(0, 15) + "..." : "null");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[API Interceptor] No token found in localStorage for URL:", config.url);
    }
  }
  return config;
});

// Handle 401 globally — redirect to login (but NOT when login/register itself fails)
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");
    const alreadyOnLogin = typeof window !== "undefined" && window.location.pathname === "/login";

    if (error.response?.status === 401 && !isAuthEndpoint && !alreadyOnLogin && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post("/auth/login", { username, password }),
  register: (username: string, email: string, password: string) =>
    apiClient.post("/auth/register", { username, email, password }),
  logout: () => apiClient.post("/auth/logout"),
  me: () => apiClient.get("/auth/me"),
};

// Zones API
export const zonesApi = {
  list: (params: { page?: number; size?: number; q?: string } = {}) =>
    apiClient.get("/zones", { params }),
  get: (zoneId: string) => apiClient.get(`/zones/${zoneId}`),
  create: (data: object) => apiClient.post("/zones", data),
  update: (zoneId: string, data: object) => apiClient.put(`/zones/${zoneId}`, data),
  delete: (zoneId: string) => apiClient.delete(`/zones/${zoneId}`),
  export: (zoneId: string, format: "json" | "bind" = "json") =>
    apiClient.get(`/zones/${zoneId}/export`, { params: { format }, responseType: format === "bind" ? "text" : "json" }),
};

// Records API
export const recordsApi = {
  list: (zoneId: string, params: { page?: number; size?: number; q?: string; type?: string } = {}) =>
    apiClient.get(`/zones/${zoneId}/records`, { params }),
  get: (zoneId: string, recordId: string) =>
    apiClient.get(`/zones/${zoneId}/records/${recordId}`),
  create: (zoneId: string, data: object) =>
    apiClient.post(`/zones/${zoneId}/records`, data),
  update: (zoneId: string, recordId: string, data: object) =>
    apiClient.put(`/zones/${zoneId}/records/${recordId}`, data),
  delete: (zoneId: string, recordId: string) =>
    apiClient.delete(`/zones/${zoneId}/records/${recordId}`),
  bulkDelete: (zoneId: string, ids: string[]) =>
    apiClient.post(`/zones/${zoneId}/records/bulk-delete`, { ids }),
  import: (zoneId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post(`/zones/${zoneId}/records/import`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
