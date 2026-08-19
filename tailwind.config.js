/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#0B0E12",
        surface: "#14181F",
        surface2: "#1B212A",
        line: "#252C36",
        line2: "#323B47",
        body: "#E9EDF2",
        muted: "#8E98A5",
        faint: "#5C6672",
        accent: "#F5A524",
        accentDim: "#2A2113",
        positive: "#34D399",
        positiveDim: "#12241D",
        danger: "#F87171",
        dangerDim: "#2A1616",
        info: "#60A5FA",
        infoDim: "#14243A",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
        heading: ["SpaceGrotesk_600SemiBold"],
        headingBold: ["SpaceGrotesk_700Bold"],
      },
      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        ".tabular-nums": { fontVariant: ["tabular-nums"] },
      });
    },
  ],
};
