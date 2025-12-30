import StudentFeeStatus from "../models/studentFeeStatus.js";

// @desc    Get student fee status
// @route   GET /api/fee-status
// @access  Private (Student)
export const getMyFeeStatus = async (req, res) => {
    try {
        const studentId = req.user._id;

        const feeStatuses = await StudentFeeStatus.find({ student: studentId })
            .populate("course", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: feeStatuses,
        });
    } catch (error) {
        console.error("Error fetching fee status:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc    Create fee status (Admin)
// @route   POST /api/fee-status
// @access  Private (Admin)
export const createFeeStatus = async (req, res) => {
    try {
        const { student, course, month, year, amount, status } = req.body;

        const feeStatus = await StudentFeeStatus.create({
            student,
            course,
            month,
            year,
            amount,
            status,
        });

        res.status(201).json({
            success: true,
            data: feeStatus,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Fee status already exists for this month.",
            });
        }
        console.error("Error creating fee status:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
