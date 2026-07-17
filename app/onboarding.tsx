import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Button, Field } from "../src/components/ui";
import { useApp } from "../src/context/AppContext";
import { useT } from "../src/i18n/useT";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "../src/data/avatars";

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { signIn } = useApp();
  const t = useT();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(AVATAR_EMOJIS[0]);
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const valid = name.trim().length >= 2;

  const onContinue = async () => {
    if (!valid) return;
    setLoading(true);
    await signIn(name, emoji, color);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-ink"
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 40, paddingHorizontal: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text className="text-4xl font-black text-fg" style={{ letterSpacing: -1 }}>
            {t.onboarding.title}
          </Text>
          <Text className="mt-2 text-base font-medium text-muted">
            {t.onboarding.subtitle}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(500)} className="mt-8 items-center">
          <Avatar emoji={emoji} color={color} size={96} />
          <Text className="mt-3 text-sm font-semibold text-muted">{t.onboarding.preview}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mt-8">
          <Text className="mb-2 text-sm font-bold text-fg">{t.onboarding.nickname}</Text>
          <Field
            value={name}
            onChangeText={setName}
            placeholder={t.onboarding.namePlaceholder}
            maxLength={20}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={onContinue}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(500)} className="mt-6">
          <Text className="mb-3 text-sm font-bold text-fg">{t.onboarding.pickEmoji}</Text>
          <View className="flex-row flex-wrap gap-3">
            {AVATAR_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                className={`h-12 w-12 items-center justify-center rounded-xl border ${
                  emoji === e ? "border-primary bg-primary/20" : "border-line bg-surface"
                }`}
              >
                <Text className="text-2xl">{e}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).duration(500)} className="mt-6">
          <Text className="mb-3 text-sm font-bold text-fg">{t.onboarding.yourColor}</Text>
          <View className="flex-row flex-wrap gap-3">
            {AVATAR_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-12 w-12 rounded-xl ${
                  color === c ? "border-4 border-fg" : "border border-line"
                }`}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(440).duration(500)} className="mt-10">
          <Button
            label={t.onboarding.start}
            onPress={onContinue}
            disabled={!valid}
            loading={loading}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
