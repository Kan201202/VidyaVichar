import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create a new course (Instructor only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Only instructors can create courses' });
  }

  try {
    const course = new Course({
      ...req.body,
      instructorId: req.user.id
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get my courses - for instructors: courses they teach, for students: courses they're enrolled in
router.get('/my-courses', auth, async (req, res) => {
  try {
    if (req.user.role === 'instructor') {
      // Get courses taught by this instructor
      const courses = await Course.find({ instructorId: req.user.id });
      res.json(courses);
    } else if (req.user.role === 'student') {
      // Get enrollments for this student and populate course details
      const enrollments = await Enrollment.find({ studentId: req.user.id })
        .populate('courseId');
      
      // Extract courses from enrollments
      const courses = enrollments.map(e => e.courseId).filter(course => course != null);
      res.json(courses);
    } else {
      res.status(400).json({ error: 'Invalid user role' });
    }
  } catch (error) {
    console.error('Error in /my-courses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available courses for students (courses they're not enrolled in)
router.get('/available', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can browse available courses' });
    }

    // Get courses where user is not enrolled
    const enrolledCourses = await Enrollment.find({ studentId: req.user.id });
    const enrolledCourseIds = enrolledCourses.map(e => e.courseId);
    
    const courses = await Course.find({
      _id: { $nin: enrolledCourseIds }
    }).populate('instructorId', 'name email');
    
    res.json(courses);
  } catch (error) {
    console.error('Error in /available:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enroll in a course (Student)
router.post('/:courseId/enroll', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can enroll' });
  }

  try {
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const enrollment = new Enrollment({
      studentId: req.user.id,
      courseId: req.params.courseId
    });
    
    await enrollment.save();
    
    // Populate and return course details
    await enrollment.populate('courseId');
    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment: enrollment,
      course: enrollment.courseId
    });
  } catch (error) {
    console.error('Error in enrollment:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get enrollment status for a course (Student)
router.get('/:courseId/enrollment-status', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can check enrollment' });
  }

  try {
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId
    });

    res.json({ isEnrolled: !!enrollment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;