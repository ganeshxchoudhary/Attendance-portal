import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required'],
        unique: true,
        uppercase: true
    },
    email: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Electrical']
    },
    semester: {
        type: Number,
        required: [true, 'Semester is required'],
        min: 1,
        max: 8
    },
    enrollmentYear: {
        type: Number,
        required: [true, 'Enrollment year is required']
    },
    profilePicture: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for attendance statistics
studentSchema.virtual('attendanceStats', {
    ref: 'Attendance',
    localField: '_id',
    foreignField: 'student'
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
