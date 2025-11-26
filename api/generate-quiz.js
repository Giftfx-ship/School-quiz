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

    // Prompt to OpenAI
    const prompt = `
    Create ${numQuestions} multiple choice questions for the nursing course: ${course}.
    Each question should have 4 options labeled A, B, C, D.
    Specify the correct answer and give a short explanation.
    Return JSON array like:
    [
      {
        "question": "...",
        "options": {"A":"...","B":"...","C":"...","D":"..."},
        "answer": "B",
        "explanation": "..."
      },
      ...
    ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const text = completion.choices[0].message.content;

    // Try to parse as JSON
    let questions = [];
    try { questions = JSON.parse(text); } catch(e){ questions = [{question:"Error parsing AI response", options:{},answer:"",explanation:""}]; }

    return res.status(200).json({ questions });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
