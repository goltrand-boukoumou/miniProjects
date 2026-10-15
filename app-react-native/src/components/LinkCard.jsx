// Composant réutilisable : tuile de lien avec badge de plateforme + ouverture externe
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";

import { theme } from "../theme";
import { detectPlatform } from "../platforms";

export default function LinkCard({ link, onRemove }) {
  const platform = detectPlatform(link.url);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => Linking.openURL(link.url)}
    >
      <View style={[styles.badge, { backgroundColor: platform.color }]}>
        <Text style={styles.badgeText}>{platform.name}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{link.title}</Text>
        <Text style={styles.url} numberOfLines={1}>{link.url}</Text>
      </View>
      <Pressable hitSlop={12} onPress={() => onRemove(link.id)}>
        <Text style={styles.remove}>✕</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
    marginHorizontal: theme.spacing(2),
    marginVertical: theme.spacing(1),
    gap: theme.spacing(1.5),
  },
  pressed: { opacity: 0.7 },
  badge: {
    paddingHorizontal: theme.spacing(1),
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontSize: theme.font.caption, fontWeight: "700" },
  body: { flex: 1, gap: 2 },
  title: { color: theme.colors.text, fontSize: theme.font.body, fontWeight: "600" },
  url: { color: theme.colors.muted, fontSize: theme.font.caption },
  remove: { color: theme.colors.danger, fontSize: 18, paddingHorizontal: theme.spacing(1) },
});
