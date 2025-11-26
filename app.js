/* app.js
   Single-page UI + client-side auth (localStorage) + AI-quiz integration via Vercel serverless function
*/

// Simple client state
const state = {
  user: JSON.parse(localStorage.getItem("ogn_user") || "null"),
  token: localStorage.getItem("ogn_token") || null,
  questions: [],
  current: 0,
  answers: {}
};

// DOM refs
const openAuthBtn = document.getElementById("openAuthBtn");
const authModal = document.getElementById("authModal");
const closeAuth = document.getElementById("closeAuth");
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const btnLogin = document.getElementById("btnLogin");
const btnSignup = document.getElementById("btnSignup");
const userDisplay = document.getElementById("userDisplay");
const startNowBtn = document.getElementById("startNowBtn");

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

// UI init
function refreshUI(){
  if (state.user) {
    userDisplay.textContent = state.user.name || state.user.email;
    openAuthBtn.textContent = "My account";
  } else {
    userDisplay.textContent = "";
    openAuthBtn.textContent = "Login / Sign up";
  }
}
refreshUI();

// Auth modal handlers
openAuthBtn.onclick = () => { authModal.classList.remove("hidden"); authModal.setAttribute("aria-hidden", "false"); }
closeAuth.onclick = () => { authModal.classList.add("hidden"); authModal.setAttribute("aria-hidden","true"); }
tabLogin.onclick = () => { tabLogin.classList.add("active"); tabSignup.classList.remove("active"); loginForm.classList.remove("hidden"); signupForm.classList.add("hidden"); }
tabSignup.onclick = () => { tabSignup.classList.add("active"); tabLogin.classList.remove("active"); signupForm.classList.remove("hidden"); loginForm.classList.add("hidden"); }

// Signup (localStorage)
btnSignup.onclick = () => {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const pass = document.getElementById("signupPass").value;

  if (!email || !phone || !pass) return alert("Please fill email, phone and password.");

  const user = { name: name || "", email, phone, pass };
  localStorage.setItem("ogn_user", JSON.stringify(user));
  localStorage.setItem("ogn_token", "local-ghost-token");
  state.user = user;
  alert("Account created! Welcome 🎉");
  authModal.classList.add("hidden");
  refreshUI();
};

// Login (localStorage)
btnLogin.onclick = () => {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  const user = JSON.parse(localStorage.getItem("ogn_user") || "null");
  if (!user) return alert("No account found. Please sign up.");
  if (email === user.email && pass === user.pass) {
    localStorage.setItem("ogn_token", "local-ghost-token");
    state.user = user;
    alert("Login successful! Good luck ✨");
    authModal.classList.add("hidden");
    refreshUI();
  } else alert("Incorrect email or password.");
};

// Start Now shortcut
if (startNowBtn) startNowBtn.onclick = () => {
  authModal.classList.remove("hidden");
  tabSignup.click();
};

// -------------------------
// Quiz generation via OpenAI API (serverless on Vercel)
// -------------------------
generateBtn.onclick = async () => {
  if (!state.user) {
    alert("Please login or sign up to generate quizzes.");
    authModal.classList.remove("hidden");
    return;
  }

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

// Render a question
function renderQuestion(){
  const q = state.questions[state.current];
  if (!q) return;
  qHeader.textContent = `Question ${state.current+1} of ${state.questions.length}`;
  qText.textContent = q.question;
  optionsEl.innerHTML = "";
  for (const key of Object.keys(q.options)){
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

// Prev / Next
prevBtn.onclick = () => { if (state.current>0){ state.current--; renderQuestion(); } };
nextBtn.onclick = () => { if (state.current < state.questions.length-1){ state.current++; renderQuestion(); } };

// Finish and show results
finishBtn.onclick = () => {
  if (!state.questions || state.questions.length === 0) return;
  let correct = 0;
  const details = [];
  state.questions.forEach((q,i)=>{
    const chosen = state.answers[i] || null;
    const ok = chosen === q.answer;
    if (ok) correct++;
    details.push({ q: q.question, chosen, answer: q.answer, explanation: q.explanation });
  });

  resultsEl.classList.remove("hidden");
  resultsEl.innerHTML = `<h3>Your score: ${correct} / ${state.questions.length}</h3>`;
  details.forEach((d, idx) => {
    const el = document.createElement("div");
    el.className = "card";
    el.style.marginTop = "10px";
    el.innerHTML = `<strong>Q${idx+1}:</strong> ${d.q}
      <div>Answer: ${d.answer} — Your choice: ${d.chosen || "—"}</div>
      <div style="margin-top:6px;font-style:italic;color:#bcd">${d.explanation || ""}</div>`;
    resultsEl.appendChild(el);
  });

  quizArea.classList.add("hidden");
};

// Helper: logout
function logout(){
  localStorage.removeItem("ogn_token");
  state.user = null;
  refreshUI();
}
