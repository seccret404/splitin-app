import { Text, View } from "react-native";

export function Avatar({
  emoji,
  color,
  size = 44,
}: {
  emoji: string;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={{ width: size, height: size, backgroundColor: color + "33", borderColor: color }}
      className="items-center justify-center rounded-full border-2"
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}
