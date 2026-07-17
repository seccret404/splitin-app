/** Avatar colors + emojis used for diners. */
export const AVATAR_COLORS = [
  "#7C5CFF", // violet
  "#FF5CAA", // pink
  "#43E0FF", // cyan
  "#C6FF3D", // lime
  "#FF8A3D", // sunset
  "#FFD23D", // gold
  "#5CFFB0", // mint
  "#FF6B6B", // coral
];

export const AVATAR_EMOJIS = [
  "😎", "🦄", "🐱", "🐼", "🦊", "🐧", "🦁", "🐸",
  "👾", "🤖", "🦖", "🍕", "🌮", "🧋", "🔥", "✨",
];

export const VIBE_EMOJIS = [
  "🍔", "🍕", "🍜", "🍣", "🍻", "☕️", "🧋", "🍰",
  "🎂", "🥘", "🍱", "🌮", "🍢", "🥤", "🎉", "🛒",
];

export function pickColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function pickEmoji(index: number): string {
  return AVATAR_EMOJIS[index % AVATAR_EMOJIS.length];
}

export function randomVibe(): string {
  return VIBE_EMOJIS[Math.floor(Math.random() * VIBE_EMOJIS.length)];
}
