import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { ClientForm, type ClientFormSubmit } from "@/components/sections/ClientForm";
import { useClient, useUpdateClient } from "@/lib/hooks/useClients";

export default function EditClientScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: client } = useClient(id);
  const updateClient = useUpdateClient();

  const handleSubmit = async (values: ClientFormSubmit) => {
    await updateClient.mutateAsync({ id, patch: values });
    router.back();
  };

  if (!client) return null;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-ink"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <ClientForm
          key={client.id}
          initial={client}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}