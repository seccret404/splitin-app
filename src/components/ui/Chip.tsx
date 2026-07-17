import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      className={`rounded-full px-4 py-2 ${active ? "bg-primary" : "bg-surface"}`}
    >
      <Text className={`text-sm font-semibold ${active ? "text-white" : "text-muted"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
