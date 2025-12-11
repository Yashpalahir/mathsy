import DemoBooking from '../models/DemoBooking.js';

// @desc    Create demo booking request
// @route   POST /api/demo-bookings
// @access  Public
export const createDemoBooking = async (req, res) => {
  try {
    const { name, contactNumber, email } = req.body;

    // Validation
    if (!name || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and contact number',
      });
    }

    // Validate contact number format (10 digits)
    if (!/^[0-9]{10}$/.test(contactNumber.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit contact number',
      });
    }

    // Validate email if provided
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const demoBooking = await DemoBooking.create({
      name: name.trim(),
      contactNumber: contactNumber.replace(/\D/g, ''), // Store only digits
      email: email ? email.trim().toLowerCase() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! We will contact you shortly for a bright future!',
      data: demoBooking,
    });
  } catch (error) {
    console.error('Error creating demo booking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all demo bookings
// @route   GET /api/demo-bookings
// @access  Private/Admin
export const getDemoBookings = async (req, res) => {
  try {
    const demoBookings = await DemoBooking.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: demoBookings.length,
      data: demoBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update demo booking status
// @route   PUT /api/demo-bookings/:id
// @access  Private/Admin
export const updateDemoBooking = async (req, res) => {
  try {
    const { status, notes } = req.body;

    let demoBooking = await DemoBooking.findById(req.params.id);

    if (!demoBooking) {
      return res.status(404).json({
        success: false,
        message: 'Demo booking not found',
      });
    }

    if (status) {
      demoBooking.status = status;
    }

    if (notes !== undefined) {
      demoBooking.notes = notes;
    }

    await demoBooking.save();

    res.status(200).json({
      success: true,
      data: demoBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete demo booking
// @route   DELETE /api/demo-bookings/:id
// @access  Private/Admin
export const deleteDemoBooking = async (req, res) => {
  try {
    const demoBooking = await DemoBooking.findById(req.params.id);

    if (!demoBooking) {
      return res.status(404).json({
        success: false,
        message: 'Demo booking not found',
      });
    }

    await demoBooking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Demo booking deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

