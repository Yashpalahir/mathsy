# Mathsy Backend API

Node.js + Express + MongoDB backend for the Mathsy application.

## Features

- JWT-based authentication
- User roles: student, teacher, admin
- CRUD operations for courses
- Enrollment management
- Contact form submissions
- MongoDB with Mongoose

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mathsy
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

3. Make sure MongoDB is running on your system.

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
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
- `PUT /api/enrollments/:id` - Update enrollment (Admin)

### Contact
- `POST /api/contact` - Submit contact form (Public)
- `GET /api/contact` - Get all submissions (Admin)
- `PUT /api/contact/:id` - Update submission status (Admin)

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   ├── enrollmentController.js
│   └── contactController.js
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js
│   ├── Course.js
│   ├── Enrollment.js
│   └── Contact.js
├── routes/
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── enrollmentRoutes.js
│   └── contactRoutes.js
├── utils/
│   └── generateToken.js
└── server.js              # Main server file
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## User Roles

- **student**: Can enroll in courses
- **teacher**: Can create and update courses
- **admin**: Full access to all operations

