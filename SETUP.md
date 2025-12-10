# Mathsy - Full Stack Setup Guide

This guide will help you set up both the backend and frontend for the Mathsy application.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mathsy
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8080
```

**Note:** 
- If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- Change `JWT_SECRET` to a strong random string in production

4. Start MongoDB (if running locally):
```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services panel
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the `frontend` directory if you want to customize the API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080` (as specified in vite.config.ts)

## Creating an Admin User

To create an admin user, you can either:

1. **Use MongoDB directly:**
   - Connect to your MongoDB database
   - Insert a user document in the `users` collection with `role: "admin"`

2. **Use the API:**
   - Register a user via `/api/auth/register` with `role: "admin"` (you may need to temporarily modify the backend to allow this)

3. **Use MongoDB Compass or similar tool:**
   - Create a user with role set to "admin"

## Features

### Backend
- ✅ JWT authentication
- ✅ User roles (student, teacher, admin)
- ✅ Course CRUD operations
- ✅ Enrollment management
- ✅ Contact form submissions
- ✅ MongoDB with Mongoose

### Frontend
- ✅ JWT-based authentication
- ✅ Course listing (fetched from backend)
- ✅ Contact form (submits to backend)
- ✅ Admin dashboard for course management
- ✅ Protected routes based on user roles

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Courses
- `GET /api/courses` - Get all courses (Public)
- `GET /api/courses/:id` - Get single course (Public)
- `POST /api/courses` - Create course (Admin/Teacher)
- `PUT /api/courses/:id` - Update course (Admin/Teacher)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Enrollments
- `GET /api/enrollments` - Get enrollments (Protected)
- `POST /api/enrollments` - Create enrollment (Protected)

### Contact
- `POST /api/contact` - Submit contact form (Public)

## Admin Dashboard

Access the admin dashboard at `/admin` after logging in as an admin user.

Features:
- View all courses
- Create new courses
- Edit existing courses
- Delete courses
- Manage course details (title, description, price, grade, syllabus, etc.)

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check if port 5000 is available

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check CORS settings in backend
- Verify `VITE_API_URL` in frontend `.env` (if set)

### Authentication issues
- Check JWT_SECRET is set in backend `.env`
- Verify token is being stored in localStorage
- Check browser console for errors

## Next Steps

1. Create an admin user
2. Log in as admin
3. Add courses via the admin dashboard
4. Test the full flow: view courses, enroll, contact form

