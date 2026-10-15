#!/usr/bin/env node
// Quiz CLI — point d'entrée : readline (interaction), argv (flags), async/await
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { loadQuestions } from "./questions.js";
import { computeScore, serializeResult } from "./scoring.js";
import { saveResult, listHistory } from "./storage.js";
import { banner, dim, renderQuestion, renderAnswer, renderSummary } from "./ui.js";

const HELP = `Usage : quiz [options]

Options :
  --help, -h        Affiche cette aide
  --history         Affiche l'historique des scores
  --max <n>         Nombre de questions par partie (défaut : toutes)
  --no-save         Ne pas sauvegarder le score dans l'historique`;

/** Parseur d'arguments minimal (sans dépendance type yargs). */
function parseArgs(argv) {
  const opts = { max: Infinity, save: true, history: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--history") opts.history = true;
    else if (a === "--no-save") opts.save = false;
    else if (a === "--max") {
      const n = Number.parseInt(argv[++i], 10);
      if (!Number.isInteger(n) || n <= 0) throw new Error("--max attend un entier positif");
      opts.max = n;
    } else throw new Error(`Option inconnue : ${a}\n\n${HELP}`);
  }
  return opts;
}

/** Mélange un tableau (Fisher–Yates) sans muter l'original. */
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function showHistory(rl) {
  const entries = await listHistory();
  banner("📊 Historique des scores");
  if (entries.length === 0) {
    dim("Aucune partie enregistrée pour l'instant.");
    return;
  }
  for (const e of entries) {
    console.log(`  ${e.date.slice(0, 16).replace("T", " ")}  ${e.correct}/${e.total}  ${e.percent}%  (${e.grade})`);
  }
}

async function runQuiz(rl, opts) {
  const all = await loadQuestions();
  const questions = shuffle(all).slice(0, Math.min(opts.max, all.length));

  banner(`🧠 Quiz JavaScript (${questions.length} questions)`);
  dim("Répondez avec le numéro du choix, ou 'q' pour quitter.");

  const answers = [];
  for (const q of questions) {
    renderQuestion(q);
    const raw = (await rl.question("Votre réponse › ")).trim().toLowerCase();

    if (raw === "q" || raw === "quit") {
      dim("Partie interrompue — score non enregistré.");
      return;
    }

    const idx = Number.parseInt(raw, 10) - 1;
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.options.length) {
      dim(`   Choix invalide, compté comme faux.`);
      answers.push(undefined);
      continue;
    }

    answers.push(idx);
    renderAnswer(idx === q.answer, q.explanation);
  }

  const score = computeScore(questions, answers);
  banner("Récapitulatif");
  renderSummary(score);

  if (opts.save) {
    const file = await saveResult(serializeResult(score));
    dim(`Score enregistré dans ${file}`);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const rl = createInterface({ input, output });

  try {
    if (opts.help) return console.log(HELP);
    if (opts.history) return await showHistory(rl);
    await runQuiz(rl, opts);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(`\nErreur : ${err.message}`);
  process.exitCode = 1;
});
