import { useRouter } from "expo-router";
import { Cloud, CloudOff, LogIn, LogOut, ShieldCheck } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextField } from "../components/ui/TextField";
import { useSyncStore } from "../lib/store/syncStore";
import { getSupabase, isSyncConfigured } from "../sync/client";
import { runSync } from "../sync/engine";
import { getErrorMessage } from "../lib/utils/errors";

export default function SignInScreen() {
  const router = useRouter();
  const status = useSyncStore((s) => s.status);
  const lastSyncAt = useSyncStore((s) => s.lastSyncAt);
  const lastError = useSyncStore((s) => s.lastError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, [status]);

  const handleSignIn = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert("Sign in failed", getErrorMessage(error));
        return;
      }
      setSignedIn(true);
      await runSync();
      Alert.alert("Backup active", "Your data will sync to the cloud automatically.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setSignedIn(false);
  };

  if (!isSyncConfigured()) {
    return (
      <ScrollView className="flex-1 bg-ink" contentContainerClassName="p-4 gap-4">
        <Card className="items-center gap-2 p-6">
          <CloudOff size={32} color="#5C6672" />
          <Text className="text-body text-base font-semibold">Sync not configured</Text>
          <Text className="text-center text-muted text-[13px] leading-5">
            Create a Supabase project, run{"\n"}sync/supabase-schema.sql, then set
            EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in a .env file and restart
            the app.
          </Text>
        </Card>
        <Button label="Back" onPress={() => router.back()} variant="ghost" />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-ink" contentContainerClassName="p-4 gap-4">
      <View className="flex-row items-center gap-2">
        <View accessible={false} className="h-10 w-10 items-center justify-center rounded-lg bg-accentDim">
          <Cloud size={18} color="#F5A524" />
        </View>
        <View className="flex-1">
          <Text className="text-body text-base font-semibold">Backup & sync</Text>
          <Text className="text-faint text-[12px]">
            {signedIn ? "Signed in — cloud backup active" : "Sign in to back up your data"}
          </Text>
        </View>
        <ShieldCheck size={18} color={signedIn ? "#34D399" : "#5C6672"} />
      </View>

      {status === "syncing" ? (
        <View className="flex-row items-center gap-2 rounded-lg border border-line bg-surface2 p-3">
          <ActivityIndicator size="small" color="#F5A524" />
          <Text className="text-muted text-[13px]">Syncing changes…</Text>
        </View>
      ) : lastError ? (
        <View className="rounded-lg border border-danger/30 bg-dangerDim p-3">
          <Text className="text-danger text-[13px]">{lastError}</Text>
        </View>
      ) : lastSyncAt ? (
        <View className="flex-row items-center gap-2 rounded-lg border border-positive/30 bg-positiveDim p-3">
          <Cloud size={15} color="#34D399" />
          <Text className="text-positive text-[13px]">
            Last sync {new Date(lastSyncAt).toLocaleString()}
          </Text>
        </View>
      ) : null}

      {!signedIn ? (
        <View className="gap-3">
          <TextField
            label="Email"
            placeholder="trainer@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button
            label="Sign in"
            onPress={handleSignIn}
            icon={<LogIn size={16} color="#0B0E12" />}
            loading={loading}
          />
        </View>
      ) : (
        <View className="gap-2">
          <Button label="Sync now" onPress={() => runSync()} variant="secondary" />
          <Button label="Sign out" onPress={handleSignOut} variant="danger" icon={<LogOut size={15} color="#F87171" />} />
        </View>
      )}

      <Text className="text-faint text-[12px] leading-5">
        Your phone is the source of truth. This cloud copy is the safety net — if you lose the
        phone, sign in on a new device and the app restores everything from here.
      </Text>
    </ScrollView>
  );
}