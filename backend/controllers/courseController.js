import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get courses for authenticated user based on their class
// @route   GET /api/courses/my-courses
// @access  Private
export const getCoursesForUser = async (req, res) => {
  try {
    // Extract user email from JWT (already available in req.user from protect middleware)
    const userEmail = req.user.email;

    // Get user with class
    const user = await User.findOne({ email: userEmail }).select('class studentClass');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user has a class assigned (check 'class' first, then 'studentClass')
    const userClass = user.class || user.studentClass;

    if (!userClass) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No class assigned to user. Please update your profile.',
      });
    }

    // Find courses matching the user's class
    const courses = await Course.find({ class: userClass }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      studentClass: userClass,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    let query = {};

    // Filter by class if provided in query params
    if (req.query.class) {
      query.class = req.query.class;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      grade,
      price,
      duration,
      timing,
      chapters,
      syllabus,
      color,
      popular,
      examGuidance,
      counselingSupport,
      onlineTag,
      bannerImage,
      bannerTitle,
      bannerSubtitle,
      teacherGroupImage,
      yellowTagText,
      languageBadge,
      audienceText,
      promoBannerText,
      oldPrice,
      discountPercent,
    } = req.body;

    // Validation
    if (!title || !description || !grade || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, class, and price',
      });
    }

    const course = await Course.create({
      title,
      description,
      class: grade,  // Map 'grade' from frontend to 'class' in model
      price,
      duration,
      timing,
      chapters,
      syllabus: Array.isArray(syllabus) ? syllabus : [],
      color: color || 'from-mathsy-blue to-primary',
      popular: popular || false,
      examGuidance,
      counselingSupport,
      onlineTag,
      bannerImage,
      bannerTitle,
      bannerSubtitle,
      teacherGroupImage,
      yellowTagText,
      languageBadge,
      audienceText,
      promoBannerText,
      oldPrice,
      discountPercent,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Map 'grade' from frontend to 'class' in model if present
    if (req.body.grade) {
      req.body.class = req.body.grade;
      delete req.body.grade;
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

