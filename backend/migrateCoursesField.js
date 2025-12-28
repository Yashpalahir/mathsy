// Run this script to migrate existing courses from 'class' field to 'grade' field
// Usage: node migrateCoursesField.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mathsy';

async function migrateCourses() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const coursesCollection = db.collection('courses');

        // Find all courses that have a 'class' field
        const coursesWithClassField = await coursesCollection.find({ class: { $exists: true } }).toArray();

        console.log(`Found ${coursesWithClassField.length} courses with 'class' field`);

        if (coursesWithClassField.length === 0) {
            console.log('No courses to migrate!');
            await mongoose.disconnect();
            return;
        }

        // Update each course: rename 'class' to 'grade' and remove the field
        for (const course of coursesWithClassField) {
            await coursesCollection.updateOne(
                { _id: course._id },
                {
                    $unset: { class: "" }  // Remove the broken 'class' field
                }
            );
            console.log(`✅ Cleaned course: ${course.title}`);
        }

        console.log('✅ Migration complete! You can now create new courses with the grade dropdown.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateCourses();
