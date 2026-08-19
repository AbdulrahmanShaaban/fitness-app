import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Plus, Search, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { ClientCard } from "../../components/shared/ClientCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { useClients } from "../../lib/hooks/useClients";

export default function ClientsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 250);
  const { data: clients, isLoading } = useClients(debouncedQuery);

  return (
    <View className="flex-1 bg-ink">
      <View className="flex-row items-center gap-2 px-4 pb-3 pt-2">
        <View className="flex-1 flex-row items-center gap-2 rounded-lg border border-line bg-surface2 px-3">
          <Search size={16} color="#5C6672" />
          <TextInput
            accessibilityLabel="Search clients"
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or goal…"
            placeholderTextColor="#5C6672"
            className="flex-1 py-2.5 text-body text-base"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add new client"
          onPress={() => router.push("/client/new")}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="h-11 w-11 items-center justify-center rounded-lg bg-accent"
        >
          <Plus size={20} color="#0B0E12" />
        </Pressable>
      </View>

      <FlashList
        data={clients ?? []}
        keyExtractor={(c) => c.id}
        contentContainerClassName="px-4 pb-6"
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            icon={Users}
            title={isLoading ? "Loading…" : "No clients yet"}
            hint={
              isLoading
                ? undefined
                : debouncedQuery
                  ? "No client matches that search."
                  : "Add your first client to start logging sessions."
            }
            actionLabel={isLoading ? undefined : "Add client"}
            onAction={isLoading ? undefined : () => router.push("/client/new")}
          />
        }
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            onPress={() => router.push(`/client/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}