// routes/questions.js
import express from 'express';
import Question from '../models/Question.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// List
router.get('/', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const questions = await Question.find({ courseId })
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const question = new Question({
      ...req.body,
      studentId: req.user.role === 'student' ? req.user.id : undefined,
    });
    await question.save();

    const io = req.app.get('io');
    io.to(`course:${question.courseId}`).emit('question:created', question);

    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update
router.patch('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const io = req.app.get('io');
    io.to(`course:${question.courseId}`).emit('question:updated', question);
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await Question.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await existing.deleteOne();

    const io = req.app.get('io');
    io.to(`course:${existing.courseId}`).emit('question:deleted', { id: existing._id });

    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clear
router.post('/clear', auth, async (req, res) => {
  try {
    const { scope, courseId } = req.body;
    const query = { courseId };
    if (scope === 'answered') query.status = 'answered';

    await Question.deleteMany(query);

    const io = req.app.get('io');
    io.to(`course:${courseId}`).emit('questions:cleared', { scope });

    res.json({ message: `Cleared ${scope} questions` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;


// import express from 'express';
// import Question from '../models/Question.js';
// import auth from '../middleware/auth.js';

// const router = express.Router();

// // Get questions for a course
// router.get('/', auth, async (req, res) => {
//   try {
//     const { courseId } = req.query;
//     const query = { courseId };
    
//     const questions = await Question.find(query)
//       .sort({ createdAt: -1 })
//       .populate('studentId', 'name email');
    
//     res.json(questions);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Create a new question
// router.post('/', auth, async (req, res) => {
//   try {
//     const question = new Question({
//       ...req.body,
//       studentId: req.user.role === 'student' ? req.user.id : undefined
//     });
//     await question.save();
//     res.status(201).json(question);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Update a question (status, pinned, etc.)
// router.patch('/:id', auth, async (req, res) => {
//   try {
//     const question = await Question.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.json(question);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Delete a question
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     await Question.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Question deleted' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Clear questions (answered or all)
// router.post('/clear', auth, async (req, res) => {
//   try {
//     const { scope, courseId } = req.body;
//     const query = { courseId };
    
//     if (scope === 'answered') {
//       query.status = 'answered';
//     }
    
//     await Question.deleteMany(query);
//     res.json({ message: `Cleared ${scope} questions` });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// export default router;