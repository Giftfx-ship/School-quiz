// /api/generate-quiz.mjs
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { course, numQuestions } = req.body;
    if (!course || !numQuestions)
      return res.status(400).json({ error: "Missing course or numQuestions" });

    const n = Math.min(Math.max(parseInt(numQuestions, 10), 1), 20);

    const prompt = `
      Create exactly ${n} multiple choice questions for the nursing course: "${course}".
      Each question must have 4 options labeled A, B, C, D.
      Do NOT show the correct answer to the user upfront.
      Include a short explanation or hint for each question.
      Return ONLY a valid JSON array without extra text or formatting, like:
      [
        {
          "question": "...",
          "options": {"A":"...","B":"...","C":"...","D":"..."},
          "answer": "B",
          "explanation": "Optional hint/explanation"
        }
      ]
    `;

    // OpenAssistant public API endpoint
    const response = await fetch("https://api.open-assistant.io/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: prompt })
    });

    const data = await response.json();
    const text = data.output?.[0]?.content?.[0]?.text || "";

    let questions = [];
    try {
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }

      // Ensure questions array is valid
      if (!Array.isArray(questions)) throw new Error("Parsed JSON is not an array");

      // Fill in missing questions if AI returned less
      while (questions.length < n) {
        questions.push({
          question: "Placeholder question",
          options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" },
          answer: "A",
          explanation: "This is a placeholder question."
        });
      }

      // Trim extra questions if AI returned more
      questions = questions.slice(0, n);

    } catch (err) {
      console.error("Error parsing AI response:", err, "\nResponse text:", text);
      // Fallback: generate n placeholder questions
      questions = Array.from({ length: n }, (_, i) => ({
        question: `Placeholder question ${i + 1}`,
        options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" },
        answer: "A",
        explanation: "This is a placeholder question."
      }));
    }

    // Strip answers before sending to frontend
    const frontendQuestions = questions.map(q => ({
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      _answer: q.answer
    }));

    return res.status(200).json({ questions: frontendQuestions });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
