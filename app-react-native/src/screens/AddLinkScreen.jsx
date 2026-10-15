// Écran d'ajout : formulaire contrôlé + validation maison avant POST vers l'API
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { api } from "../api";
import { actions } from "../hooks/useStore";
import { theme } from "../theme";

export default function AddLinkScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [feedback, setFeedback] = useState(null);

  function validate() {
    if (title.trim().length < 2) return "Le titre doit faire au moins 2 caractères.";
    if (!/^https?:\/\/[^\s]+\.[^\s]+$/.test(url.trim())) return "URL invalide (ex. https://github.com/…).";
    return null;
  }

  async function submit() {
    const problem = validate();
    if (problem) return setFeedback({ type: "error", text: problem });

    try {
      const created = await api.createLink({ title: title.trim(), url: url.trim() });
      actions.addLink(created); // le store se met à jour, HomeScreen re-render automatiquement
      setFeedback({ type: "ok", text: "Lien ajouté ✔" });
      setTitle("");
      setUrl("");
      setTimeout(() => navigation.goBack(), 600);
    } catch (e) {
      setFeedback({ type: "error", text: `Échec : ${e.message}` });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrap}
    >
      <View style={styles.card}>
        <Text style={styles.label}>Titre</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Mon GitHub"
          placeholderTextColor={theme.colors.muted}
        />
        <Text style={styles.label}>URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://github.com/username"
          placeholderTextColor={theme.colors.muted}
          autoCapitalize="none"
          keyboardType="url"
        />
        {feedback && (
          <Text style={feedback.type === "ok" ? styles.ok : styles.error}>{feedback.text}</Text>
        )}
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={submit}>
          <Text style={styles.buttonText}>Enregistrer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.colors.background, justifyContent: "center" },
  card: { padding: theme.spacing(3), gap: theme.spacing(1) },
  label: { color: theme.colors.muted, fontSize: theme.font.caption, fontWeight: "600" },
  input: {
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  pressed: { opacity: 0.7 },
  buttonText: { color: "#0f172a", fontWeight: "800", fontSize: theme.font.body },
  ok: { color: theme.colors.primary },
  error: { color: theme.colors.danger, marginBottom: theme.spacing(1) },
});
