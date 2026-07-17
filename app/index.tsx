import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useApp } from "../src/context/AppContext";
import { useT } from "../src/i18n/useT";

export default function Splash() {
  const { ready, user } = useApp();
  const t = useT();

  const scale = useSharedValue(0.7);
  const float = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 500, easing: Easing.out(Easing.exp) }),
      withTiming(1, { duration: 250 })
    );
    float.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      router.replace(user ? "/(tabs)" : "/onboarding");
    }, 1600);
    return () => clearTimeout(t);
  }, [ready, user]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));

  return (
    <View className="flex-1 bg-ink">
      <LinearGradient
        colors={["#76ABAE", "#5A8C8F", "#303841"]}
        className="flex-1 items-center justify-center"
      >
        {/* floating decoration */}
        <Animated.View style={floatStyle} className="absolute top-32 left-10 opacity-80">
          <Text className="text-4xl">🧾</Text>
        </Animated.View>
        <Animated.View style={floatStyle} className="absolute bottom-40 right-12 opacity-80">
          <Text className="text-4xl">🤝</Text>
        </Animated.View>
        <Animated.View style={floatStyle} className="absolute top-44 right-16 opacity-60">
          <Text className="text-2xl">💸</Text>
        </Animated.View>

        <Animated.View style={logoStyle} className="items-center">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-[20px] bg-white">
            <Text className="text-5xl">🧾</Text>
          </View>
          <Text className="mt-5 text-5xl font-black text-white" style={{ letterSpacing: -1.5 }}>
            Split<Text className="text-lime">In</Text>
          </Text>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(400).duration(600)}
          className="mt-3 text-base font-medium text-white/85"
        >
          {t.splash.tagline}
        </Animated.Text>

        <Animated.View
          entering={FadeIn.delay(900).duration(800)}
          className="absolute bottom-14"
        >
          <Text className="text-xs font-medium text-white/70">{t.splash.footer}</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}
