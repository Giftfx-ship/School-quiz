import OpenAI from "openai";

import OpenAI from "openai";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { course, numQuestions } = req.body;
    if (!course || !numQuestions) return res.status(400).json({ error: "Missing course or numQuestions" });

    const n = Math.min(Math.max(parseInt(numQuestions, 10), 1), 20);

    const prompt = `
      Create ${n} multiple choice questions for the nursing course: ${course}.
      Each question must have 4 options labeled A, B, C, D.
      Do NOT show the correct answer to the user upfront.
      Include a short explanation or hint for each question.
      Return strictly a JSON array like:
      [
        {
          "question": "...",
          "options": {"A":"...","B":"...","C":"...","D":"..."},
          "answer": "B",        <-- include it here, but frontend should hide it initially
          "explanation": "Optional hint/explanation"
        }
      ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    let questions = [];
    const text = completion.choices[0].message.content.trim();

    try {
      questions = JSON.parse(text);
      if (!Array.isArray(questions)) throw new Error("AI did not return an array");
    } catch (err) {
      console.error("Error parsing AI response:", err, "\nResponse text:", text);
      questions = [{
        question: "Error parsing AI response",
        options: { A: "", B: "", C: "", D: "" },
        answer: "",
        explanation: "The AI response could not be parsed as JSON."
      }];
    }

    // Strip answers before sending to frontend
    const frontendQuestions = questions.map(q => ({
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      _answer: q.answer // keep it hidden internally
    }));

    return res.status(200).json({ questions: frontendQuestions });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
