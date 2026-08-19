import { type ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { ensureMigrations } from "../../db/migrate";
import { ensureSeed } from "../../db/seed";

export function DbProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureMigrations();
        await ensureSeed();
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-ink px-8">
        <Text className="text-body text-base">Database error: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-ink">
        <ActivityIndicator size="large" color="#F5A524" />
      </View>
    );
  }

  return children;
}