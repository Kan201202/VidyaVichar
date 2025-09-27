import express from 'express';
import Session from '../models/Session.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Start a new session
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Only instructors can start sessions' });
  }

  try {
    const session = new Session({
      ...req.body,
      instructorId: req.user.id,
      startTime: new Date(),
      isActive: true
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// End a session
router.patch('/:id/end', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, instructorId: req.user.id },
      { isActive: false, endTime: new Date() },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get active sessions for a course
router.get('/course/:courseId/active', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      courseId: req.params.courseId,
      isActive: true
    });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;