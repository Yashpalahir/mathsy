import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const educatorSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        role: {
            type: String,
            default: 'educator',
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
educatorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
educatorSchema.methods.matchPassword = async function (enteredPassword) {
    console.log(`[MODEL] Comparing password for educator: ${this.email}`);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`[MODEL] Password match result: ${isMatch}`);
    return isMatch;
};

export default mongoose.model('Educator', educatorSchema);
