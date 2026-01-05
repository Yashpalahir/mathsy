import Enrollment from '../models/Enrollment.js';
import Attendance from '../models/Attendance.js';
import TestResult from '../models/TestResult.js';

// @desc    Get student dashboard statistics
// @route   GET /api/dashboard/student-stats
// @access  Private (Student)
export const getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get Enrolled Courses Count
    const enrolledCoursesCount = await Enrollment.countDocuments({
      student: studentId,
      status: 'active'
    });

    // 2. Get Classes Attended Count
    const classesAttendedCount = await Attendance.countDocuments({
      studentId: studentId
    });

    // 3. Get Tests Completed Count
    const testsCompletedCount = await TestResult.countDocuments({
      student: studentId
    });

    // 4. Get Average Score
    const testResults = await TestResult.find({ student: studentId });
    let avgScore = 0;
    if (testResults.length > 0) {
      const totalPercentage = testResults.reduce((sum, result) => sum + result.percentage, 0);
      avgScore = Math.round(totalPercentage / testResults.length);
    }

    // 5. Get Recent Tests
    const recentTests = await TestResult.find({ student: studentId })
      .populate('test', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          enrolledCourses: enrolledCoursesCount,
          classesAttended: classesAttendedCount,
          testsCompleted: testsCompletedCount,
          avgScore: avgScore
        },
        recentTests: recentTests.map(result => ({
          name: result.test?.name || 'Unknown Test',
          score: `${result.obtainedMarks}/${result.totalMarks}`,
          date: result.createdAt,
          percentage: result.percentage,
          status: result.status
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};



