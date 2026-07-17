import { Text, View } from "react-native";

export function Pill({ text, tone = "lime" }: { text: string; tone?: "lime" | "pink" | "cyan" }) {
  const map = { lime: "bg-lime/20 text-lime", pink: "bg-pink/20 text-pink", cyan: "bg-cyan/20 text-cyan" };
  return (
    <View className={`self-start rounded-full px-3 py-1 ${map[tone].split(" ")[0]}`}>
      <Text className={`text-xs font-bold ${map[tone].split(" ")[1]}`}>{text}</Text>
    </View>
  );
}
