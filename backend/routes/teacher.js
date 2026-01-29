import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';
import { generateAttendanceQR, validateQRSession } from '../utils/qrCode.js';
import { generateExcelReport } from '../utils/excelExporter.js';
import { generateAttendanceReport } from '../utils/pdfGenerator.js';
import fs from 'fs';

const router = express.Router();

// Store active QR sessions (in production, use Redis)
const qrSessions = new Map();

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard data
// @access  Private (Teacher)
router.get('/dashboard', protect, authorize('teacher'), async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user._id });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        // Get assigned subjects
        const subjects = await Subject.find({ assignedTeacher: teacher._id });

        // Get recent attendance marked
        const recentAttendance = await Attendance.find({ markedBy: teacher._id })
            .populate('student', 'name rollNumber')
            .populate('subject', 'name code')
            .sort({ markedAt: -1 })
            .limit(20);

        // Calculate statistics
        const stats = {
            totalSubjects: subjects.length,
            totalClassesConducted: await Attendance.distinct('date', { markedBy: teacher._id }).then(dates => dates.length),
            recentlyMarked: recentAttendance.length
        };

        res.json({
            success: true,
            data: {
                teacher: {
                    name: teacher.name,
                    employeeId: teacher.employeeId,
                    department: teacher.department
                },
                subjects,
                stats,
                recentAttendance
            }
        });
    } catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/teacher/attendance/mark
// @desc    Mark attendance manually
// @access  Private (Teacher)
router.post('/attendance/mark', protect, authorize('teacher'), async (req, res) => {
    try {
        const { subjectId, date, attendanceData } = req.body;
        // attendanceData is an array of { studentId, status }

        const teacher = await Teacher.findOne({ userId: req.user._id });
        const subject = await Subject.findById(subjectId);

        if (!subject || subject.assignedTeacher.toString() !== teacher._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to mark attendance for this subject' });
        }

        const attendanceDate = new Date(date);
        const results = [];
        const errors = [];

        for (const record of attendanceData) {
            try {
                // Check if attendance already exists
                const existing = await Attendance.findOne({
                    student: record.studentId,
                    subject: subjectId,
                    date: attendanceDate
                });

                if (existing) {
                    errors.push({
                        studentId: record.studentId,
                        message: 'Attendance already marked for this date'
                    });
                    continue;
                }

                // Create attendance record
                const attendance = await Attendance.create({
                    student: record.studentId,
                    subject: subjectId,
                    date: attendanceDate,
                    status: record.status,
                    markedBy: teacher._id,
                    method: 'manual',
                    ipAddress: req.ip,
                    deviceInfo: req.headers['user-agent']
                });

                results.push(attendance);

                // Create notification for student if absent
                if (record.status === 'absent') {
                    const student = await Student.findById(record.studentId);
                    await Notification.create({
                        user: student.userId,
                        type: 'attendance-marked',
                        title: 'Attendance Marked',
                        message: `You were marked absent in ${subject.name} on ${attendanceDate.toLocaleDateString()}`,
                        priority: 'medium'
                    });
                }
            } catch (err) {
                errors.push({
                    studentId: record.studentId,
                    message: err.message
                });
            }
        }

        // Update subject total lectures
        await Subject.findByIdAndUpdate(subjectId, {
            $inc: { totalLectures: 1 }
        });

        res.json({
            success: true,
            message: `Marked attendance for ${results.length} students`,
            data: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/teacher/attendance/qr/generate
// @desc    Generate QR code for attendance
// @access  Private (Teacher)
router.post('/attendance/qr/generate', protect, authorize('teacher'), async (req, res) => {
    try {
        const { subjectId, date, validityMinutes = 5 } = req.body;

        const teacher = await Teacher.findOne({ userId: req.user._id });
        const subject = await Subject.findById(subjectId);

        if (!subject || subject.assignedTeacher.toString() !== teacher._id.toString()) {
            return res.status(403).json({ message: 'Not authorized for this subject' });
        }

        const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);

        const sessionData = {
            subjectId,
            teacherId: teacher._id.toString(),
            date: new Date(date),
            expiresAt
        };

        const qrResult = await generateAttendanceQR(sessionData);

        // Store session
        qrSessions.set(qrResult.token, {
            ...sessionData,
            token: qrResult.token,
            attendedStudents: []
        });

        // Auto-delete session after expiry
        setTimeout(() => {
            qrSessions.delete(qrResult.token);
        }, validityMinutes * 60 * 1000 + 5000);

        res.json({
            success: true,
            data: {
                qrCode: qrResult.qrCode,
                token: qrResult.token,
                expiresAt: qrResult.expiresAt,
                subject: subject.name
            }
        });
    } catch (error) {
        console.error('QR generation error:', error);
        res.status(500).json({ message: 'Server error generating QR code' });
    }
});

// @route   POST /api/teacher/attendance/qr/validate
// @desc    Validate QR scan and mark attendance
// @access  Private (Student scans this)
router.post('/attendance/qr/validate', protect, authorize('student'), async (req, res) => {
    try {
        const { qrData } = req.body;

        const parsedData = JSON.parse(qrData);
        const session = qrSessions.get(parsedData.token);

        const validation = validateQRSession(qrData, session);

        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const student = await Student.findOne({ userId: req.user._id });

        // Check if student already marked via QR
        if (session.attendedStudents.includes(student._id.toString())) {
            return res.status(400).json({ message: 'You have already marked attendance' });
        }

        // Check if attendance already exists
        const existing = await Attendance.findOne({
            student: student._id,
            subject: validation.data.subjectId,
            date: validation.data.date
        });

        if (existing) {
            return res.status(400).json({ message: 'Attendance already marked for today' });
        }

        // Mark attendance
        const attendance = await Attendance.create({
            student: student._id,
            subject: validation.data.subjectId,
            date: validation.data.date,
            status: 'present',
            markedBy: validation.data.teacherId,
            method: 'qr',
            ipAddress: req.ip,
            deviceInfo: req.headers['user-agent']
        });

        // Add student to session
        session.attendedStudents.push(student._id.toString());

        // Create notification
        const subject = await Subject.findById(validation.data.subjectId);
        await Notification.create({
            user: req.user._id,
            type: 'attendance-marked',
            title: 'Attendance Marked',
            message: `Your attendance has been marked for ${subject.name}`,
            priority: 'low'
        });

        res.json({
            success: true,
            message: 'Attendance marked successfully',
            data: attendance
        });
    } catch (error) {
        console.error('QR validation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/teacher/attendance/qr/status/:token
// @desc    Get QR session status (how many students marked)
// @access  Private (Teacher)
router.get('/attendance/qr/status/:token', protect, authorize('teacher'), async (req, res) => {
    try {
        const session = qrSessions.get(req.params.token);

        if (!session) {
            return res.status(404).json({ message: 'Session not found or expired' });
        }

        const students = await Student.find({
            _id: { $in: session.attendedStudents }
        }).select('name rollNumber');

        res.json({
            success: true,
            data: {
                totalMarked: session.attendedStudents.length,
                students,
                expiresAt: session.expiresAt
            }
        });
    } catch (error) {
        console.error('QR status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/teacher/attendance/edit/:id
// @desc    Edit attendance with reason
// @access  Private (Teacher)
router.put('/attendance/edit/:id', protect, authorize('teacher'), async (req, res) => {
    try {
        const { status, reason } = req.body;

        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        const teacher = await Teacher.findOne({ userId: req.user._id });

        // Save change to log
        attendance.changeLog.push({
            changedBy: req.user._id,
            previousStatus: attendance.status,
            newStatus: status,
            reason,
            changedAt: new Date()
        });

        attendance.status = status;
        await attendance.save();

        res.json({
            success: true,
            message: 'Attendance updated successfully',
            data: attendance
        });
    } catch (error) {
        console.error('Edit attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/teacher/analytics/:subjectId
// @desc    Get class analytics
// @access  Private (Teacher)
router.get('/analytics/:subjectId', protect, authorize('teacher'), async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user._id });
        const subject = await Subject.findById(req.params.subjectId);

        if (!subject || subject.assignedTeacher.toString() !== teacher._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get all students in the subject's department and semester
        const students = await Student.find({
            department: subject.department,
            semester: subject.semester
        });

        // Get attendance for each student
        const studentStats = await Promise.all(
            students.map(async (student) => {
                const attendance = await Attendance.find({
                    student: student._id,
                    subject: subject._id
                });

                const total = attendance.length;
                const present = attendance.filter(a => a.status === 'present').length;
                const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

                return {
                    student: {
                        id: student._id,
                        name: student.name,
                        rollNumber: student.rollNumber
                    },
                    total,
                    present,
                    absent: attendance.filter(a => a.status === 'absent').length,
                    leave: attendance.filter(a => a.status === 'leave').length,
                    percentage: parseFloat(percentage)
                };
            })
        );

        // Get attendance trend (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const trend = await Attendance.aggregate([
            {
                $match: {
                    subject: subject._id,
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    present: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Defaulters (below 75%)
        const defaulters = studentStats.filter(s => s.percentage < 75);

        res.json({
            success: true,
            data: {
                subject: {
                    name: subject.name,
                    code: subject.code,
                    totalLectures: subject.totalLectures
                },
                studentStats,
                defaulters,
                trend
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/teacher/export/excel/:subjectId
// @desc    Export attendance to Excel
// @access  Private (Teacher)
router.get('/export/excel/:subjectId', protect, authorize('teacher'), async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user._id });
        const subject = await Subject.findById(req.params.subjectId);

        if (!subject || subject.assignedTeacher.toString() !== teacher._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get students and attendance
        const students = await Student.find({
            department: subject.department,
            semester: subject.semester
        });

        const attendanceData = await Promise.all(
            students.map(async (student) => {
                const attendance = await Attendance.find({
                    student: student._id,
                    subject: subject._id
                });

                const total = attendance.length;
                const present = attendance.filter(a => a.status === 'present').length;
                const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

                return {
                    rollNumber: student.rollNumber,
                    name: student.name,
                    present,
                    absent: attendance.filter(a => a.status === 'absent').length,
                    leave: attendance.filter(a => a.status === 'leave').length,
                    total,
                    percentage
                };
            })
        );

        const filePath = await generateExcelReport(attendanceData, {
            name: subject.name,
            code: subject.code
        });

        res.download(filePath, `attendance_${subject.code}.xlsx`, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Excel export error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/teacher/subjects/:id/students
// @desc    Get students enrolled in a subject (by dept & semester)
// @access  Private (Teacher)
router.get('/subjects/:id/students', protect, authorize('teacher'), async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user._id });
        const subject = await Subject.findById(req.params.id);

        if (!subject || subject.assignedTeacher.toString() !== teacher._id.toString()) {
            return res.status(403).json({ message: 'Not authorized for this subject' });
        }

        // Get students based on department and semester
        const students = await Student.find({
            department: subject.department,
            semester: subject.semester
        }).select('name rollNumber email userId profileImage');

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Get subject students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
