import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mathsy.local';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
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
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
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

