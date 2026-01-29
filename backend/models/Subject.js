import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subject name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Subject code is required'],
        unique: true,
        uppercase: true
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
    assignedTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        default: null
    },
    credits: {
        type: Number,
        default: 3
    },
    totalLectures: {
        type: Number,
        default: 0 // Will be incremented as attendance is marked
    }
}, {
    timestamps: true
});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
