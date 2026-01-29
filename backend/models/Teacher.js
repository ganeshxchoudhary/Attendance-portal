import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
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
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
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
    phone: {
        type: String,
        default: null
    },
    profilePicture: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for assigned subjects
teacherSchema.virtual('assignedSubjects', {
    ref: 'Subject',
    localField: '_id',
    foreignField: 'assignedTeacher'
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
