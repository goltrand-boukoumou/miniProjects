// Tests unitaires avec l'exécuteur natif de Node (node:test) — aucune dépendance externe
import { test } from "node:test";
import assert from "node:assert/strict";

import { computeScore, letterGrade, serializeResult } from "../src/scoring.js";
import { loadQuestions } from "../src/questions.js";

const sample = [
  { id: 1, question: "1+1 ?", options: ["2", "3"], answer: 0 },
  { id: 2, question: "Capitale de la France ?", options: ["Paris", "Lyon"], answer: 0 },
  { id: 3, question: "Langage du web ?", options: ["HTML", "SQL"], answer: 1 },
];

test("score parfait = 100% / grade A", () => {
  const s = computeScore(sample, [0, 0, 1]);
  assert.equal(s.correctCount, 3);
  assert.equal(s.percent, 100);
  assert.equal(s.grade, "A");
});

test("score partiel calcule le bon pourcentage", () => {
  const s = computeScore(sample, [0, 1, 1]); // 2/3
  assert.equal(s.correctCount, 2);
  assert.equal(s.percent, 67);
  assert.equal(s.grade, "C");
});

test("réponse manquante compte comme faute", () => {
  const s = computeScore(sample, [0]); // undefined sur Q2/Q3
  assert.equal(s.items[1].correct, false);
  assert.equal(s.items[1].given, null);
});

test("letterGrade couvre toutes les bornes", () => {
  assert.equal(letterGrade(90), "A");
  assert.equal(letterGrade(89), "B");
  assert.equal(letterGrade(75), "B");
  assert.equal(letterGrade(60), "C");
  assert.equal(letterGrade(40), "D");
  assert.equal(letterGrade(0), "E");
});

test("serializeResult produit une entrée d'historique valide", () => {
  const s = computeScore(sample, [0, 0, 1]);
  const e = serializeResult(s);
  assert.match(e.date, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual([e.correct, e.total, e.percent, e.grade], [3, 3, 100, "A"]);
});

test("la banque de questions live est valide et chargeable", async () => {
  const qs = await loadQuestions();
  assert.ok(qs.length >= 5, "au moins 5 questions");
  for (const q of qs) {
    assert.ok(q.answer >= 0 && q.answer < q.options.length, `réponse hors bornes : ${q.question}`);
  }
});
