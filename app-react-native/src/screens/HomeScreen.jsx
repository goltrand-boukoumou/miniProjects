// Écran principal : liste des liens gérée par le store global (useSyncExternalStore)
import React, { useCallback, useEffect } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import LinkCard from "../components/LinkCard";
import { api } from "../api";
import { actions, useStore } from "../hooks/useStore";
import { theme } from "../theme";

export default function HomeScreen() {
  const { links, loading, error } = useStore();

  const refresh = useCallback(async () => {
    actions.setLoading(true);
    try {
      actions.setLinks(await api.listLinks());
    } catch (e) {
      actions.setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const removeLink = useCallback(async (id) => {
    actions.removeLink(id); // mise à jour optimiste
    try {
      await api.deleteLink(id);
    } catch {
      refresh(); // rollback en cas d'échec réseau
    }
  }, [refresh]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>⚠ {error}</Text>
        <Text style={styles.hint}>L'API DevLinks tourne-t-elle sur le port 3001 ?</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={links}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <LinkCard link={item} onRemove={removeLink} />}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={styles.title}>Mes liens 👨‍💻</Text>}
      ListEmptyComponent={
        <Text style={styles.empty}>{loading ? "Chargement…" : "Aucun lien. Ajoutez-en depuis l'onglet +."}</Text>
      }
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.primary} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1, justifyContent: "center", paddingVertical: theme.spacing(3) },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(4) },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.title,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: theme.spacing(3),
  },
  empty: { color: theme.colors.muted, textAlign: "center", marginTop: theme.spacing(6) },
  error: { color: theme.colors.danger, fontSize: theme.font.body },
  hint: { color: theme.colors.muted, marginTop: theme.spacing(1), textAlign: "center" },
});
