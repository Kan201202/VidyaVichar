import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format'
    }
  },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'instructor'], 
    default: 'student' 
  }
}, {
  timestamps: true
});

// Auto-detect role based on email before saving
userSchema.pre('save', function(next) {
  if (this.isModified('email') || this.isNew) {
    // If email contains student domain, set as student, else instructor
    const studentDomains = ['students.iiit.ac.in', 'student.iiit.ac.in']; // Add your student domains
    const isStudent = studentDomains.some(domain => this.email.includes(domain));
    this.role = isStudent ? 'student' : 'instructor';
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);