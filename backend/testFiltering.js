import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import User from './models/User.js';

dotenv.config();

const testCourseFiltering = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Get the user
        const user = await User.findOne({ email: 'ayush123@gmail.com' }).select('email studentClass');
        console.log('👤 User Info:');
        console.log(`Email: ${user.email}`);
        console.log(`StudentClass: ${user.studentClass}\n`);

        // Get courses matching the user's class
        const courses = await Course.find({ grade: user.studentClass });
        console.log(`📚 Courses for ${user.studentClass}:`);
        console.log(`Found: ${courses.length} course(s)\n`);

        courses.forEach(course => {
            console.log(`Title: ${course.title}`);
            console.log(`Grade: ${course.grade}`);
            console.log(`Price: ₹${course.price}`);
            console.log(`---`);
        });

        // Also show all courses for comparison
        const allCourses = await Course.find({});
        console.log(`\n📖 All Available Courses:`);
        allCourses.forEach(course => {
            console.log(`- ${course.title} (${course.grade})`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testCourseFiltering();
