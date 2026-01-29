import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Subject from '../models/Subject.js';
import Notification from '../models/Notification.js';
import { generateAttendanceReport } from '../utils/pdfGenerator.js';
import fs from 'fs';

const router = express.Router();

// @route   GET /api/student/dashboard
// @desc    Get student dashboard data
// @access  Private (Student)
router.get('/dashboard', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // Get all attendance records for this student
        const attendanceRecords = await Attendance.find({ student: student._id })
            .populate('subject', 'name code')
            .sort({ date: -1 });

        // Calculate overall statistics
        const totalClasses = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
        const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
        const leaveCount = attendanceRecords.filter(a => a.status === 'leave').length;
        const overallPercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

        // Get subjects for the student's semester and department
        const subjects = await Subject.find({
            department: student.department,
            semester: student.semester
        });

        // Calculate subject-wise attendance
        const subjectStats = subjects.map(subject => {
            const subjectAttendance = attendanceRecords.filter(
                a => a.subject._id.toString() === subject._id.toString()
            );

            const total = subjectAttendance.length;
            const present = subjectAttendance.filter(a => a.status === 'present').length;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

            return {
                subject: {
                    id: subject._id,
                    name: subject.name,
                    code: subject.code
                },
                total,
                present,
                absent: subjectAttendance.filter(a => a.status === 'absent').length,
                leave: subjectAttendance.filter(a => a.status === 'leave').length,
                percentage: parseFloat(percentage)
            };
        });

        // Check if any subject is below 75%
        const lowAttendance = subjectStats.filter(s => s.percentage < 75);

        res.json({
            success: true,
            data: {
                student: {
                    name: student.name,
                    rollNumber: student.rollNumber,
                    department: student.department,
                    semester: student.semester
                },
                overall: {
                    totalClasses,
                    present: presentCount,
                    absent: absentCount,
                    leave: leaveCount,
                    percentage: parseFloat(overallPercentage)
                },
                subjectStats,
                lowAttendance,
                recentAttendance: attendanceRecords.slice(0, 10)
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/student/attendance/subject/:subjectId
// @desc    Get subject-wise detailed attendance
// @access  Private (Student)
router.get('/attendance/subject/:subjectId', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });

        const attendance = await Attendance.find({
            student: student._id,
            subject: req.params.subjectId
        })
            .sort({ date: -1 })
            .populate('markedBy', 'name');

        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Subject attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/student/attendance/monthly
// @desc    Get monthly attendance breakdown
// @access  Private (Student)
router.get('/attendance/monthly', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        const { year, month } = req.query;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const attendance = await Attendance.find({
            student: student._id,
            date: { $gte: startDate, $lte: endDate }
        })
            .populate('subject', 'name code')
            .sort({ date: 1 });

        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Monthly attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/student/report/pdf
// @desc    Generate and download PDF report
// @access  Private (Student)
router.get('/report/pdf', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });

        const attendanceRecords = await Attendance.find({ student: student._id })
            .populate('subject', 'name code');

        // Prepare data for PDF
        const totalClasses = attendanceRecords.length;
        const attended = attendanceRecords.filter(a => a.status === 'present').length;
        const overallPercentage = totalClasses > 0 ? ((attended / totalClasses) * 100).toFixed(2) : 0;

        // Get subjects
        const subjects = await Subject.find({
            department: student.department,
            semester: student.semester
        });

        const subjectData = subjects.map(subject => {
            const subjectAttendance = attendanceRecords.filter(
                a => a.subject._id.toString() === subject._id.toString()
            );

            const total = subjectAttendance.length;
            const present = subjectAttendance.filter(a => a.status === 'present').length;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

            return {
                name: subject.name,
                code: subject.code,
                total,
                present,
                percentage
            };
        });

        const reportData = {
            totalClasses,
            attended,
            overallPercentage,
            subjects: subjectData
        };

        const filePath = await generateAttendanceReport(student, reportData);

        res.download(filePath, `attendance_report_${student.rollNumber}.pdf`, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Delete file after sending
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Server error generating PDF' });
    }
});

// @route   GET /api/student/notifications
// @desc    Get student notifications
// @access  Private (Student)
router.get('/notifications', protect, authorize('student'), async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            isRead: false
        });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    } catch (error) {
        console.error('Notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/student/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (Student)
router.put('/notifications/:id/read', protect, authorize('student'), async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/student/profile
// @desc    Get student profile
// @access  Private (Student)
router.get('/profile', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/student/profile
// @desc    Update student profile
// @access  Private (Student)
router.put('/profile', protect, authorize('student'), async (req, res) => {
    try {
        const { name, department, semester, phone, profilePicture } = req.body;

        // Fields to update - Roll number and Email are excluded by design
        const updateData = {
            name,
            department,
            semester,
            phone,
            profilePicture
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const student = await Student.findOneAndUpdate(
            { userId: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
