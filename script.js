// OGCNS Quiz Game - script.js

let pool = [];
let currentIndex = 0;
let score = 0;

// DOM elements
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

// Start the quiz
function startQuiz() {
  const requested = parseInt(numQuestionsInput.value, 10) || 10;
  const cat = categorySelect.value;

  let poolSrc = (cat === 'all') ? questions : questions.filter(q => q.category === cat);
  if (poolSrc.length === 0) poolSrc = questions;

  // Shuffle and slice for requested length
  pool = shuffle([...poolSrc]).slice(0, Math.min(requested, poolSrc.length));
  currentIndex = 0;
  score = 0;

  totalNum.textContent = pool.length;
  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');

  showQuestion();
}

// Display a question
function showQuestion() {
  const q = pool[currentIndex];
  currentNum.textContent = currentIndex + 1;
  questionEl.textContent = q.q;
  optionsEl.innerHTML = '';

  // Animate question text
  questionEl.classList.add('animated-question');
  setTimeout(() => questionEl.classList.remove('animated-question'), 600);

  q.options.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'optionBtn';
    b.textContent = opt;
    b.onclick = () => selectOption(i, b, q.answer);
    optionsEl.appendChild(b);
  });

  nextBtn.classList.add('hidden');
}

// Handle answer selection
function selectOption(selectedIndex, btn, correctIndex) {
  const allBtns = document.querySelectorAll('.optionBtn');
  allBtns.forEach(b => b.classList.add('disabled'));

  if (selectedIndex === correctIndex) {
    btn.classList.add('correct');
    btn.classList.add('glow-btn');
    score++;
  } else {
    btn.classList.add('wrong');
    if (allBtns[correctIndex]) {
      allBtns[correctIndex].classList.add('correct');
      allBtns[correctIndex].classList.add('glow-btn');
    }
  }

  // Add a slight animation effect
  btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 400 });
  nextBtn.classList.remove('hidden');
}

// Go to next question
function next() {
  currentIndex++;
  if (currentIndex >= pool.length) finishQuiz();
  else showQuestion();
}

// Finish quiz and show score
function finishQuiz() {
  quizScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');

  scoreText.textContent = `You scored: ${score} / ${pool.length}`;
  scoreText.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800 });
}

// Play again
function playAgain() {
  startScreen.classList.remove('hidden');
  resultScreen.classList.add('hidden');
}

// Quit quiz
function quit() {
  playAgain();
}

// Shuffle array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Event listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', next);
quitBtn.addEventListener('click', quit);
playAgainBtn.addEventListener('click', playAgain);

// Optional: floating background animation
document.body.style.background = 'linear-gradient(135deg, #00c6ff, #0072ff)';
