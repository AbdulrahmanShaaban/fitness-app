import { Tabs } from "expo-router";
import { Dumbbell, LayoutDashboard, Users } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0B0E12" },
        headerTintColor: "#E9EDF2",
        headerTitleStyle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 18 },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: "#0B0E12", borderTopColor: "#252C36" },
        tabBarActiveTintColor: "#F5A524",
        tabBarInactiveTintColor: "#5C6672",
        sceneStyle: { backgroundColor: "#0B0E12" },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerTitle: "Trainer Notebook",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}