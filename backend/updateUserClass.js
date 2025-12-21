import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const updateUserClass = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update the student user to Class 7 (to match your course)
        const result = await User.updateOne(
            { email: 'ayush123@gmail.com', role: 'student' },
            { $set: { studentClass: 'Class 7' } }
        );

        console.log('\n✅ Update Result:');
        console.log(`Matched: ${result.matchedCount} user(s)`);
        console.log(`Modified: ${result.modifiedCount} user(s)`);

        // Verify the update
        const user = await User.findOne({ email: 'ayush123@gmail.com' }).select('email name studentClass');
        console.log('\n📋 Updated User:');
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name}`);
        console.log(`StudentClass: ${user.studentClass}`);

        await mongoose.connection.close();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateUserClass();
