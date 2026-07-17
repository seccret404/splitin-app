/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // SplitIn light palette — F5F5F5 / 76ABAE / 303841 / FF5722
        ink: "#FFFFFF", // app background (clean white)
        card: "#F4F6F7", // default card — soft gray panel
        surface: "#E9ECEE", // inputs, chips, small insets
        line: "#E2E6E8", // borders (used sparingly)
        muted: "#6B7580", // secondary text
        fg: "#303841", // primary text (dark slate)
        primary: "#76ABAE", // teal
        accent: "#FF5722", // deep orange
        // legacy accent names remapped to the 4-color palette
        lime: "#FF5722",
        pink: "#FF5722",
        cyan: "#76ABAE",
        sunset: "#FF5722",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
        black: ["Inter_900Black"],
      },
    },
  },
  plugins: [],
};
