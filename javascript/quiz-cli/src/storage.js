// Persistance locale : historique des scores dans un fichier JSON (~/.quiz-cli-history.json)
import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const HISTORY_FILE = path.join(os.homedir(), ".quiz-cli-history.json");
const MAX_ENTRIES = 20;

async function readHistory() {
  try {
    const raw = await readFile(HISTORY_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return []; // premier lancement ou fichier corrompu
  }
}

export async function saveResult(entry) {
  const entries = await readHistory();
  entries.push(entry);
  await writeFile(HISTORY_FILE, JSON.stringify({ entries: entries.slice(-MAX_ENTRIES) }, null, 2));
  return HISTORY_FILE;
}

export async function listHistory() {
  return readHistory();
}
