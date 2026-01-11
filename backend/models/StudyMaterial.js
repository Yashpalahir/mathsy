import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a material title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Notes', 'Practice Sheets', 'Previous Year Questions'],
      trim: true,
    },
    class: {
      type: String,
      required: [true, 'Please provide a class'],
      enum: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
      trim: true,
    },
    pdfData: {
      type: Buffer,
      required: [true, 'Please provide PDF data'],
    },
    pdfContentType: {
      type: String,
      default: 'application/pdf',
    },
    pages: {
      type: Number,
      default: 0,
    },
    questions: {
      type: Number,
      default: 0,
    },
    year: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
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

export default mongoose.model('StudyMaterial', studyMaterialSchema);