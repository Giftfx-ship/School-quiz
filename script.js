let pool = [];
let currentIndex = 0;
let score = 0;

const startBtn = document.getElementById('startBtn');
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const quitBtn = document.getElementById('quitBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const currentNum = document.getElementById('currentNum');
const totalNum = document.getElementById('totalNum');
const scoreText = document.getElementById('scoreText');
const numQuestionsInput = document.getElementById('numQuestions');
const categorySelect = document.getElementById('category');

function startQuiz() {
  const requested = parseInt(numQuestionsInput.value,10) || 10;
  const cat = categorySelect.value;

  let poolSrc = (cat==='all') ? questions : questions.filter(q=>q.category===cat);
  if(poolSrc.length===0) poolSrc = questions;

  pool = shuffle(Array.from(poolSrc)).slice(0, Math.min(requested,poolSrc.length));
  currentIndex=0; score=0;

  totalNum.textContent = pool.length;
  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');

  showQuestion();
}

function showQuestion() {
  const q = pool[currentIndex];
  currentNum.textContent = currentIndex+1;
  questionEl.textContent = q.q;
  optionsEl.innerHTML='';

  q.options.forEach((opt,i)=>{
    const b=document.createElement('button');
    b.className='optionBtn';
    b.textContent=opt;
    b.onclick=()=>selectOption(i,b,q.answer);
    optionsEl.appendChild(b);
  });

  nextBtn.classList.add('hidden');
}

function selectOption(i,btn,correctIndex){
  document.querySelectorAll('.optionBtn').forEach(b=>b.classList.add('disabled'));
  if(i===correctIndex){ btn.classList.add('correct'); score++; }
  else { btn.classList.add('wrong'); document.querySelectorAll('.optionBtn')[correctIndex].classList.add('correct'); }
  nextBtn.classList.remove('hidden');
}

function next() {
  currentIndex++;
  if(currentIndex>=pool.length) finishQuiz();
  else showQuestion();
}

function finishQuiz() {
  quizScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  scoreText.textContent = `You scored: ${score} / ${pool.length}`;
}

function playAgain() { startScreen.classList.remove('hidden'); resultScreen.classList.add('hidden'); }
function quit() { playAgain(); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

startBtn.addEventListener('click',startQuiz);
nextBtn.addEventListener('click',next);
quitBtn.addEventListener('click',quit);
playAgainBtn.addEventListener('click',playAgain);
