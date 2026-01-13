import Review from '../models/Review.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { content, rating } = req.body;

    // Validation
    if (!content || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide review content and rating',
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Get user data from authenticated user
    const user = req.user;
    const name = user.name;
    const image = user.avatar || '';
    const userId = user.id;

    // Format role: "Student of Class X" or "Parent of Class X"
    let role = '';
    if (user.role === 'student' || user.role === 'parent') {
      const userType = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      role = user.class ? `${userType} of ${user.class}` : userType;
    } else {
      role = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }

    const review = await Review.create({
      name,
      role,
      content: content.trim(),
      rating: Number(rating),
      image,
      user: userId,
      status: 'approved', // Auto-approve reviews
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your review!',
      data: review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all approved reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments({ status: 'approved' });
    const reviews = await Review.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/all
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update review status
// @route   PUT /api/reviews/:id
// @access  Private/Admin
export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (status) {
      review.status = status;
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

