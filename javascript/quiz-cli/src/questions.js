// Banque de questions — chargée depuis un fichier JSON (IO asynchrone)
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "data", "questions.json");

/** Charge et valide les questions depuis le disque. */
export async function loadQuestions() {
  const raw = await readFile(DATA_FILE, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.questions)) {
    throw new Error('questions.json invalide : la clé "questions" est manquante');
  }

  return data.questions.map((q, i) => {
    if (!q.question || !Array.isArray(q.options) || typeof q.answer !== "number") {
      throw new Error(`Question #${i + 1} mal formée dans questions.json`);
    }
    return { ...q, id: i + 1 };
  });
}
