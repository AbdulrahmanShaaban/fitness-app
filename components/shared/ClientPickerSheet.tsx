import { Search, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useClients } from "@/lib/hooks/useClients";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

interface ClientPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onPick: (clientId: string) => void;
  title?: string;
  onAddNew?: () => void;
}

export function ClientPickerSheet({
  visible,
  onClose,
  onPick,
  title = "Pick a client",
  onAddNew,
}: ClientPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const { data: clients, isLoading } = useClients(query);

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View className="px-4 pb-2">
        <View className="flex-row items-center gap-2 rounded-lg border border-line bg-surface2 px-3">
          <Search size={16} color="#5C6672" />
          <TextInput
            accessibilityLabel="Search clients"
            value={query}
            onChangeText={setQuery}
            placeholder="Search clients…"
            placeholderTextColor="#5C6672"
            className="flex-1 py-2.5 text-body text-base"
          />
        </View>
      </View>
      <FlatList
        data={clients ?? []}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        style={{ maxHeight: 360 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        ListEmptyComponent={
          isLoading ? (
            <View className="py-8 items-center">
              <Text className="text-faint">Loading…</Text>
            </View>
          ) : (
            <EmptyState
              icon={UserPlus}
              title="No clients found"
              hint="Add a client first, then start logging sessions."
              actionLabel="Add client"
              onAction={onAddNew}
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Pick ${item.fullName}`}
            onPress={() => onPick(item.id)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="rounded-lg border border-line bg-surface2 px-3.5 py-3"
          >
            <Text className="text-body text-[15px] font-medium">{item.fullName}</Text>
            {item.goal ? <Text className="text-faint text-[12px]">{item.goal}</Text> : null}
          </Pressable>
        )}
      />
      <View className="px-4 pt-2" style={{ paddingBottom: insets.bottom }}>
        <Button label="Close" onPress={onClose} variant="ghost" />
      </View>
    </Sheet>
  );
}