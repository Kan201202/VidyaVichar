import express from 'express';
import Question from '../models/Question.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get questions for a course
router.get('/', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { courseId };
    
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email');
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new question
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, text } = req.body;

    if (!courseId || !text) {
      return res.status(400).json({ error: "courseId and text are required" });
    }

    // Check for active session for this course
    const activeSession = await Session.findOne({ courseId, isActive: true });
    if (!activeSession) {
      return res.status(400).json({
        error: "Cannot ask questions — no active session for this course",
      });
    }

    // Ensure only students can ask questions
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Only students can ask questions" });
    }

    const question = new Question({
      ...req.body,
      studentId: req.user.role === 'student' ? req.user.id : undefined
    });

    await question.save();

    const io = req.app.get('io');
    io.to(`course:${question.courseId}`).emit('question:created', question);

    res.status(201).json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update a question (status, pinned, etc.)
router.patch('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(question);
  } catch (error) {
    console.error("Failed to update question:", error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a question
router.delete('/:id', auth, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clear questions (answered or all)
router.post('/clear', auth, async (req, res) => {
  try {
    const { scope, courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    const query = { courseId };
    
    if (scope === 'answered') {
      query.status = 'answered';
    }
    
    await Question.deleteMany(query);

    const io = req.app.get('io');
    io.to(`course:${courseId}`).emit('questions:cleared', { scope });

    res.json({ message: `Cleared ${scope} questions` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;