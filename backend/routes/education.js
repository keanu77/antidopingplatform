const express = require('express');
const path = require('path');
const router = express.Router();

// Load static data from JSON files
const substances = require('../data/wada-categories.json');
const quizzes = require('../data/quizzes.json');
const specialties = require('../data/medical-specialties.json');

// Get all educational content
router.get('/', (req, res) => {
  res.json({ substances, quizzes, specialties });
});

// Get substance information
router.get('/substances', (req, res) => {
  res.json(substances);
});

// Get quizzes (randomized order)
router.get('/quizzes', (req, res) => {
  const shuffled = [...quizzes].sort(() => Math.random() - 0.5);
  res.json(shuffled);
});

// Submit quiz answer
router.post('/quizzes/:id/answer', (req, res) => {
  const quizId = parseInt(req.params.id);
  const { answer } = req.body;

  const quiz = quizzes.find(q => q.id === quizId);

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const isCorrect = answer === quiz.correctAnswer;

  res.json({
    correct: isCorrect,
    correctAnswer: quiz.correctAnswer,
    explanation: quiz.explanation
  });
});

// Get specialties
router.get('/specialties', (req, res) => {
  res.json(specialties);
});

// Get single specialty
router.get('/specialties/:id', (req, res) => {
  const specialtyId = parseInt(req.params.id);
  const specialty = specialties.find(s => s.id === specialtyId);

  if (!specialty) {
    return res.status(404).json({ error: 'Specialty not found' });
  }

  res.json(specialty);
});

module.exports = router;
