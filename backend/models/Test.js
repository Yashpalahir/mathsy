import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'subjective'],
    default: 'mcq',
  },
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  video: {
    type: String,
    default: '',
  },
  options: [
    {
      text: { type: String, required: true },
      image: { type: String, default: '' }
    }
  ],
  correctAnswer: {
    type: Number, // Index for MCQ, null for subjective
    min: [0, 'Correct answer must be between 0 and 3'],
    max: [3, 'Correct answer must be between 0 and 3'],
  },
  explanation: {
    type: String,
    default: '',
  },
  marks: {
    type: Number,
    default: 1,
    min: [1, 'Marks must be at least 1'],
  },
}, { _id: false });

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a test name'],
      trim: true,
      maxlength: [200, 'Test name cannot be more than 200 characters'],
    },
    class: {
      type: String,
      required: [true, 'Please provide a class'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    targetUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    description: {
      type: String,
      trim: true,
      default: '',
    },
    questions: {
      type: [questionSchema],
      required: [true, 'Please provide at least one question'],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'Test must have at least one question',
      },
    },
    duration: {
      type: Number, // Duration in minutes
      default: 60,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    passingMarks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total marks before saving
testSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  }
  next();
});

export default mongoose.model('Test', testSchema);

