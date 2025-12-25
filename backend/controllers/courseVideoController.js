import CourseVideo from '../models/CourseVideo.js';

// @desc    Get videos for a course
// @route   GET /api/course-videos/:courseId
// @access  Private (only enrolled students)
export const getCourseVideos = async (req, res) => {
    try {
        const { courseId } = req.params;

        // For now, return hardcoded sample videos
        // In production, you would fetch from database: await CourseVideo.find({ course: courseId }).sort({ order: 1 });

        const sampleVideos = [
            {
                _id: '1',
                course: courseId,
                title: 'Introduction to Mathematics',
                description: 'Learn the fundamental concepts of mathematics and problem-solving techniques.',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                duration: '12:45',
                order: 1,
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                isPublished: true,
            },
            {
                _id: '2',
                course: courseId,
                title: 'Algebra Basics - Variables and Equations',
                description: 'Understanding variables, constants, and how to solve basic algebraic equations.',
                videoUrl: 'https://www.youtube.com/watch?v=3fumBcKC6RE',
                duration: '18:30',
                order: 2,
                thumbnail: 'https://img.youtube.com/vi/3fumBcKC6RE/maxresdefault.jpg',
                isPublished: true,
            },
            {
                _id: '3',
                course: courseId,
                title: 'Geometry - Shapes and Angles',
                description: 'Explore different geometric shapes, angles, and their properties.',
                videoUrl: 'https://www.youtube.com/watch?v=yPYZpwSpKmA',
                duration: '22:15',
                order: 3,
                thumbnail: 'https://img.youtube.com/vi/yPYZpwSpKmA/maxresdefault.jpg',
                isPublished: true,
            },
            {
                _id: '4',
                course: courseId,
                title: 'Practice Problems and Solutions',
                description: 'Work through practice problems with step-by-step solutions and explanations.',
                videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
                duration: '25:40',
                order: 4,
                thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
                isPublished: true,
            },
        ];

        res.status(200).json({
            success: true,
            count: sampleVideos.length,
            data: sampleVideos,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

// @desc    Get single video
// @route   GET /api/course-videos/video/:id
// @access  Private
export const getVideo = async (req, res) => {
    try {
        const { id } = req.params;

        // For now, return from hardcoded data
        const sampleVideos = [
            {
                _id: '1',
                title: 'Introduction to Mathematics',
                description: 'Learn the fundamental concepts of mathematics and problem-solving techniques.',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                duration: '12:45',
                order: 1,
            },
            {
                _id: '2',
                title: 'Algebra Basics - Variables and Equations',
                description: 'Understanding variables, constants, and how to solve basic algebraic equations.',
                videoUrl: 'https://www.youtube.com/watch?v=3fumBcKC6RE',
                duration: '18:30',
                order: 2,
            },
            {
                _id: '3',
                title: 'Geometry - Shapes and Angles',
                description: 'Explore different geometric shapes, angles, and their properties.',
                videoUrl: 'https://www.youtube.com/watch?v=yPYZpwSpKmA',
                duration: '22:15',
                order: 3,
            },
            {
                _id: '4',
                title: 'Practice Problems and Solutions',
                description: 'Work through practice problems with step-by-step solutions and explanations.',
                videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
                duration: '25:40',
                order: 4,
            },
        ];

        const video = sampleVideos.find(v => v._id === id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found',
            });
        }

        res.status(200).json({
            success: true,
            data: video,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};
