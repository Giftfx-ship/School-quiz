// ------------------ State ------------------
const state = {
  user: JSON.parse(localStorage.getItem("ogn_user") || "null"),
  token: localStorage.getItem("ogn_token") || null,
  questions: [],
  current: 0,
  answers: {}
};

// ------------------ DOM Refs ------------------
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const openLoginBtn = document.getElementById("openLoginBtn");
const openSignupBtn = document.getElementById("openSignupBtn");
const closeLogin = document.getElementById("closeLogin");
const closeSignup = document.getElementById("closeSignup");
const btnLogin = document.getElementById("btnLogin");
const btnSignup = document.getElementById("btnSignup");
const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");

// Quiz elements
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

// ------------------ UI Refresh ------------------
function refreshUI(){
  if(state.user){
    userDisplay.textContent = state.user.name || state.user.email;
    openLoginBtn.style.display = "none";
    openSignupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    userDisplay.textContent = "";
    openLoginBtn.style.display = "inline-block";
    openSignupBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}
refreshUI();

// ------------------ Modals ------------------
openLoginBtn.onclick = ()=> loginModal.classList.remove("hidden");
openSignupBtn.onclick = ()=> signupModal.classList.remove("hidden");
closeLogin.onclick = ()=> loginModal.classList.add("hidden");
closeSignup.onclick = ()=> signupModal.classList.add("hidden");

// ------------------ Signup ------------------
btnSignup.onclick = ()=>{
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const pass = document.getElementById("signupPass").value;
  if(!email || !phone || !pass) return alert("Please fill email, phone and password.");

  const user = { name, email, phone, pass };
  localStorage.setItem("ogn_user", JSON.stringify(user));
  localStorage.setItem("ogn_token","local-ghost-token");
  state.user = user;

  // clear inputs
  document.getElementById("signupName").value="";
  document.getElementById("signupEmail").value="";
  document.getElementById("signupPhone").value="";
  document.getElementById("signupPass").value="";

  signupModal.classList.add("hidden");
  refreshUI();
};

// ------------------ Login ------------------
btnLogin.onclick = ()=>{
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  const user = JSON.parse(localStorage.getItem("ogn_user") || "null");
  if(!user) return alert("No account found. Please sign up.");

  if(email === user.email && pass === user.pass){
    localStorage.setItem("ogn_token","local-ghost-token");
    state.user = user;

    // clear inputs
    document.getElementById("loginEmail").value="";
    document.getElementById("loginPass").value="";

    loginModal.classList.add("hidden");
    refreshUI();
  } else alert("Incorrect email or password.");
};

// ------------------ Logout ------------------
logoutBtn.onclick = ()=>{
  localStorage.removeItem("ogn_token");
  state.user = null;
  refreshUI();
};

// ------------------ Quiz Generation ------------------
generateBtn.onclick = async () => {
  if (!state.user) { alert("Please login or sign up"); openLoginBtn.click(); return; }
  const course = courseSelect.value;
  const n = Math.max(1, Math.min(20, parseInt(numQ.value || "10")));
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating…";

  try {
    const resp = await fetch("/api/generate-quiz", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ course, numQuestions:n })
    });
    const data = await resp.json();
    if(!data.questions || data.questions.length===0) throw new Error("No questions generated");

    state.questions = data.questions;
    state.current = 0;
    state.answers = {};
    renderQuestion();
    quizArea.classList.remove("hidden");
    resultsEl.classList.add("hidden");
  } catch(err){
    alert("Error generating quiz: "+err.message);
  }

  generateBtn.disabled=false;
  generateBtn.textContent="Generate Quiz (AI)";
};

// ------------------ Render Question ------------------
function renderQuestion(){
  const q = state.questions[state.current];
  if(!q) return;
  qHeader.textContent = `Question ${state.current+1} of ${state.questions.length}`;
  qText.textContent = q.question;
  optionsEl.innerHTML = "";
  for(const key of Object.keys(q.options)){
    const div=document.createElement("div");
    div.className="opt"+(state.answers[state.current]===key?" selected":"");
    div.innerHTML=`<strong>${key}.</strong> ${q.options[key]}`;
    div.onclick=()=>{ state.answers[state.current]=key; renderQuestion(); };
    optionsEl.appendChild(div);
  }
  prevBtn.disabled = state.current===0;
  nextBtn.disabled = state.current===state.questions.length-1;
}

// Prev / Next
prevBtn.onclick = ()=>{ if(state.current>0){ state.current--; renderQuestion(); } };
nextBtn.onclick = ()=>{ if(state.current<state.questions.length-1){ state.current++; renderQuestion(); } };

// Finish Quiz
finishBtn.onclick = ()=>{
  if(!state.questions || !state.questions.length) return;
  let correct=0; const details=[];
  state.questions.forEach((q,i)=>{
    const chosen = state.answers[i] || null;
    if(chosen===q.answer) correct++;
    details.push({q:q.question, chosen, answer:q.answer, explanation:q.explanation});
  });

  resultsEl.classList.remove("hidden");
  resultsEl.innerHTML=`<h3>Your score: ${correct} / ${state.questions.length}</h3>`;
  details.forEach((d,i)=>{
    const el=document.createElement("div");
    el.className="card"; el.style.marginTop="10px";
    el.innerHTML=`<strong>Q${i+1}:</strong> ${d.q}
      <div>Answer: ${d.answer} — Your choice: ${d.chosen||"—"}</div>
      <div style="margin-top:6px;font-style:italic;color:#bcd">${d.explanation||""}</div>`;
    resultsEl.appendChild(el);
  });

  quizArea.classList.add("hidden");
};

// ------------------ Floating Emojis ------------------
const emojis = ["💉","🩺","👩‍⚕️","🏥","🧬"];
function createFloatingEmoji(){
  const span=document.createElement("span");
  span.className="floating-emoji";
  span.textContent=emojis[Math.floor(Math.random()*emojis.length)];
  span.style.left=Math.random()*90+"vw";
  span.style.fontSize=(16+Math.random()*24)+"px";
  span.style.animationDuration=(3+Math.random()*4)+"s";
  document.body.appendChild(span);
  setTimeout(()=>span.remove(),7000);
}
setInterval(createFloatingEmoji,500);
