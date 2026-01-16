// ======================================================
// CLEAN BACKEND — ONLY WHAT FRONTEND CURRENTLY USES
// PHONE OTP LOGIN + GET USER + PROFILE COMPLETION
// ADMIN LOGIN + EDUCATOR LOGIN
// ======================================================

import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Otp from '../models/Otp.js';

import generateToken from '../utils/generateToken.js';
import dotenv from 'dotenv';

dotenv.config();

// ------------------ ADMIN CREDENTIALS ------------------
// Moved into login function to ensure process.env is read at request time

// ==============================================================
// 1️⃣  VERIFY PHONE OTP → LOGIN OR CREATE NEW USER
//     Used in frontend Login.js:
//     apiClient.verifyPhoneOtp(phone, "", true)
// ==============================================================

export const verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp, isFirebaseVerified } = req.body;

    // Require phone
    if (!phone || (!otp && !isFirebaseVerified)) {
      return res.status(400).json({ success: false, message: 'Provide phone and OTP' });
    }

    // If Firebase verified = true → skip backend OTP check
    if (!isFirebaseVerified) {
      const validOtp = await Otp.findOne({ phone, otp });
      if (!validOtp) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
      await Otp.findOneAndDelete({ phone });
    }

    // Check if user exists by phone
    let user = await User.findOne({ phone });

    // If new user → create minimal user
    if (!user) {
      user = await User.create({
        phone,
        role: 'student',
        isProfileComplete: false,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
      message: user.isProfileComplete
        ? 'Login successful'
        : 'OTP Verified. Please complete your profile.',
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================
// 2️⃣  GET LOGGED-IN USER INFO
//     Used in AuthContext refreshUser()
// ==============================================================

export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).populate('profile');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // console.log(req.body);
    const { name, studentClass, location } = req.body;

    // Update basic fields
    if (name) user.name = name;
    if (studentClass) user.class = studentClass;

    // Parse location (string or object)
    if (location) {
      user.location = typeof location === 'string' ? JSON.parse(location) : location;
    }

    // Avatar handling (Multer + Cloudinary)
    if (req.file) {
      user.avatar = req.file.path;
    }

    user.isProfileComplete = true;
    await user.save();

    // Optional: also update Profile model for compatibility
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) profile = new Profile({ user: user._id });

    profile.username = name;
    profile.studentClass = studentClass;
    if (req.file) profile.avatar = req.file.path;
    profile.isPhoneVerified = true;
    await profile.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        class: user.studentClass,
        avatar: user.avatar,
        location: user.location,
        isProfileComplete: user.isProfileComplete,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const renderAdminLogin = (req, res) => {
  res.send(`
    <html>
      <body>
        <h2>Admin Login</h2>
        <form method="POST" action="/api/admin/login">
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `);
};


export const adminLogin = async (req, res) => {
  try {
    const { password } = req.body;

    const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'admin').trim();
    const ADMIN_PHONE = process.env.ADMIN_PHONE || '1234567890';
    const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';


    if (!password || password.trim() !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password',
      });
    }

    // Find any existing admin user to attach the session to
    // We do NOT rely on email since the User model might not support it
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        phone: ADMIN_PHONE,
        name: ADMIN_NAME,
        role: 'admin',
        isProfileComplete: true,
      });
    }

    const token = generateToken(adminUser._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        role: adminUser.role,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const addEducator = async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone number",
      });
    }

    let user = await User.findOne({ phone });

    if (user) {
      user.role = "educator";
      if (name) user.name = name;
      user.isProfileComplete = true;
      await user.save();
    } else {
      user = await User.create({
        phone,
        name,
        role: "educator",
        isProfileComplete: true,
      });
    }

    res.status(201).json({
      success: true,
      message: "Educator added successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
