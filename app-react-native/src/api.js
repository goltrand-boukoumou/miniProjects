// Client HTTP minimal vers l'API DevLinks (Node) — remplacez l'URL par votre IP locale en dev
import { Platform } from "react-native";

// Android émulateur : 10.0.2.2 pointe vers localhost de la machine hôte
const HOST = Platform.select({ android: "10.0.2.2", ios: "localhost", default: "localhost" });
export const API_URL = `http://${HOST}:3001`;

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} sur ${path}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  listLinks: () => request("/links"),
  createLink: (payload) => request("/links", { method: "POST", body: JSON.stringify(payload) }),
  deleteLink: (id) => request(`/links/${id}`, { method: "DELETE" }),
  health: () => request("/health"),
};
