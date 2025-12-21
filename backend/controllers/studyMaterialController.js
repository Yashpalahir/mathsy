import StudyMaterial from '../models/StudyMaterial.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Cloudinary removed


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

// @desc    Get study materials for authenticated user based on their class
// @route   GET /api/study-materials/my-materials
// @access  Private
export const getStudyMaterialsForUser = async (req, res) => {
  try {
    // Extract user email from JWT (already available in req.user from protect middleware)
    const userEmail = req.user.email;

    // Get user with studentClass
    const user = await User.findOne({ email: userEmail }).select('studentClass');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user has a studentClass assigned
    if (!user.studentClass) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No class assigned to user. Please update your profile.',
      });
    }

    // Find study materials matching the user's class (grade)
    const materials = await StudyMaterial.find({ grade: user.studentClass })
      .sort({ createdAt: -1 })
      .select('-pdf'); // Exclude PDF data

    // Add virtual field for PDF URL
    const materialsWithUrl = materials.map(item => {
      const doc = item.toObject();
      doc.pdfUrl = `${req.protocol}://${req.get('host')}/api/study-materials/${item._id}/download`;
      return doc;
    });

    res.status(200).json({
      success: true,
      count: materials.length,
      studentClass: user.studentClass,
      data: materialsWithUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all study materials
// @route   GET /api/study-materials
// @access  Public
export const getStudyMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find().sort({ createdAt: -1 }).select('-pdf'); // Exclude PDF data

    // Add virtual field for PDF URL
    const materialsWithUrl = materials.map(item => {
      const doc = item.toObject();
      doc.pdfUrl = `${req.protocol}://${req.get('host')}/api/study-materials/${item._id}/download`;
      return doc;
    });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materialsWithUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Download study material PDF
// @route   GET /api/study-materials/:id/download
// @access  Public
export const downloadStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id).select('pdf pdfContentType title');

    if (!material || !material.pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found',
      });
    }

    res.set('Content-Type', material.pdfContentType || 'application/pdf');
    // Optional: force download vs view
    // res.set('Content-Disposition', `attachment; filename="${material.title}.pdf"`);
    res.send(material.pdf);
  } catch (error) {
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

    // We can also return the constructed URL here
    const doc = material.toObject();
    if (doc.pdf) delete doc.pdf; // Assuming we didn't select it, but just safely ensuring
    doc.pdfUrl = `${req.protocol}://${req.get('host')}/api/study-materials/${material._id}/download`;

    res.status(200).json({
      success: true,
      data: doc,
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

    // Save PDF to DB (req.file.buffer exists because memoryStorage is used)
    const material = await StudyMaterial.create({
      title,
      description,
      category,
      grade,
      pdf: req.file.buffer,
      pdfContentType: req.file.mimetype,
      pages: pages || 0,
      questions: questions || 0,
      year,
      createdBy: req.user.id,
    });

    // Provide the download URL in the response
    const doc = material.toObject();
    delete doc.pdf;
    doc.pdfUrl = `${req.protocol}://${req.get('host')}/api/study-materials/${material._id}/download`;

    res.status(201).json({
      success: true,
      data: doc,
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