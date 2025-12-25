import mongoose from "mongoose";

const enrolledCourseSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
})

const EnrolledCourse = mongoose.model("EnrolledCourse", enrolledCourseSchema)

export default EnrolledCourse;