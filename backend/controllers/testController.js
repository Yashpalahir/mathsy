import Test from '../models/Test.js';
import TestResult from '../models/TestResult.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Create test
// @route   POST /api/tests
// @access  Private/Admin
export const createTest = async (req, res) => {
  try {
    const { name, class: testClass, description, questions, duration, passingMarks } = req.body;

    // Validation
    if (!name || !testClass || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide test name, class, and at least one question',
      });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1}: Please provide question and exactly 4 options`,
        });
      }
      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1}: Please provide correct answer index (0-3)`,
        });
      }
    }

    // Prepare test data
    const testData = {
      name: name.trim(),
      class: testClass.trim(),
      description: description ? description.trim() : '',
      questions: questions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(opt => typeof opt === 'string' ? opt.trim() : opt),
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1,
      })),
      duration: duration || 60,
      passingMarks: passingMarks || 0,
      createdBy: req.user.id,
    };

    const test = await Test.create(testData);

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test,
    });
  } catch (error) {
    console.error('Error creating test:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all tests (admin) or tests for specific class (students)
// @route   GET /api/tests
// @access  Private
export const getTests = async (req, res) => {
  try {
    let query = { isActive: true };

    // If user is student, only show tests for classes they are enrolled in
    if (req.user.role === 'student') {
      // Get user's enrollments to find their enrolled classes
      const enrollments = await Enrollment.find({ 
        student: req.user.id,
        status: { $in: ['active', 'pending'] }
      }).populate('course', 'grade');

      // Extract unique grades/classes from enrolled courses
      const enrolledClasses = [...new Set(
        enrollments
          .map(e => e.course?.grade)
          .filter(Boolean)
      )];

      if (enrolledClasses.length > 0) {
        // Only show tests for classes the student is enrolled in
        query = { 
          isActive: true,
          class: { $in: enrolledClasses }
        };
      } else {
        // If student has no enrollments, show no tests
        query = { isActive: true, class: '__NO_CLASS__' }; // This will return empty
      }
    }

    const tests = await Test.find(query)
      .select('-questions.options -questions.correctAnswer') // Don't send answers to students
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all tests (admin only - with answers)
// @route   GET /api/tests/all
// @access  Private/Admin
export const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single test (for taking test - without answers)
// @route   GET /api/tests/:id
// @access  Private
export const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    if (!test.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Test is not active',
      });
    }

    // Check if student has already taken this test
    if (req.user.role === 'student') {
      const existingResult = await TestResult.findOne({
        test: test._id,
        student: req.user.id,
      });

      if (existingResult) {
        return res.status(400).json({
          success: false,
          message: 'You have already taken this test',
          data: existingResult,
        });
      }
    }

    // Remove correct answers for students
    const testData = test.toObject();
    if (req.user.role === 'student') {
      testData.questions = testData.questions.map(q => ({
        question: q.question,
        options: q.options,
        marks: q.marks,
      }));
    }

    res.status(200).json({
      success: true,
      data: testData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Submit test
// @route   POST /api/tests/:id/submit
// @access  Private
export const submitTest = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const testId = req.params.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide answers array',
      });
    }

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    // Check if student has already taken this test
    const existingResult = await TestResult.findOne({
      test: testId,
      student: req.user.id,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this test',
        data: existingResult,
      });
    }

    // Evaluate answers
    const evaluatedAnswers = test.questions.map((question, index) => {
      const userAnswer = answers.find(a => a.questionIndex === index);
      const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : -1;
      const isCorrect = selectedAnswer === question.correctAnswer;
      const marksObtained = isCorrect ? (question.marks || 1) : 0;

      return {
        questionIndex: index,
        selectedAnswer,
        isCorrect,
        marksObtained,
      };
    });

    const obtainedMarks = evaluatedAnswers.reduce((sum, ans) => sum + ans.marksObtained, 0);
    const percentage = (obtainedMarks / test.totalMarks) * 100;
    const status = percentage >= (test.passingMarks || 0) ? 'passed' : 'failed';

    const testResult = await TestResult.create({
      test: testId,
      student: req.user.id,
      answers: evaluatedAnswers,
      totalMarks: test.totalMarks,
      obtainedMarks,
      percentage: Math.round(percentage * 100) / 100,
      status,
      timeTaken: timeTaken || 0,
    });

    const populatedResult = await TestResult.findById(testResult._id)
      .populate({
        path: 'test',
        select: 'name class description questions totalMarks passingMarks duration',
      })
      .populate('student', 'name email');

    res.status(201).json({
      success: true,
      message: 'Test submitted successfully',
      data: populatedResult,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this test',
      });
    }
    console.error('Error submitting test:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get test result
// @route   GET /api/tests/:id/result
// @access  Private
export const getTestResult = async (req, res) => {
  try {
    const testId = req.params.id;

    let query = { test: testId };

    // Students can only see their own results
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    const result = await TestResult.findOne(query)
      .populate({
        path: 'test',
        select: 'name class description questions totalMarks passingMarks duration',
      })
      .populate('student', 'name email');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Private/Admin
export const updateTest = async (req, res) => {
  try {
    const { name, class: testClass, description, questions, duration, passingMarks, isActive } = req.body;

    let test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    if (name) test.name = name.trim();
    if (testClass) test.class = testClass.trim();
    if (description !== undefined) test.description = description.trim();
    if (questions) {
      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Please provide question and exactly 4 options`,
          });
        }
        if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Please provide correct answer index (0-3)`,
          });
        }
      }
      test.questions = questions;
    }
    if (duration !== undefined) test.duration = duration;
    if (passingMarks !== undefined) test.passingMarks = passingMarks;
    if (isActive !== undefined) test.isActive = isActive;

    await test.save();

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
// @access  Private/Admin
export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    await test.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all test results (admin)
// @route   GET /api/tests/results/all
// @access  Private/Admin
export const getAllTestResults = async (req, res) => {
  try {
    const results = await TestResult.find()
      .populate('test', 'name class')
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

