import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

import { DbProvider } from "../components/providers/DbProvider";
import { QueryProvider } from "../components/providers/QueryProvider";
import { SyncProvider } from "../components/providers/SyncProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 items-center justify-center bg-ink">
        <ActivityIndicator size="large" color="#F5A524" />
      </View>
    );
  }

  return (
    <QueryProvider>
      <DbProvider>
        <SyncProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#0B0E12" },
              headerTintColor: "#E9EDF2",
              headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: "#0B0E12" },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="session/new" options={{ title: "New Session", headerBackTitle: "Back" }} />
            <Stack.Screen name="client/new" options={{ title: "New Client", headerBackTitle: "Back" }} />
            <Stack.Screen name="client/[id]/edit" options={{ title: "Edit Client", headerBackTitle: "Back" }} />
            <Stack.Screen name="client/[id]/session/[sessionId]" options={{ title: "Session", headerBackTitle: "Back" }} />
            <Stack.Screen name="client/[id]/assessment/new" options={{ title: "New Assessment", headerBackTitle: "Back" }} />
            <Stack.Screen name="client/[id]/assessment/[assessmentId]" options={{ title: "Assessment", headerBackTitle: "Back" }} />
            <Stack.Screen name="sign-in" options={{ title: "Backup & Sync", headerBackTitle: "Back" }} />
          </Stack>
        </SyncProvider>
      </DbProvider>
    </QueryProvider>
  );
}