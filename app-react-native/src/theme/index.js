// Thème centralisé — réutilisable et modifiable au seul endroit (design tokens)
export const theme = {
  colors: {
    background: "#0f172a",
    card: "#1e293b",
    primary: "#22d3ee",
    text: "#f1f5f9",
    muted: "#94a3b8",
    danger: "#f87171",
  },
  radius: 16,
  spacing: (n) => n * 8,
  font: {
    title: 26,
    body: 16,
    caption: 13,
  },
};
