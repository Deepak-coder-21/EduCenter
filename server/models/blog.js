import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'Admin',
  },
  category: {
    type: String,
    default: 'Education',
  },
  thumbnail: {
    type: String,
    default: '',
  },
  pdfUrl: {
    type: String,
    default: '',
  },
  pdfName: {
    type: String,
    default: '',
  },
  pdfPublicId: {
    type: String,
    default: '',
  },
  pdfFiles: [
    {
      url: { type: String, required: true },
      name: { type: String, default: 'notes.pdf' },
      publicId: { type: String, default: '' },
      size: { type: Number, default: 0 },
    }
  ],
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;