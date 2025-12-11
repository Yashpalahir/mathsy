import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, 'Please provide 4 options'],
    validate: {
      validator: function(v) {
        return v.length === 4;
      },
      message: 'Each question must have exactly 4 options',
    },
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Please provide the correct answer index'],
    min: [0, 'Correct answer must be between 0 and 3'],
    max: [3, 'Correct answer must be between 0 and 3'],
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
    description: {
      type: String,
      trim: true,
      default: '',
    },
    questions: {
      type: [questionSchema],
      required: [true, 'Please provide at least one question'],
      validate: {
        validator: function(v) {
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
testSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  }
  next();
});

export default mongoose.model('Test', testSchema);

