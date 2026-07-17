import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { Avatar, Button } from "../src/components/ui";
import { useApp } from "../src/context/AppContext";
import { useT } from "../src/i18n/useT";
import { rupiah } from "../src/lib/format";
import { shareImage } from "../src/lib/share";
import { computeWrapped, PERSONA_EMOJI } from "../src/lib/stats";

const { width } = Dimensions.get("window");

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <View className="flex-1">
      <Text className="text-3xl font-black" style={{ color: tone, letterSpacing: -1 }}>
        {value}
      </Text>
      <Text className="mt-0.5 text-xs font-semibold text-white/70">{label}</Text>
    </View>
  );
}

export default function Wrapped() {
  const insets = useSafeAreaInsets();
  const { history, user } = useApp();
  const t = useT();
  const w = useMemo(() => computeWrapped(history, user), [history, user]);
  const persona = t.persona[w.persona];

  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  const onShare = async () => {
    try {
      setBusy(true);
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      await shareImage(uri);
    } catch {
      // cancelled
    } finally {
      setBusy(false);
    }
  };

  if (!w.hasData) {
    return (
      <View className="flex-1 items-center justify-center bg-ink px-8">
        <Ionicons name="bar-chart-outline" size={52} color="#9AA3AB" />
        <Text className="mt-4 text-center text-lg font-bold text-fg">{t.wrapped.notReadyTitle}</Text>
        <Text className="mt-1 text-center text-sm text-muted">{t.wrapped.notReadyDesc}</Text>
        <Button label={t.common.ok} variant="dark" className="mt-6 px-8" onPress={() => router.back()} />
      </View>
    );
  }

  // story card width ~ 9:16, fits screen
  const cardW = width - 40;

  return (
    <View className="flex-1 bg-ink">
      <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center justify-between px-5 pb-2">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Ionicons name="close" size={22} color="#303841" />
        </Pressable>
        <Text className="text-base font-bold text-fg">{t.wrapped.headerTitle}</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140, alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="my-3 text-center text-xs font-medium text-muted">{t.wrapped.scrollHint}</Text>

        {/* STORY CARD (9:16) — capture target */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View
            ref={cardRef}
            collapsable={false}
            style={{ width: cardW, height: cardW * (16 / 9) }}
            className="overflow-hidden rounded-[24px]"
          >
            <LinearGradient
              colors={["#76ABAE", "#5A8C8F", "#FF5722"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            >
              <View className="flex-1 justify-between p-6">
                {/* header */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-black text-white">Split<Text className="text-lime">In</Text></Text>
                  <View className="rounded-full bg-white/20 px-3 py-1">
                    <Text className="text-[11px] font-bold text-white">{t.wrapped.badge}</Text>
                  </View>
                </View>

                {/* persona */}
                <View>
                  <Text className="text-6xl">{PERSONA_EMOJI[w.persona]}</Text>
                  <Text className="mt-2 text-xs font-bold uppercase tracking-widest text-white/70">
                    {t.wrapped.youAre}
                  </Text>
                  <Text className="text-3xl font-black text-white" style={{ letterSpacing: -1 }}>
                    {persona.title}
                  </Text>
                  <Text className="mt-1 text-sm font-medium text-white/80">{persona.desc}</Text>
                </View>

                {/* numbers */}
                <View className="gap-4">
                  <View className="flex-row">
                    <Stat value={t.wrapped.times(w.sessions)} label={t.wrapped.sessionsLabel} tone="#FFFFFF" />
                    <Stat value={`${w.uniqueFriends}`} label={t.wrapped.friendsLabel} tone="#FFFFFF" />
                  </View>
                  <View className="rounded-xl bg-black/25 p-4">
                    <Text className="text-xs font-semibold text-white/70">{t.wrapped.totalSplitLabel}</Text>
                    <Text className="text-3xl font-black text-white" style={{ letterSpacing: -1 }}>
                      {rupiah(w.totalSpent)}
                    </Text>
                  </View>

                  {w.topFriend && (
                    <View className="flex-row items-center gap-3 rounded-xl bg-black/25 p-3">
                      <Avatar emoji={w.topFriend.emoji} color={w.topFriend.color} size={40} />
                      <View className="flex-1">
                        <Text className="text-xs font-semibold text-white/70">{t.wrapped.loyalPartner}</Text>
                        <Text className="text-base font-black text-white">
                          {t.wrapped.partnerValue(w.topFriend.name, w.topFriend.times)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {w.topMenu && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-semibold text-white/80">{t.wrapped.topMenu}</Text>
                      <Text className="text-sm font-black text-lime">{w.topMenu.name}</Text>
                    </View>
                  )}
                </View>

                <Text className="text-center text-[11px] font-medium text-white/60">{t.wrapped.madeWith}</Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* extra stats below card */}
        <View style={{ width: cardW }} className="mt-5 gap-3">
          {w.biggest && (
            <View className="flex-row items-center justify-between rounded-2xl bg-card p-4">
              <View>
                <Text className="text-xs font-semibold text-muted">{t.wrapped.biggest}</Text>
                <Text className="text-base font-bold text-fg">
                  {w.biggest.emoji} {w.biggest.title}
                </Text>
              </View>
              <Text className="text-base font-black text-pink">{rupiah(w.biggest.amount)}</Text>
            </View>
          )}
          {w.busiestMonth && (
            <View className="flex-row items-center justify-between rounded-2xl bg-card p-4">
              <Text className="text-sm font-semibold text-muted">{t.wrapped.busiest}</Text>
              <Text className="text-base font-black text-cyan">
                {t.wrapped.busiestValue(t.fmt.monthsLong[w.busiestMonth.monthIndex], w.busiestMonth.count)}
              </Text>
            </View>
          )}
          <View className="flex-row items-center justify-between rounded-2xl bg-card p-4">
            <Text className="text-sm font-semibold text-muted">{t.wrapped.avg}</Text>
            <Text className="text-base font-black text-fg">{rupiah(w.avgPerSession)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* sticky share */}
      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute bottom-0 left-0 right-0 border-t border-line bg-surface px-5 pt-3"
      >
        <Button
          label={busy ? t.common.preparing : t.wrapped.shareStory}
          loading={busy}
          icon={<Ionicons name="share-social-outline" size={18} color="#fff" />}
          onPress={onShare}
        />
      </View>
    </View>
  );
}
