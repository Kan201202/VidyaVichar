import express from 'express';
import Session from '../models/Session.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Start a new session (instructor only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can start sessions' });
    }
    const { courseId, title } = req.body;
    // End any existing active session for this course
    await Session.updateMany({ courseId, isActive: true }, { $set: { isActive: false, endTime: new Date() } });
    const session = await Session.create({
      courseId,
      instructorId: req.user._id,
      startTime: new Date(),
      isActive: true,
      title: title || undefined
    });
    req.app.get('io')?.emit('session:started', { courseId, sessionId: session._id });
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// End a session (instructor only)
router.patch('/:id/end', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can end sessions' });
    }
    const s = await Session.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Session not found' });
    s.isActive = false;
    s.endTime = new Date();
    await s.save();
    req.app.get('io')?.emit('session:ended', { courseId: s.courseId, sessionId: s._id });
    res.json(s);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get active session for a course
router.get('/course/:courseId/active', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ courseId: req.params.courseId, isActive: true });
    res.json(session || null);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;