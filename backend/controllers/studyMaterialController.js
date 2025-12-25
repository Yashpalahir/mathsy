import StudyMaterial from '../models/StudyMaterial.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for PDF uploads (store in memory)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @desc    Get all study materials
// @route   GET /api/study-materials
// @access  Public
export const getStudyMaterials = async (req, res) => {
  try {
    // For authenticated users, filter by enrolled courses
    let query = {};

    if (req.user) {
      // Admins and teachers should see all study materials
      if (req.user.role === 'admin' || req.user.role === 'teacher') {
        query = {};
      } else {
        // Import Enrollment model
        const Enrollment = (await import('../models/Enrollment.js')).default;

        // Get user's enrolled courses - use 'student' field as per Enrollment model
        const enrollments = await Enrollment.find({
          student: req.user.id,
          status: 'active',
        }).select('course');

        const enrolledCourseIds = enrollments.map(e => e.course);

        // Get materials for enrolled courses OR materials without a course (for backward compatibility)
        query = {
          $or: [
            { course: { $in: enrolledCourseIds } },
            { course: null },
          ],
        };
      }
    }

    const materials = await StudyMaterial.find(query)
      .select('-pdfData') // Exclude large buffer from list view
      .populate('course', 'title class')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single study material
// @route   GET /api/study-materials/:id
// @access  Public
export const getStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create new study material
// @route   POST /api/study-materials
// @access  Private/Admin
export const createStudyMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      grade,
      pages,
      questions,
      year,
      course,
    } = req.body;

    // Validation
    if (!title || !category || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, and grade',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file',
      });
    }

    const material = await StudyMaterial.create({
      title,
      description,
      category,
      grade,
      pdfData: req.file.buffer,
      pdfContentType: req.file.mimetype,
      pages: pages || 0,
      questions: questions || 0,
      year,
      course: course || null,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update study material
// @route   PUT /api/study-materials/:id
// @access  Private/Admin
export const updateStudyMaterial = async (req, res) => {
  try {
    let material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    material = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete study material
// @route   DELETE /api/study-materials/:id
// @access  Private/Admin
export const deleteStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    await material.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Study material deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
// @desc    Get study material PDF
// @route   GET /api/study-materials/:id/pdf
// @access  Public
export const getStudyMaterialPdf = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found',
      });
    }

    res.set({
      'Content-Type': material.pdfContentType,
      'Content-Disposition': `inline; filename="${material.title}.pdf"`,
    });

    res.send(material.pdfData);

  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
