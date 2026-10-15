// Affichage console avec codes ANSI (couleurs + mise en forme) — sans dépendance externe
const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, text) => (useColor ? `${code}${text}${ANSI.reset}` : String(text));

export const banner = (title) =>
  console.log(`\n${c(ANSI.bold + ANSI.cyan, title)}\n${"─".repeat(title.length)}`);

export const dim = (text) => console.log(c(ANSI.dim, text));

export function renderQuestion(q) {
  console.log(`\n${c(ANSI.bold, `Q${q.id}. ${q.question}`)}`);
  q.options.forEach((opt, i) => {
    console.log(`   ${c(ANSI.yellow, `${i + 1})`)} ${opt}`);
  });
}

export function renderAnswer(correct, explanation) {
  if (correct) {
    console.log(`   ${c(ANSI.green + ANSI.bold, "✔ Correct !")}`);
  } else {
    console.log(`   ${c(ANSI.red + ANSI.bold, "✘ Faux.")}`);
  }
  if (explanation) console.log(c(ANSI.dim, `   ℹ ${explanation}`));
}

export function renderSummary(score) {
  const barWidth = 30;
  const filled = Math.round((score.percent / 100) * barWidth);
  const bar = c(ANSI.green, "█".repeat(filled)) + c(ANSI.dim, "░".repeat(barWidth - filled));

  console.log(`\n${c(ANSI.bold, "Résultat")} : ${bar} ${score.percent}%  (note : ${c(ANSI.bold, score.grade)})`);
  console.log(`${score.correctCount}/${score.total} bonnes réponses\n`);

  for (const it of score.items) {
    const mark = it.correct ? c(ANSI.green, "✔") : c(ANSI.red, "✘");
    const detail = it.correct ? "" : ` — bonne réponse : "${it.expected}"`;
    console.log(`  ${mark} Q${it.id}${detail}`);
  }
}
