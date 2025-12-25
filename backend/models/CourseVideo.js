import mongoose from 'mongoose';

const courseVideoSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Please provide a course'],
        },
        title: {
            type: String,
            required: [true, 'Please provide a video title'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        videoUrl: {
            type: String,
            required: [true, 'Please provide a video URL'],
            trim: true,
        },
        duration: {
            type: String, // e.g., "15:30" or "1:45:20"
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        thumbnail: {
            type: String,
            trim: true,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
courseVideoSchema.index({ course: 1, order: 1 });

export default mongoose.model('CourseVideo', courseVideoSchema);
