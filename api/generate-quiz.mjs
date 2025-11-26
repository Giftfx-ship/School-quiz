// /api/generate-quiz.mjs
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { course } = req.body;
  if (!course) return res.status(400).json({ error: "Missing course" });

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

  const fileName = fileMap[course];
  if (!fileName) return res.status(404).json({ error: "Course not found" });

  try {
    const module = await import(`../questions/${fileName}`);
    const questions = module.default || module.questions || [];
    
    if (!questions.length) return res.status(404).json({ error: "No questions found for this course" });

    // pick number of questions requested (default 20)
    const numQuestions = Math.min(20, questions.length);
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, numQuestions);

    const frontendQuestions = shuffled.map(q => ({
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      _answer: q._answer
    }));

    return res.status(200).json({ questions: frontendQuestions });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
