import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Otp from '../models/Otp.js';
import Educator from '../models/Educator.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD) {
  console.warn("⚠️ Admin credentials are not fully configured in environment variables.");
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, otp, studentClass } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Validate studentClass if provided (Class 6-10)
    const validClasses = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    if (studentClass && !validClasses.includes(studentClass)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class selection. Please select a class from 6 to 10.',
      });
    }

    // Verify OTP if provided (Highly recommended to enforce)
    if (otp) {
      const validOtp = await Otp.findOne({ email, otp });
      if (!validOtp) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
      // Delete OTP after usage
      await Otp.findOneAndDelete({ email, otp });
    } else {
      // NOTE: For security, you should enforce OTP here.
      // return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      phone,
      studentClass: studentClass || undefined,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).populate('profile');
    
    if (!user) {
      user = await Educator.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('👤 [GET ME] Fetching data for:', user.email);
    console.log('👤 [GET ME] Role:', user.role);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name || 'Educator',
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete || (user.role === 'educator'),
        profile: user.profile || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Render simple admin login page
// @route   GET /api/admin
// @access  Public (password protected in POST)
export const renderAdminLogin = (req, res) => {
  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin Login</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); width: 360px; }
          h1 { margin-top: 0; font-size: 20px; }
          input { width: 100%; padding: 10px; margin: 12px 0; border-radius: 4px; border: 1px solid #ccc; }
          button { width: 100%; padding: 10px; background: #2563eb; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
          button:disabled { opacity: 0.6; cursor: not-allowed; }
          .message { margin-top: 12px; font-size: 14px; }
          .success { color: #16a34a; }
          .error { color: #dc2626; }
          pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Admin Login</h1>
          <p>Enter the admin password to get a JWT token.</p>
          <form id="admin-form">
            <input type="password" id="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
            <div class="message" id="message"></div>
            <div id="token-container" style="display:none;">
              <p class="success">Success! Here is your token:</p>
              <pre id="token"></pre>
              <p class="message">Use this token as Bearer in Authorization header for admin APIs.</p>
            </div>
          </form>
        </div>
        <script>
          const form = document.getElementById('admin-form');
          const messageEl = document.getElementById('message');
          const tokenBox = document.getElementById('token-container');
          const tokenPre = document.getElementById('token');
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            messageEl.textContent = '';
            tokenBox.style.display = 'none';
            const password = document.getElementById('password').value;
            const btn = form.querySelector('button');
            btn.disabled = true;
            try {
              const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
              });
              const data = await res.json();
              if (!res.ok || !data.success) {
                throw new Error(data.message || 'Login failed');
              }
              tokenPre.textContent = data.token;
              tokenBox.style.display = 'block';
              messageEl.textContent = '';
            } catch (err) {
              messageEl.textContent = err.message || 'Login failed';
              messageEl.className = 'message error';
            } finally {
              btn.disabled = false;
            }
          });
        </script>
      </body>
    </html>
  `);
};

// @desc    Admin password login -> returns JWT
// @route   POST /api/admin/login
// @access  Public (password protected)
export const adminLogin = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password',
      });
    }

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
        phone: adminUser.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in separate collection
    await Otp.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email
    const message = `Your OTP for Mathsy login/signup is: ${otp}. It expires in 10 minutes.`;

    try {
      await sendEmail({
        email,
        subject: 'Mathsy OTP Verification',
        message: message,
        html: `<h1>Mathsy OTP Verification</h1><p>${message}</p>`
      });

      res.status(200).json({
        success: true,
        message: `OTP sent to ${email}`,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP (without login or creation)
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Provide email and OTP' });
    }

    const validOtp = await Otp.findOne({ email, otp });

    if (validOtp) {
      res.status(200).json({ success: true, message: 'OTP Verified' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login or Verify with OTP
// @route   POST /api/auth/login-otp
// @access  Public
export const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Provide email and OTP' });
    }

    // 1. Verify OTP from Otp collection
    const validOtp = await Otp.findOne({ email, otp });

    // 2. Check if user acts (for legacy or just validation if we kept logic there, but now we use Otp model)
    // Actually, we should check invalid OTP first.
    if (!validOtp) {
      // Check legacy user field just in case? No, let's stick to new model logic for consistency.
      // Or if verified via User model (old way)?
      // Let's assume we migrated fully.
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // OTP is valid. Now check if User exists.
    let user = await User.findOne({ email });

    if (!user) {
      // New User -> Return success but no token (frontend should redirect to Signup details)
      return res.status(200).json({
        success: true,
        message: 'OTP Verified',
        isNewUser: true,
        // No token yet, because they need to register
      });
    }

    // Existing User -> Login
    // Clear OTP from collection
    await Otp.findOneAndDelete({ email });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
      isNewUser: false,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google Auth (Mocked for now)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, photo } = req.body; // In real app, verify ID token

    // MOCK VERIFICATION: We accept the data sent from frontend for now.

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        googleId,
        avatar: photo,
        role: 'student',
        isProfileComplete: false,
      });
    } else {
      // Update googleId if missing
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save({ validateBeforeSave: false });
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        avatar: user.avatar,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete Profile
// @route   POST /api/auth/complete-profile
// @access  Private
export const completeProfile = async (req, res) => {
  try {
    // User is already authenticated via Token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { username, studentClass, address, phone } = req.body;

    // Basic validation
    if (!username || !studentClass || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    let profile = await Profile.findOne({ user: user._id });

    if (!profile) {
      profile = new Profile({ user: user._id });
    }

    // Update fields
    profile.username = username;
    profile.studentClass = studentClass;
    profile.address = address;
    if (phone) profile.phone = phone;

    // Handle avatar upload if present (now via Cloudinary)
    if (req.file) {
      profile.avatar = req.file.path; // Multer-Cloudinary sets path to the URL
    }

    // Ensure phone is verified before marking profile as complete
    if (!profile.isPhoneVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number must be verified before completing profile' 
      });
    }

    await profile.save();

    user.isProfileComplete = true;
    await user.save();

    const populatedUser = await User.findById(user._id).populate('profile');

    res.status(200).json({
      success: true,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        isProfileComplete: populatedUser.isProfileComplete,
        profile: populatedUser.profile
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP to Phone (Handled by Firebase on frontend)
// @route   POST /api/auth/send-whatsapp-otp
// @access  Private
export const sendWhatsAppOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Please provide a phone number' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update phone in Profile
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = new Profile({ user: user._id, phone });
    } else {
      profile.phone = phone;
    }
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Phone number updated. OTP should be handled by frontend via Firebase.`,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Phone (Acknowledge Firebase verification)
// @route   POST /api/auth/verify-whatsapp-otp
// @access  Private
export const verifyWhatsAppOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Mark as verified in Profile
    const profile = await Profile.findOne({ user: user._id });
    if (profile) {
      profile.isPhoneVerified = true;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Phone number marked as verified',
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new educator
// @route   POST /api/admin/add-educator
// @access  Private (Admin only)
export const addEducator = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const educatorExists = await Educator.findOne({ email });
    if (educatorExists) {
      return res.status(400).json({
        success: false,
        message: 'Educator already exists with this email',
      });
    }

    console.log(`[ADMIN] Adding educator: ${email}`);
    const educator = await Educator.create({
      email,
      password,
    });
    console.log(`[ADMIN] Educator created successfully: ${educator._id}`);

    res.status(201).json({
      success: true,
      data: educator,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Educator login
// @route   POST /api/auth/educator-login
// @access  Public
export const educatorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    console.log(`[AUTH] Educator login attempt: ${email}`);
    const educator = await Educator.findOne({ email, role: 'educator' });
    if (!educator) {
      console.log(`[AUTH] Educator not found or role mismatch: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log(`[AUTH] Educator found, checking password...`);
    const isMatch = await educator.matchPassword(password);
    console.log(`[AUTH] Password match result: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(educator._id);
    console.log(`[AUTH] Login successful, token generated for: ${email}`);
    console.log(`[AUTH] Returning user data: role=${educator.role}, id=${educator._id}`);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: educator._id,
        email: educator.email,
        role: 'educator',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

