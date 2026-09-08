import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema(
  {
    lectureTitle: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    isPreviewFree: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
  },
  { timestamps: true }
);

const Lecture = mongoose.model('Lecture', lectureSchema);
export default Lecture;
