const { publicQuiz } = require("../../shared/content-evidence.mjs");
const express = require("express");
const path = require("path");
const router = express.Router();

// Load static data from JSON files
const substances = require("../data/wada-categories.json");
const quizzes = require("../data/quizzes.json");
const specialties = require("../data/medical-specialties.json");
const adrv = require("../data/adrv-categories.json");

// P0: 包裝 try-catch 的 helper
const safeHandler = (fn) => (req, res, next) => {
  try {
    fn(req, res, next);
  } catch (error) {
    console.error("Education route error:", error);
    res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
};

// Get all educational content
router.get(
  "/",
  safeHandler((req, res) => {
    res.json({ substances, quizzes: quizzes.map(q => publicQuiz(q)), specialties });
  }),
);

// Get substance information
router.get(
  "/substances",
  safeHandler((req, res) => {
    res.json(substances);
  }),
);

// Get quizzes (randomized order)
router.get(
  "/quizzes",
  safeHandler((req, res) => {
    const shuffled = quizzes.map(q => publicQuiz(q)).sort(() => Math.random() - 0.5);
    res.json(shuffled);
  }),
);

// Submit quiz answer
router.post("/quizzes/:id/answer", (req, res) => {
  const quizId = parseInt(req.params.id);
  const { answer } = req.body;

  const found = quizzes.find((q) => q.id === quizId);
  const quiz = found ? publicQuiz(found) : null;

  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  if (!quiz.evidence.valid) return res.json({ correct: null, correctAnswer: null, explanation: null, publicationStatus: "pending_verification", evidence: quiz.evidence, learningUrl: "/quiz" });
  const isCorrect = answer === quiz.correctAnswer;

  res.json({
    correct: isCorrect,
    correctAnswer: quiz.correctAnswer,
    explanation: quiz.explanation,
  });
});

// Get specialties
router.get(
  "/specialties",
  safeHandler((req, res) => {
    res.json(specialties);
  }),
);

// Get ADRV categories + spirit-of-sport values + list structure (P1-7 single source)
router.get(
  "/adrv",
  safeHandler((req, res) => {
    res.json(adrv);
  }),
);

// Get single specialty
router.get(
  "/specialties/:id",
  safeHandler((req, res) => {
    const specialtyId = parseInt(req.params.id);
    const specialty = specialties.find((s) => s.id === specialtyId);

    if (!specialty) {
      return res.status(404).json({ error: "Specialty not found" });
    }

    res.json(specialty);
  }),
);

module.exports = router;
