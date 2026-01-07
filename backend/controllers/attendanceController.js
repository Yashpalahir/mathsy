import crypto from 'crypto';
import AttendanceToken from '../models/AttendanceToken.js';
import Attendance from '../models/Attendance.js';

// @desc    Generate a unique QR token for attendance
// @route   POST /api/attendance/generate
// @access  Private (Student)
export const generateToken = async (req, res) => {
  try {
    const { type } = req.body;

    if (!['IN', 'OUT'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance type. Must be IN or OUT.',
      });
    }

    // Single-use token logic: Any unused tokens for this student and type should be invalidated
    // though the TTL index will handle cleanup, we want to ensure only one active token
    await AttendanceToken.deleteMany({ studentId: req.user._id, type });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds from now

    const attendanceToken = await AttendanceToken.create({
      studentId: req.user._id,
      type,
      token,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      data: {
        token: attendanceToken.token,
        expiresAt: attendanceToken.expiresAt,
        type: attendanceToken.type,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Scan and validate attendance QR
// @route   POST /api/attendance/scan
// @access  Private (Teacher)
export const scanQR = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided',
      });
    }

    // 1. Find and validate token
    const attendanceToken = await AttendanceToken.findOne({ token });

    if (!attendanceToken) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired QR code',
      });
    }

    if (attendanceToken.used) {
      return res.status(400).json({
        success: false,
        message: 'QR code has already been used',
      });
    }

    if (attendanceToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'QR code has expired',
      });
    }

    // 2. Mark token as used
    attendanceToken.used = true;
    await attendanceToken.save();

    const studentId = attendanceToken.studentId;
    const teacherId = req.user._id;
    const type = attendanceToken.type;
    const today = new Date().setHours(0, 0, 0, 0);

    // 3. Record attendance
    let attendance = await Attendance.findOne({ studentId, date: today });

    if (type === 'IN') {
      if (attendance && attendance.inTime) {
        return res.status(400).json({
          success: false,
          message: 'Student already marked IN for today',
        });
      }

      if (!attendance) {
        attendance = new Attendance({
          studentId,
          teacherId,
          date: today,
          inTime: new Date(),
        });
      } else {
        attendance.inTime = new Date();
        attendance.teacherId = teacherId; // Update teacher who scanned
      }
    } else if (type === 'OUT') {
      if (!attendance || !attendance.inTime) {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark OUT before marking IN',
        });
      }

      if (attendance.outTime) {
        return res.status(400).json({
          success: false,
          message: 'Student already marked OUT for today',
        });
      }

      attendance.outTime = new Date();
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Attendance marked ${type} successfully`,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

