import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private
export const getEnrollments = async (req, res) => {
  try {
    let query = {};

    // If user is student, only show their enrollments
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }
    // If user is admin or teacher, show all enrollments
    // Otherwise, show only their enrollments

    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email')
      .populate('course', 'title description grade price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create new enrollment
// @route   POST /api/enrollments
// @access  Private
export const createEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a course ID',
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      status: 'active',
    });

    // Update course students count
    course.studentsCount = (course.studentsCount || 0) + 1;
    await course.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('student', 'name email')
      .populate('course', 'title description grade price');

    res.status(201).json({
      success: true,
      data: populatedEnrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update enrollment status
// @route   PUT /api/enrollments/:id
// @access  Private/Admin
export const updateEnrollment = async (req, res) => {
  try {
    const { status } = req.body;

    let enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Only admin can update enrollment status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update enrollment',
      });
    }

    if (status) {
      enrollment.status = status;
    }

    await enrollment.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('student', 'name email')
      .populate('course', 'title description grade price');

    res.status(200).json({
      success: true,
      data: populatedEnrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Check if user is enrolled in a course
// @route   GET /api/enrollments/check/:courseId
// @access  Private
export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
      status: 'active',
    });

    res.status(200).json({
      success: true,
      enrolled: !!enrollment,
      enrollment: enrollment || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get enrolled students for a course
// @route   GET /api/enrollments/course/:courseId/students
// @access  Private/Admin
export const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({
      course: courseId,
      status: 'active',
    }).populate('student', 'name email');

    const students = enrollments.map(e => e.student).filter(Boolean);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
