/**
 * Mini Todo — Vanilla JS
 * Compétences illustrées : DOM API, événements, localStorage,
 * rendu déclaratif simple, filtres, accessibilité de base.
 */

const STORAGE_KEY = "mini-todo-v1";

let todos = load();
let currentFilter = "toutes";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const prioritySelect = document.getElementById("todo-priority");
const list = document.getElementById("todo-list");
const filtersEl = document.querySelector(".filters");
const statActive = document.getElementById("stat-active");
const statDone = document.getElementById("stat-done");
const clearDoneBtn = document.getElementById("clear-done");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    text,
    priority: prioritySelect.value,
    done: false,
    createdAt: Date.now(),
  });
  input.value = "";
  saveAndRender();
});

list.addEventListener("click", (e) => {
  const item = e.target.closest(".todo-item");
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.classList.contains("del")) {
    todos = todos.filter((t) => t.id !== id);
  } else if (e.target.classList.contains("text")) {
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  } else {
    return;
  }
  saveAndRender();
});

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  filtersEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
  render();
});

clearDoneBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  saveAndRender();
});

function visibleTodos() {
  const sorted = [...todos].sort((a, b) => b.createdAt - a.createdAt);
  if (currentFilter === "actives") return sorted.filter((t) => !t.done);
  if (currentFilter === "terminees") return sorted.filter((t) => t.done);
  return sorted;
}

function render() {
  const items = visibleTodos();
  list.innerHTML = items.length
    ? items.map(todoHtml).join("")
    : `<li class="empty">Rien à afficher ici 🎉</li>`;

  const active = todos.filter((t) => !t.done).length;
  const done = todos.length - active;
  statActive.textContent = `${active} active${active > 1 ? "s" : ""}`;
  statDone.textContent = `${done} terminée${done > 1 ? "s" : ""}`;
}

function todoHtml(t) {
  return `
    <li class="todo-item ${t.done ? "done" : ""}" data-id="${t.id}" data-priority="${t.priority}">
      <input type="checkbox" ${t.done ? "checked" : ""} aria-label="Marquer comme terminée"
             onchange="this.closest('.todo-item').querySelector('.text').click()" />
      <span class="text">${escapeHtml(t.text)}</span>
      <span class="badge">${t.priority}</span>
      <button class="del" aria-label="Supprimer">✕</button>
    </li>`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveAndRender() {
  save();
  render();
}

render();
