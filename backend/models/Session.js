import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  instructorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  startTime: { type: Date, required: true },
  endTime: Date,
  isActive: { type: Boolean, default: true },
  title: String // e.g., "Lecture 5: Database Design"
});

export default mongoose.model('Session', sessionSchema);