import { create } from "zustand";

export type SyncStatus =
  | "disabled"
  | "signed-out"
  | "idle"
  | "syncing"
  | "synced"
  | "error";

interface SyncState {
  status: SyncStatus;
  lastSyncAt: string | null;
  lastError: string | null;
  setStatus: (status: SyncStatus) => void;
  setLastSyncAt: (iso: string) => void;
  setLastError: (message: string | null) => void;
  reset: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: "disabled",
  lastSyncAt: null,
  lastError: null,
  setStatus: (status) => set({ status }),
  setLastSyncAt: (iso) => set({ lastSyncAt: iso }),
  setLastError: (message) => set({ lastError: message }),
  reset: () => set({ status: "idle", lastSyncAt: null, lastError: null }),
}));