import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Card } from "../../src/components/ui";
import { useApp } from "../../src/context/AppContext";
import { useFmt, useT } from "../../src/i18n/useT";
import { rupiah } from "../../src/lib/format";

export default function Home() {
  const insets = useSafeAreaInsets();
  const { user, history } = useApp();
  const t = useT();
  const fmt = useFmt();

  const h = new Date().getHours();
  const greeting =
    h < 11 ? t.home.greetingMorning : h < 15 ? t.home.greetingNoon : h < 19 ? t.home.greetingAfternoon : t.home.greetingNight;

  const totalSplit = history.reduce((s, b) => s + b.total, 0);
  const recent = history.slice(0, 3);

  return (
    <View className="flex-1 bg-ink">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <Animated.View entering={FadeInDown.duration(450)} className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-medium text-muted">{t.home.hello(greeting)}</Text>
            <Text className="text-2xl font-black text-fg" style={{ letterSpacing: -0.5 }}>
              {user?.name ?? t.home.friend} {user?.emoji}
            </Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/profile")}>
            <Avatar emoji={user?.emoji ?? "😎"} color={user?.color ?? "#76ABAE"} size={48} />
          </Pressable>
        </Animated.View>

        {/* hero CTA */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mt-6">
          <Pressable onPress={() => router.push("/split")} className="overflow-hidden rounded-2xl">
            <LinearGradient colors={["#76ABAE", "#FF5722"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View className="p-6">
                <Text className="text-3xl">🧾</Text>
                <Text className="mt-3 text-2xl font-black text-white" style={{ letterSpacing: -0.5 }}>
                  {t.home.heroTitle}
                </Text>
                <Text className="mt-1 text-sm font-medium text-white/80">
                  {t.home.heroSubtitle}
                </Text>
                <View className="mt-4 self-start rounded-full bg-white/20 px-4 py-2">
                  <Text className="text-sm font-bold text-white">{t.home.heroCta}</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* stats */}
        <Animated.View entering={FadeInDown.delay(180).duration(500)} className="mt-4 flex-row gap-3">
          <Card className="flex-1 bg-primary/10">
            <Text className="text-xs font-semibold text-primary">{t.home.totalSplit}</Text>
            <Text className="mt-1 text-xl font-black text-primary">{rupiah(totalSplit)}</Text>
          </Card>
          <Card className="flex-1 bg-accent/10">
            <Text className="text-xs font-semibold text-accent">{t.home.sessions}</Text>
            <Text className="mt-1 text-xl font-black text-accent">{history.length}×</Text>
          </Card>
        </Animated.View>

        {/* recent */}
        <Animated.View entering={FadeInDown.delay(260).duration(500)} className="mt-7">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-fg">{t.home.recent}</Text>
            {history.length > 3 && (
              <Pressable onPress={() => router.push("/(tabs)/history")}>
                <Text className="text-sm font-semibold text-primary">{t.home.seeAll}</Text>
              </Pressable>
            )}
          </View>

          {recent.length === 0 ? (
            <Card className="items-center py-10">
              <Ionicons name="receipt-outline" size={44} color="#9AA3AB" />
              <Text className="mt-3 text-base font-bold text-fg">{t.home.emptyTitle}</Text>
              <Text className="mt-1 text-center text-sm text-muted">{t.home.emptyDesc}</Text>
            </Card>
          ) : (
            recent.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => router.push({ pathname: "/result", params: { id: b.id } })}
                className="mb-3"
              >
                <Card className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-surface">
                      <Text className="text-xl">{b.emoji}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-bold text-fg">{b.title}</Text>
                      <Text className="text-xs text-muted">
                        {t.home.people(b.diners.length)} · {fmt.relativeTime(b.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-black text-fg">{rupiah(b.total)}</Text>
                </Card>
              </Pressable>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
