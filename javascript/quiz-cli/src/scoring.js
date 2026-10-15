// Logique de score — module pur, testable unitairement (sans IO ni console)

/** Calcule le résultat d'une session de quiz. */
export function computeScore(questions, answers) {
  const items = questions.map((q, i) => {
    const given = answers[i];
    return {
      id: q.id ?? i + 1,
      question: q.question,
      correct: given === q.answer,
      expected: q.options[q.answer],
      given: given == null ? null : q.options[given] ?? `Choix ${given}`,
    };
  });

  const correctCount = items.filter((it) => it.correct).length;
  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return {
    items,
    correctCount,
    total,
    percent,
    grade: letterGrade(percent),
  };
}

export function letterGrade(percent) {
  if (percent >= 90) return "A";
  if (percent >= 75) return "B";
  if (percent >= 60) return "C";
  if (percent >= 40) return "D";
  return "E";
}

/** Sérialise un résultat pour la sauvegarde d'historique. */
export function serializeResult(score) {
  return {
    date: new Date().toISOString(),
    correct: score.correctCount,
    total: score.total,
    percent: score.percent,
    grade: score.grade,
  };
}
