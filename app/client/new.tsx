import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { ClientForm, type ClientFormSubmit } from "../../components/sections/ClientForm";
import { useCreateClient } from "../../lib/hooks/useClients";

export default function NewClientScreen() {
  const router = useRouter();
  const createClient = useCreateClient();

  const handleSubmit = async (values: ClientFormSubmit) => {
    const client = await createClient.mutateAsync(values);
    router.replace(`/client/${client.id}`);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-ink"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <ClientForm submitLabel="Add client" onSubmit={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}