import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      trim: true,
    },
    class: {
      type: String,
      required: [true, 'Please provide a class'],
      enum: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: String,
      trim: true,
    },
    timing: {
      type: String,
      trim: true,
    },
    chapters: {
      type: Number,
      default: 0,
    },
    syllabus: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: 'from-mathsy-blue to-primary',
    },
    popular: {
      type: Boolean,
      default: false,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Course', courseSchema);

