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
    grade: {
      type: String,
      required: [true, 'Please provide a grade'],
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