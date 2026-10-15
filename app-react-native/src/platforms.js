// Carte une URL vers sa plateforme (badge coloré dans la liste)
const PLATFORMS = [
  { match: /github\.com/i, name: "GitHub", color: "#8b5cf6" },
  { match: /linkedin\.com/i, name: "LinkedIn", color: "#0a66c2" },
  { match: /x\.com|twitter\.com/i, name: "X", color: "#f1f5f9" },
  { match: /youtube\.com/i, name: "YouTube", color: "#ef4444" },
  { match: /mastodon\./i, name: "Mastodon", color: "#6364ff" },
  { match: /dev\.to/i, name: "Dev.to", color: "#0f172a" },
];

export function detectPlatform(url) {
  return PLATFORMS.find((p) => p.match.test(url)) ?? { name: "Web", color: "#22d3ee" };
}
