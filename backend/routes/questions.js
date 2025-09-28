import express from 'express';
import Question from '../models/Question.js';
import Session from '../models/Session.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// List questions for a course
router.get('/', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const q = await Question.find({ courseId }).sort({ createdAt: -1 });
    res.json(q);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Create a question — only if an active session exists for course
router.post('/', auth, async (req, res) => {
  try {
    const { text, author, courseId } = req.body;
    if (!text || !courseId) return res.status(400).json({ message: 'text and courseId are required' });
    const active = await Session.findOne({ courseId, isActive: true });
    if (!active) return res.status(403).json({ message: 'Instructor has not started the class yet' });
    const q = await Question.create({
      text,
      author: author || 'Anonymous',
      courseId,
      sessionId: active._id,
      studentId: req.user?._id
    });
    req.app.get('io')?.emit('question:created', q);
    res.status(201).json(q);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Patch status/pin (instructor only)
router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Only instructors can modify questions' });
    const patch = {};
    if (typeof req.body.status === 'string') patch.status = req.body.status;
    if (typeof req.body.pinned === 'boolean') patch.pinned = req.body.pinned;
    const q = await Question.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    req.app.get('io')?.emit('question:updated', q);
    res.json(q);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Delete question (instructor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Only instructors can delete questions' });
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    req.app.get('io')?.emit('question:deleted', q._id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Student's own history
router.get('/history', auth, async (req, res) => {
  try {
    const q = await Question.find({ studentId: req.user?._id }).sort({ createdAt: -1 });
    res.json(q);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;