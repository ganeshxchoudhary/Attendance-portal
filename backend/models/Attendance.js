import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'leave'],
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    markedAt: {
        type: Date,
        default: Date.now
    },
    method: {
        type: String,
        enum: ['manual', 'qr', 'admin-override'],
        default: 'manual'
    },
    ipAddress: {
        type: String,
        default: null
    },
    deviceInfo: {
        type: String,
        default: null
    },
    changeLog: [{
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        previousStatus: String,
        newStatus: String,
        reason: String,
        changedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Compound index to prevent duplicate attendance for same student on same day for same subject
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ student: 1, subject: 1 });
attendanceSchema.index({ subject: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
