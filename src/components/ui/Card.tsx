import { View, ViewProps } from "react-native";

export function Card({ className = "", children, ...rest }: ViewProps & { className?: string }) {
  return (
    <View className={`rounded-2xl bg-card p-4 ${className}`} {...rest}>
      {children}
    </View>
  );
}
