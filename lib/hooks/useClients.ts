import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  countClients,
  createClient,
  getClient,
  listClientsWithStats,
  searchClients,
  softDeleteClient,
  updateClient,
} from "../../repositories/clients.repo";
import { countAssessments } from "../../repositories/assessments.repo";
import type { ClientWithStats, NewClient } from "../../types";

const KEY = "clients";

export function useClients(search: string) {
  return useQuery({
    queryKey: [KEY, "stats", search],
    queryFn: async () => {
      if (search.trim().length === 0) return listClientsWithStats();
      const rows = await searchClients(search);
      return rows.map((r) => ({
        ...r,
        sessionCount: 0,
      })) as ClientWithStats[];
    },
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => getClient(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<NewClient, "id" | "createdAt" | "updatedAt" | "isDeleted">) =>
      createClient(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Parameters<typeof updateClient>[1];
    }) => updateClient(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteClient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const [clientCount, assessmentCount] = await Promise.all([
        countClients(),
        countAssessments(),
      ]);
      return { clientCount, assessmentCount };
    },
  });
}