import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StudyMaterial from './models/StudyMaterial.js';
import User from './models/User.js';

dotenv.config();

const testStudyMaterialFiltering = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Get the user
        const user = await User.findOne({ email: 'ayush123@gmail.com' }).select('email studentClass');
        console.log('👤 User Info:');
        console.log(`Email: ${user.email}`);
        console.log(`StudentClass: ${user.studentClass}\n`);

        // Get study materials matching the user's class
        const materials = await StudyMaterial.find({ grade: user.studentClass }).select('-pdf');
        console.log(`📚 Study Materials for ${user.studentClass}:`);
        console.log(`Found: ${materials.length} material(s)\n`);

        materials.forEach(material => {
            console.log(`Title: ${material.title}`);
            console.log(`Category: ${material.category}`);
            console.log(`Grade: ${material.grade}`);
            console.log(`---`);
        });

        // Also show all materials for comparison
        const allMaterials = await StudyMaterial.find({}).select('-pdf');
        console.log(`\n📖 All Available Study Materials:`);
        allMaterials.forEach(material => {
            console.log(`- ${material.title} (${material.grade}) - ${material.category}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testStudyMaterialFiltering();
