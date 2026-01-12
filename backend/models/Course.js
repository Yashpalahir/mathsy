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
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    class: {
      type: String,
      required: [true, 'Please provide a class'],
      enum: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
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
    batchAbout: {
      type: String,
      trim: true,
    },
    courseDuration: {
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
    validity: {
      type: Date,
    },
    examGuidance: {
      type: String,
      trim: true,
      default: 'Exam guidance at our Mathsy Offline centers',
    },
    counselingSupport: {
      type: String,
      trim: true,
      default: 'One-to-one emotional well-being support by Mathsy counselors',
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

