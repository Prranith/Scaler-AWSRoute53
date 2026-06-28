import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recordsApi } from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";
import type { CreateRecordPayload, UpdateRecordPayload } from "@/types/record";

export const RECORDS_KEY = "records";

export function useRecords(
  zoneId: string,
  params: { page?: number; size?: number; q?: string; type?: string } = {}
) {
  return useQuery({
    queryKey: [RECORDS_KEY, zoneId, params],
    queryFn: async () => {
      const res = await recordsApi.list(zoneId, params);
      return res.data;
    },
    enabled: !!zoneId,
    staleTime: 15_000,
  });
}

export function useCreateRecord(zoneId: string) {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (data: CreateRecordPayload) => recordsApi.create(zoneId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RECORDS_KEY, zoneId] });
      qc.invalidateQueries({ queryKey: ["zones"] });
      notify.success("DNS record created");
    },
    onError: (err: any) => {
      notify.error("Failed to create record", err.response?.data?.detail);
    },
  });
}

export function useUpdateRecord(zoneId: string, recordId: string) {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (data: UpdateRecordPayload) => recordsApi.update(zoneId, recordId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RECORDS_KEY, zoneId] });
      notify.success("DNS record updated");
    },
    onError: (err: any) => {
      notify.error("Failed to update record", err.response?.data?.detail);
    },
  });
}

export function useDeleteRecord(zoneId: string) {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (recordId: string) => recordsApi.delete(zoneId, recordId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RECORDS_KEY, zoneId] });
      qc.invalidateQueries({ queryKey: ["zones"] });
      notify.success("DNS record deleted");
    },
    onError: (err: any) => {
      notify.error("Failed to delete record", err.response?.data?.detail);
    },
  });
}

export function useBulkDeleteRecords(zoneId: string) {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (ids: string[]) => recordsApi.bulkDelete(zoneId, ids),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [RECORDS_KEY, zoneId] });
      qc.invalidateQueries({ queryKey: ["zones"] });
      notify.success(`Deleted ${res.data.deleted} record(s)`);
    },
    onError: (err: any) => {
      notify.error("Bulk delete failed", err.response?.data?.detail);
    },
  });
}
