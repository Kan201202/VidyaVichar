import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  instructorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  code: { type: String, unique: true }, // e.g., "CS101"
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Course', courseSchema);