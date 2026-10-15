// Gestion d'état global sans dépendance externe : store observable + hook useSyncExternalStore (React 18+)
import { useSyncExternalStore } from "react";

const listeners = new Set();
let state = {
  links: [],
  loading: false,
  error: null,
};

export function getState() {
  return state;
}

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

/** Abonnement pour useSyncExternalStore ; renvoie la fonction de désabonnement. */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---- Actions ----
export const actions = {
  setLoading(loading) {
    setState({ loading });
  },
  setError(error) {
    setState({ error, loading: false });
  },
  setLinks(links) {
    setState({ links, loading: false, error: null });
  },
  addLink(link) {
    setState({ links: [link, ...state.links] });
  },
  removeLink(id) {
    setState({ links: state.links.filter((l) => l.id !== id) });
  },
};

/** Hook maison : sélecteur typé sur le store global. */
export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(state));
}
