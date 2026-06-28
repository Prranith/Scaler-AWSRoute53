import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zonesApi } from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";
import type { CreateZonePayload, UpdateZonePayload } from "@/types/zone";

export const ZONES_KEY = "zones";

export function useZones(params: { page?: number; size?: number; q?: string } = {}) {
  return useQuery({
    queryKey: [ZONES_KEY, params],
    queryFn: async () => {
      const res = await zonesApi.list(params);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useZone(zoneId: string) {
  return useQuery({
    queryKey: [ZONES_KEY, zoneId],
    queryFn: async () => {
      const res = await zonesApi.get(zoneId);
      return res.data;
    },
    enabled: !!zoneId,
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (data: CreateZonePayload) => zonesApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [ZONES_KEY] });
      notify.success("Hosted zone created", res.data.name);
    },
    onError: (err: any) => {
      notify.error("Failed to create zone", err.response?.data?.detail);
    },
  });
}

export function useUpdateZone(zoneId: string) {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (data: UpdateZonePayload) => zonesApi.update(zoneId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ZONES_KEY] });
      notify.success("Hosted zone updated");
    },
    onError: (err: any) => {
      notify.error("Failed to update zone", err.response?.data?.detail);
    },
  });
}

export function useDeleteZone() {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (zoneId: string) => zonesApi.delete(zoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ZONES_KEY] });
      notify.success("Hosted zone deleted");
    },
    onError: (err: any) => {
      notify.error("Failed to delete zone", err.response?.data?.detail);
    },
  });
}
