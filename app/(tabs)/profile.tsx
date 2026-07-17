import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Button, Card, Chip, Field } from "../../src/components/ui";
import { useApp } from "../../src/context/AppContext";
import { useFmt, useT } from "../../src/i18n/useT";
import type { Lang } from "../../src/i18n/translations";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "../../src/data/avatars";
import { rupiah } from "../../src/lib/format";
import type { PayApp } from "../../src/types";

const PAY_APPS: PayApp[] = ["QRIS", "GoPay", "OVO", "Dana", "ShopeePay", "Transfer"];
const LANGS: { code: Lang; label: string }[] = [
  { code: "id", label: "🇮🇩 Indonesia" },
  { code: "en", label: "🇬🇧 English" },
];

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user, history, lang, setLang, updateUser, signOut, wipeHistory } = useApp();
  const t = useT();
  const fmt = useFmt();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [emoji, setEmoji] = useState(user?.emoji ?? AVATAR_EMOJIS[0]);
  const [color, setColor] = useState(user?.color ?? AVATAR_COLORS[0]);
  const [payApp, setPayApp] = useState<PayApp>(user?.payApp ?? "GoPay");
  const [payNumber, setPayNumber] = useState(user?.payNumber ?? "");

  const totalSplit = history.reduce((s, b) => s + b.total, 0);
  const totalPeople = new Set(history.flatMap((b) => b.diners.map((d) => d.name))).size;

  const saveProfile = async () => {
    if (name.trim().length < 2) return;
    await updateUser({ name: name.trim(), emoji, color, payApp, payNumber: payNumber.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const confirmSignOut = () => {
    Alert.alert(t.profile.signOutTitle, t.profile.signOutBody, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.profile.signOut.replace("🚪 ", ""),
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const confirmWipe = () => {
    Alert.alert(t.profile.clearTitle, t.profile.clearBody, [
      { text: t.common.cancel, style: "cancel" },
      { text: t.profile.clearConfirm, style: "destructive", onPress: () => wipeHistory() },
    ]);
  };

  return (
    <View className="flex-1 bg-ink">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-black text-fg" style={{ letterSpacing: -0.5 }}>
          {t.profile.title}
        </Text>

        {/* profile card */}
        <Animated.View entering={FadeInDown.duration(450)} className="mt-5">
          <Card className="items-center py-7">
            <Avatar emoji={emoji} color={color} size={92} />
            {editing ? (
              <Field
                value={name}
                onChangeText={setName}
                placeholder={t.profile.namePlaceholder}
                className="mt-4 w-48 text-center"
                maxLength={20}
              />
            ) : (
              <Text className="mt-4 text-2xl font-black text-fg">{user?.name}</Text>
            )}
            <Text className="mt-1 text-xs text-muted">
              {t.profile.memberSince(user ? fmt.formatDate(user.createdAt) : "-")}
            </Text>

            {editing && (
              <>
                <View className="mt-5 flex-row flex-wrap justify-center gap-2 px-2">
                  {AVATAR_EMOJIS.map((e) => (
                    <Pressable
                      key={e}
                      onPress={() => setEmoji(e)}
                      className={`h-10 w-10 items-center justify-center rounded-xl border ${
                        emoji === e ? "border-primary bg-primary/20" : "border-line bg-surface"
                      }`}
                    >
                      <Text className="text-lg">{e}</Text>
                    </Pressable>
                  ))}
                </View>
                <View className="mt-3 flex-row flex-wrap justify-center gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`h-9 w-9 rounded-xl ${color === c ? "border-4 border-fg" : "border border-line"}`}
                    />
                  ))}
                </View>

                {/* payment info for nagih */}
                <Text className="mb-2 mt-6 self-start text-sm font-bold text-fg">{t.profile.payTitle}</Text>
                <Text className="mb-2 self-start text-[11px] text-muted">{t.profile.paySub}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {PAY_APPS.map((p) => (
                    <Chip key={p} label={p} active={payApp === p} onPress={() => setPayApp(p)} />
                  ))}
                </View>
                <Field
                  value={payNumber}
                  onChangeText={setPayNumber}
                  placeholder={t.profile.payPlaceholder}
                  className="mt-3 w-full"
                  keyboardType="default"
                />
              </>
            )}

            {!editing && user?.payNumber ? (
              <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-surface px-4 py-2">
                <Ionicons name="card-outline" size={16} color="#303841" />
                <Text className="text-sm font-semibold text-fg">
                  {user.payApp} · {user.payNumber}
                </Text>
              </View>
            ) : null}

            <View className="mt-5 w-full px-2">
              {editing ? (
                <View className="flex-row gap-2">
                  <Button label={t.common.cancel} variant="dark" className="flex-1" onPress={() => setEditing(false)} />
                  <Button label={t.common.save} variant="lime" className="flex-1" onPress={saveProfile} />
                </View>
              ) : (
                <Button
                  label={t.profile.editProfile}
                  variant="dark"
                  icon={<Ionicons name="create-outline" size={18} color="#303841" />}
                  onPress={() => setEditing(true)}
                />
              )}
            </View>
          </Card>
        </Animated.View>

        {/* stats */}
        <Animated.View entering={FadeInDown.delay(120).duration(450)} className="mt-4 flex-row gap-3">
          <Card className="flex-1 items-center py-5 bg-primary/10">
            <Text className="text-2xl font-black text-primary">{history.length}</Text>
            <Text className="mt-1 text-[11px] font-semibold text-primary">{t.profile.totalSplit}</Text>
          </Card>
          <Card className="flex-1 items-center py-5 bg-accent/10">
            <Text className="text-2xl font-black text-accent">{totalPeople}</Text>
            <Text className="mt-1 text-[11px] font-semibold text-accent">{t.profile.friends}</Text>
          </Card>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(180).duration(450)} className="mt-3">
          <Card className="flex-row items-center justify-between bg-fg">
            <Text className="text-sm font-semibold text-white/70">{t.profile.totalMoney}</Text>
            <Text className="text-lg font-black text-white">{rupiah(totalSplit)}</Text>
          </Card>
        </Animated.View>

        {/* wrapped CTA */}
        {history.length > 0 && (
          <Animated.View entering={FadeInDown.delay(220).duration(450)} className="mt-3">
            <Pressable onPress={() => router.push("/wrapped")} className="overflow-hidden rounded-2xl">
              <LinearGradient colors={["#76ABAE", "#FF5722"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View className="flex-row items-center justify-between p-5">
                  <View>
                    <Text className="text-lg font-black text-white">{t.profile.wrappedTitle}</Text>
                    <Text className="text-xs font-medium text-white/80">{t.profile.wrappedSub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#fff" />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* language */}
        <Animated.View entering={FadeInDown.delay(260).duration(450)} className="mt-4">
          <Card>
            <Text className="mb-3 text-sm font-bold text-fg">{t.profile.language}</Text>
            <View className="flex-row gap-2">
              {LANGS.map((l) => (
                <Chip key={l.code} label={l.label} active={lang === l.code} onPress={() => setLang(l.code)} />
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* danger zone */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)} className="mt-4 gap-3">
          <Button
            label={t.profile.clearHistory}
            variant="ghost"
            icon={<Ionicons name="trash-outline" size={17} color="#6B7580" />}
            onPress={confirmWipe}
          />
          <Button
            label={t.profile.signOut}
            variant="ghost"
            icon={<Ionicons name="log-out-outline" size={17} color="#6B7580" />}
            onPress={confirmSignOut}
          />
        </Animated.View>

        <Text className="mt-8 text-center text-[11px] text-muted">{t.profile.version}</Text>
        <Text className="mt-1 text-center text-[11px] text-muted">{t.profile.madeFor}</Text>
      </ScrollView>
    </View>
  );
}
