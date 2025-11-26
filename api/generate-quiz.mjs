// /api/generate-quiz.mjs
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { course, numQuestions } = req.body;
    if (!course) return res.status(400).json({ error: "Missing course" });

    // Map course codes to filenames
    const fileMap = {
      "GNS210": "gns210_anatomy.js",
      "GNS211": "gns211_foundation.js",
      "GNS212": "gns212_med_surg.js",
      "GNS213": "gns213_pry_health.js",
      "GNS214": "gns214_pharmacology.js",
      "GNS215": "gns215_reproductive_health.js",
      "GST216": "gst216_biostatistics.js",
      "GST217": "gst217_research_methodology.js"
    };

    const fileName = fileMap[course.toUpperCase()];
    if (!fileName) return res.status(404).json({ error: "Course not found" });

    const filePath = path.join(process.cwd(), "questions", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: "Course file missing" });
    }

    // Dynamically import the questions
    const { questions } = await import(`../questions/${fileName}`);
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ error: "No questions found in course file" });
    }

    const n = Math.min(Math.max(parseInt(numQuestions, 10) || 10, 1), questions.length);

    // Shuffle and select random questions
    const shuffledQuestions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, n);

    // Return only frontend-friendly fields
    const frontendQuestions = shuffledQuestions.map(q => ({
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      _answer: q.answer // hidden internally
    }));

    return res.status(200).json({ questions: frontendQuestions });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
