import express from "express";
import Session from "../models/Session.js";
import auth from "../middleware/auth.js";
import { requireInstructor } from "../middleware/roleAuth.js";

const router = express.Router();

/**
 * Start a new session for a specific course.
 * Automatically ends any previously active session for that course.
 */
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "instructor") {
    return res
      .status(403)
      .json({ error: "Only instructors can start sessions" });
  }

  const { courseId, title } = req.body;

  try {
    // End any currently active session for this course
    await Session.updateMany(
      { courseId, isActive: true },
      { isActive: false, endTime: new Date() }
    );

    // Create a new session
    const session = new Session({
      courseId,
      title,
      instructorId: req.user.id,
      startTime: new Date(),
      isActive: true,
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * End a session by its ID.
 */
router.patch("/:id/end", auth, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, instructorId: req.user.id },
      { isActive: false, endTime: new Date() },
      { new: true }
    );

    if (!session) {
      return res
        .status(404)
        .json({ error: "Session not found or already ended" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get currently active session for a course.
 */
router.get("/course/:courseId/active", auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      courseId: req.params.courseId,
      isActive: true,
    });

    res.json(session); // null if no active session
  } catch (error) {
    console.error("Error fetching active session:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
