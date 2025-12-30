import mongoose from "mongoose";

const studentFeeStatusSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        month: {
            type: String,
            required: true,
            enum: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ],
        },

        year: {
            type: Number,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ["paid", "pending", "overdue"],
            default: "pending",
        },

        paidAt: {
            type: Date,
        },

        paymentMode: {
            type: String,
            enum: ["upi", "card", "netbanking", "cash"],
        },

        transactionId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Prevent duplicate fee entry for same student + course + month + year
 */
studentFeeStatusSchema.index(
    { student: 1, course: 1, month: 1, year: 1 },
    { unique: true }
);

export default mongoose.model("StudentFeeStatus", studentFeeStatusSchema);
