import { type ReactNode, useEffect } from "react";
import { AppState } from "react-native";

import { useSyncStore } from "../../lib/store/syncStore";
import { getSupabase, isSyncConfigured } from "../../sync/client";
import { isSignedIn, runSync } from "../../sync/engine";

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

export function SyncProvider({ children }: { children: ReactNode }) {
  const setStatus = useSyncStore((s) => s.setStatus);

  useEffect(() => {
    if (!isSyncConfigured()) {
      setStatus("disabled");
      return;
    }

    let interval: ReturnType<typeof setInterval> | null = null;

    const refreshStatus = async () => {
      const signedIn = await isSignedIn();
      setStatus(signedIn ? "idle" : "signed-out");
      if (signedIn) void runSync();
    };

    void refreshStatus();
    interval = setInterval(refreshStatus, SYNC_INTERVAL_MS);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshStatus();
    });

    return () => {
      if (interval) clearInterval(interval);
      sub.remove();
    };
  }, [setStatus]);

  return <>{children}</>;
}

export { getSupabase };