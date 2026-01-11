// ======================================================
// CLEAN BACKEND — ONLY WHAT FRONTEND CURRENTLY USES
// PHONE OTP LOGIN + GET USER + PROFILE COMPLETION
// ADMIN LOGIN + EDUCATOR LOGIN
// ======================================================

import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Otp from '../models/Otp.js';
import Educator from '../models/Educator.js';
import generateToken from '../utils/generateToken.js';
import dotenv from 'dotenv';

dotenv.config();

// ------------------ ADMIN CREDENTIALS ------------------

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mathsy.com';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

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
        name: user.name || '',
        email: user.email,
        phone: user.phone,
        role: user.role,
        phone: user.phone,
        role: user.role,
        class: user.class,
        isProfileComplete: user.isProfileComplete,
        profile: user.profile || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================
// 3️⃣  COMPLETE PROFILE (NAME, CLASS, AVATAR, LOCATION)
//     Used in Login.js (Step 3)
// ==============================================================

export const completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log(req.body);
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

// ==============================================================
// 4️⃣  ADMIN LOGIN PAGE (used by browser, not frontend React)
// ==============================================================

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

// ==============================================================
// 5️⃣  ADMIN LOGIN (simple password → JWT)
// ==============================================================

export const adminLogin = async (req, res) => {
  try {
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password',
      });
    }

    // Make sure admin user exists
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
      adminUser = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
    }

    const token = generateToken(adminUser._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================
// 6️⃣  EDUCATOR LOGIN (email + password)
//     Used when educator logs in separately
// ==============================================================



export const educatorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find educator
    const educator = await Educator.findOne({ email, role: "educator" });
    if (!educator) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await educator.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(educator._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: educator._id,
        email: educator.email,
        role: "educator",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* ============================================================
   ADMIN CREATES NEW EDUCATOR (optional)
   Route: POST /api/admin/add-educator
   Protected: Admin
   ============================================================ */

export const addEducator = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const existing = await Educator.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Educator already exists",
      });
    }

    const educator = await Educator.create({
      email,
      password,
      role: "educator",
    });

    res.status(201).json({
      success: true,
      data: educator,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* ============================================================
   GET CURRENT LOGGED-IN EDUCATOR
   This is part of getMe logic (shared with students)
   ============================================================ */

export const getCurrentEducator = async (req, res) => {
  try {
    const educator = await Educator.findById(req.user.id);

    if (!educator) {
      return res.status(404).json({
        success: false,
        message: "Educator not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: educator._id,
        email: educator.email,
        role: "educator",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};