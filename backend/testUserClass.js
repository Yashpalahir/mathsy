import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).select('email name role studentClass');

        console.log('\n=== All Users ===');
        users.forEach(user => {
            console.log(`
Email: ${user.email}
Name: ${user.name}
Role: ${user.role}
StudentClass: ${user.studentClass || 'NOT SET'}
---`);
        });

        console.log(`\nTotal users: ${users.length}`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
