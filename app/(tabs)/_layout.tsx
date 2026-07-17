import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useT } from "../../src/i18n/useT";

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  name,
  label,
  focused,
}: {
  name: IoniconName;
  label: string;
  focused: boolean;
}) {
  const color = focused ? "#76ABAE" : "#9AA3AB";
  return (
    <View className="items-center justify-center" style={{ width: 72 }}>
      <Ionicons name={name} size={23} color={color} />
      <Text
        className={`mt-1 text-[11px] ${focused ? "font-bold text-primary" : "font-medium text-muted"}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#DDE2E5",
          borderTopWidth: 1,
          height: 84,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "calculator" : "calculator-outline"} label={t.tabs.split} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tagih"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "cash" : "cash-outline"} label={t.tabs.collect} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "time" : "time-outline"} label={t.tabs.history} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "person-circle" : "person-circle-outline"} label={t.tabs.profile} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
