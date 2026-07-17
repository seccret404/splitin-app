import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Pressable, PressableProps, Text, View } from "react-native";
import { BRAND_GRADIENT } from "./gradients";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "lime" | "ghost" | "dark";
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

export function Button({
  label,
  variant = "primary",
  loading,
  icon,
  className = "",
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const handlePress: PressableProps["onPress"] = (e) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress?.(e);
  };

  const isGradient = variant === "primary";
  const base = "flex-row items-center justify-center rounded-xl py-4 px-5";
  const textColor =
    variant === "lime" || variant === "primary"
      ? "text-white" // on orange / gradient
      : variant === "ghost"
      ? "text-muted"
      : "text-fg"; // dark variant: dark text on light surface
  const inner = (
    <View className="flex-row items-center justify-center gap-2">
      {loading ? (
        <ActivityIndicator color={variant === "lime" || variant === "primary" ? "#fff" : "#303841"} />
      ) : (
        <>
          {icon}
          <Text className={`text-base font-bold ${textColor}`}>{label}</Text>
        </>
      )}
    </View>
  );

  if (isGradient) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={`overflow-hidden rounded-xl ${disabled ? "opacity-40" : ""} ${className}`}
        {...rest}
      >
        <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View className={base}>{inner}</View>
        </LinearGradient>
      </Pressable>
    );
  }

  const bg =
    variant === "lime" ? "bg-lime" : variant === "dark" ? "bg-surface" : "bg-transparent";

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${base} ${bg} ${disabled ? "opacity-40" : ""} ${className}`}
      {...rest}
    >
      {inner}
    </Pressable>
  );
}
