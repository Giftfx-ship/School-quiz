// ===== QUIZ ENGINE =====

// Global variables
let currentIndex = 0;
let score = 0;
let selectedCategory = null;
let filteredQuestions = [];

// HTML references
const questionBox = document.getElementById("question");
const optionsBox = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const scoreBox = document.getElementById("scoreBox");
const categorySelect = document.getElementById("categorySelect");

// Load categories automatically
(function loadCategories() {
    const cats = [...new Set(questions.map(q => q.category))];

    cats.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = `${cat}`;
        categorySelect.appendChild(option);
    });
})();

// Start quiz after selecting a category
function startQuiz() {
    selectedCategory = categorySelect.value;

    if (!selectedCategory) {
        alert("Please select a course to begin.");
        return;
    }

    score = 0;
    currentIndex = 0;

    // Filter questions by selected category
    filteredQuestions = questions.filter(q => q.category === selectedCategory);

    // Shuffle questions
    filteredQuestions.sort(() => Math.random() - 0.5);

    document.getElementById("homeScreen").style.display = "none";
    document.getElementById("quizScreen").style.display = "block";

    loadQuestion();
}

// Load a question
function loadQuestion() {
    const currentQ = filteredQuestions[currentIndex];

    questionBox.textContent = `${currentIndex + 1}. ${currentQ.q}`;

    optionsBox.innerHTML = "";

    currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "optionBtn";
        btn.textContent = opt;

        btn.onclick = () => selectAnswer(idx);

        optionsBox.appendChild(btn);
    });
}

// Handle answer selection
function selectAnswer(selected) {
    const correctIndex = filteredQuestions[currentIndex].answer;
    const optionButtons = document.querySelectorAll(".optionBtn");

    optionButtons.forEach((btn, idx) => {
        btn.disabled = true;

        if (idx === correctIndex) btn.classList.add("correct");
        if (idx === selected && selected !== correctIndex) btn.classList.add("wrong");
    });

    if (selected === correctIndex) score++;

    nextBtn.style.display = "block";
}

// Next question
function nextQuestion() {
    currentIndex++;

    if (currentIndex >= filteredQuestions.length) {
        endQuiz();
        return;
    }

    nextBtn.style.display = "none";
    loadQuestion();
}

// End Quiz
function endQuiz() {
    document.getElementById("quizScreen").style.display = "none";
    document.getElementById("resultScreen").style.display = "block";

    scoreBox.textContent = `${score} / ${filteredQuestions.length}`;
}

// Restart quiz
function restartQuiz() {
    document.getElementById("resultScreen").style.display = "none";
    document.getElementById("homeScreen").style.display = "block";
    }
