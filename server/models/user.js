import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ["Admin", "Instructor", "Student"], default: 'Student' },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  photoUrl: { type: String, default: '' },
});

const User = mongoose.model('User', userSchema);
export default User;