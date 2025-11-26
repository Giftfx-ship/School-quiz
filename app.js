/* app.js
   Single-page UI + AI-quiz (no login) using _answer
*/

// ------------------ State ------------------
const state = {
  questions: [],
  current: 0,
  answers: {}
};

// ------------------ DOM Refs ------------------
const courseSelect = document.getElementById("courseSelect");
const numQ = document.getElementById("numQ");
const generateBtn = document.getElementById("generateBtn");

const quizArea = document.getElementById("quizArea");
const qHeader = document.getElementById("qHeader");
const qText = document.getElementById("qText");
const optionsEl = document.getElementById("options");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const finishBtn = document.getElementById("finishBtn");
const resultsEl = document.getElementById("results");

// ------------------ Quiz Generation ------------------
generateBtn.onclick = async () => {
  const course = courseSelect.value;
  const n = Math.max(1, Math.min(20, parseInt(numQ.value || "10")));
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating…";

  try {
    const resp = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course, numQuestions: n })
    });
    const data = await resp.json();
    if (!data.questions || data.questions.length === 0) {
      alert("No questions generated. Try again.");
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Quiz (AI)";
      return;
    }
    state.questions = data.questions;
    state.current = 0;
    state.answers = {};
    renderQuestion();
    quizArea.classList.remove("hidden");
    resultsEl.classList.add("hidden");
  } catch (err) {
    alert("Error generating quiz: " + err.message);
  }

  generateBtn.disabled = false;
  generateBtn.textContent = "Generate Quiz (AI)";
};

// ------------------ Render Question ------------------
function renderQuestion() {
  const q = state.questions[state.current];
  if (!q) return;

  qHeader.textContent = `Question ${state.current + 1} of ${state.questions.length}`;
  qText.textContent = q.question;
  optionsEl.innerHTML = "";

  for (const key of Object.keys(q.options)) {
    const div = document.createElement("div");
    div.className = "opt" + (state.answers[state.current] === key ? " selected" : "");
    div.innerHTML = `<strong>${key}.</strong> ${q.options[key]}`;
    div.onclick = () => { 
      state.answers[state.current] = key; 
      renderQuestion(); 
    };
    optionsEl.appendChild(div);
  }

  prevBtn.disabled = state.current === 0;
  nextBtn.disabled = state.current === state.questions.length - 1;
}

// ------------------ Prev / Next ------------------
prevBtn.onclick = () => { 
  if (state.current > 0) { state.current--; renderQuestion(); } 
};
nextBtn.onclick = () => { 
  if (state.current < state.questions.length - 1) { state.current++; renderQuestion(); } 
};

// ------------------ Finish Quiz ------------------
finishBtn.onclick = () => {
  if (!state.questions || state.questions.length === 0) return;

  let correct = 0;
  const details = [];

  state.questions.forEach((q, i) => {
    const chosen = state.answers[i] || null;
    const isCorrect = chosen === q._answer;
    if (isCorrect) correct++;
    details.push({ q: q.question, chosen, answer: q._answer, explanation: q.explanation, isCorrect });
  });

  resultsEl.classList.remove("hidden");
  resultsEl.innerHTML = `<h3>Your score: ${correct} / ${state.questions.length}</h3>`;

  details.forEach((d, idx) => {
    const el = document.createElement("div");
    el.className = "card";
    el.style.marginTop = "10px";
    el.innerHTML = `
      <strong>Q${idx+1}:</strong> ${d.q}
      <div>Your choice: <strong>${d.chosen || "—"}</strong></div>
      ${d.isCorrect ? '<div style="color:#4ade80;font-weight:600;">Correct ✅</div>' : `<div style="color:#f87171;font-weight:600;">Correct answer: ${d.answer}</div>`}
      <div style="margin-top:6px;font-style:italic;color:#cbd5e1;">${d.explanation || ""}</div>
    `;
    resultsEl.appendChild(el);
  });

  quizArea.classList.add("hidden");
};
