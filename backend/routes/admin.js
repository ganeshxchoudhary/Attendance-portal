import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await Teacher.countDocuments();
        const totalSubjects = await Subject.countDocuments();
        const pendingTeachers = await User.countDocuments({ role: 'teacher', isApproved: false });

        // Overall attendance percentage
        const totalAttendance = await Attendance.countDocuments();
        const presentCount = await Attendance.countDocuments({ status: 'present' });
        const overallPercentage = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(2) : 0;

        // Recent activity
        const recentActivity = await Attendance.find()
            .populate('student', 'name rollNumber')
            .populate('subject', 'name code')
            .populate('markedBy', 'name')
            .sort({ markedAt: -1 })
            .limit(15);

        res.json({
            success: true,
            data: {
                stats: {
                    totalStudents,
                    totalTeachers,
                    totalSubjects,
                    pendingTeachers,
                    overallAttendance: parseFloat(overallPercentage)
                },
                recentActivity
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==== STUDENT MANAGEMENT ====

// @route   GET /api/admin/students
// @desc    Get all students with filters
// @access  Private (Admin)
router.get('/students', protect, authorize('admin'), async (req, res) => {
    try {
        const { department, semester, search } = req.query;

        let query = {};

        if (department) query.department = department;
        if (semester) query.semester = parseInt(semester);
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const students = await Student.find(query).sort({ rollNumber: 1 });

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/students
// @desc    Add new student
// @access  Private (Admin)
router.post('/students', protect, authorize('admin'), async (req, res) => {
    try {
        const { email, password, name, rollNumber, department, semester, enrollmentYear, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Check if roll number exists
        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this roll number already exists' });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            role: 'student',
            isApproved: true
        });

        // Create student profile
        const student = await Student.create({
            userId: user._id,
            email,
            name,
            rollNumber,
            department,
            semester,
            enrollmentYear,
            phone
        });

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            data: student
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   PUT /api/admin/students/:id
// @desc    Update student
// @access  Private (Admin)
router.put('/students/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, department, semester, phone } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { name, department, semester, phone },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: student
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete('/students/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete user account
        await User.findByIdAndDelete(student.userId);

        // Delete attendance records
        await Attendance.deleteMany({ student: student._id });

        // Delete notifications
        await Notification.deleteMany({ user: student.userId });

        // Delete student profile
        await Student.findByIdAndDelete(student._id);

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==== TEACHER MANAGEMENT ====

// @route   GET /api/admin/teachers
// @desc    Get all teachers
// @access  Private (Admin)
router.get('/teachers', protect, authorize('admin'), async (req, res) => {
    try {
        const { department, approved } = req.query;

        let userQuery = { role: 'teacher' };
        let teacherQuery = {};

        if (approved !== undefined) {
            userQuery.isApproved = approved === 'true';
        }
        if (department) {
            teacherQuery.department = department;
        }

        const users = await User.find(userQuery).select('-password');
        const userIds = users.map(u => u._id);

        const teachers = await Teacher.find({
            userId: { $in: userIds },
            ...teacherQuery
        }).populate('assignedSubjects');

        // Merge user and teacher data
        const teachersWithStatus = teachers.map(teacher => {
            const user = users.find(u => u._id.toString() === teacher.userId.toString());
            return {
                ...teacher.toObject(),
                isApproved: user.isApproved
            };
        });

        res.json({
            success: true,
            data: teachersWithStatus
        });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/teachers
// @desc    Add new teacher
// @access  Private (Admin)
router.post('/teachers', protect, authorize('admin'), async (req, res) => {
    try {
        const { email, password, name, employeeId, department, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const existingTeacher = await Teacher.findOne({ employeeId });
        if (existingTeacher) {
            return res.status(400).json({ message: 'Teacher with this employee ID already exists' });
        }

        const user = await User.create({
            email,
            password,
            role: 'teacher',
            isApproved: true
        });

        const teacher = await Teacher.create({
            userId: user._id,
            email,
            name,
            employeeId,
            department,
            phone
        });

        res.status(201).json({
            success: true,
            message: 'Teacher added successfully',
            data: teacher
        });
    } catch (error) {
        console.error('Add teacher error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   PUT /api/admin/teachers/:id/approve
// @desc    Approve teacher account
// @access  Private (Admin)
router.put('/teachers/:id/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        await User.findByIdAndUpdate(teacher.userId, { isApproved: true });

        // Send notification
        await Notification.create({
            user: teacher.userId,
            type: 'approval',
            title: 'Account Approved',
            message: 'Your teacher account has been approved by the admin. You can now access all features.',
            priority: 'high'
        });

        res.json({
            success: true,
            message: 'Teacher approved successfully'
        });
    } catch (error) {
        console.error('Approve teacher error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/teachers/:id
// @desc    Delete teacher
// @access  Private (Admin)
router.delete('/teachers/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Unassign from subjects
        await Subject.updateMany(
            { assignedTeacher: teacher._id },
            { $unset: { assignedTeacher: 1 } }
        );

        await User.findByIdAndDelete(teacher.userId);
        await Notification.deleteMany({ user: teacher.userId });
        await Teacher.findByIdAndDelete(teacher._id);

        res.json({
            success: true,
            message: 'Teacher deleted successfully'
        });
    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==== SUBJECT MANAGEMENT ====

// @route   GET /api/admin/subjects
// @desc    Get all subjects
// @access  Private (Admin)
router.get('/subjects', protect, authorize('admin'), async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate('assignedTeacher', 'name employeeId')
            .sort({ department: 1, semester: 1 });

        res.json({
            success: true,
            data: subjects
        });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/subjects
// @desc    Add new subject
// @access  Private (Admin)
router.post('/subjects', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, code, department, semester, credits, assignedTeacher } = req.body;

        const existingSubject = await Subject.findOne({ code });
        if (existingSubject) {
            return res.status(400).json({ message: 'Subject with this code already exists' });
        }

        const subject = await Subject.create({
            name,
            code,
            department,
            semester,
            credits,
            assignedTeacher: assignedTeacher || null
        });

        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            data: subject
        });
    } catch (error) {
        console.error('Add subject error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   PUT /api/admin/subjects/:id
// @desc    Update subject
// @access  Private (Admin)
router.put('/subjects/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, department, semester, credits, assignedTeacher } = req.body;

        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            { name, department, semester, credits, assignedTeacher },
            { new: true, runValidators: true }
        ).populate('assignedTeacher', 'name employeeId');

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.json({
            success: true,
            message: 'Subject updated successfully',
            data: subject
        });
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/subjects/:id
// @desc    Delete subject
// @access  Private (Admin)
router.delete('/subjects/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Delete associated attendance records
        await Attendance.deleteMany({ subject: subject._id });
        await Subject.findByIdAndDelete(subject._id);

        res.json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==== AUDIT & ELIGIBILITY ====

// @route   GET /api/admin/audit
// @desc    Get attendance accuracy audit
// @access  Private (Admin)
router.get('/audit', protect, authorize('admin'), async (req, res) => {
    try {
        // Find suspicious patterns

        // 1. Multiple entries from different IPs on same day
        const multipleIPs = await Attendance.aggregate([
            {
                $match: {
                    ipAddress: { $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        student: '$student',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
                    },
                    ips: { $addToSet: '$ipAddress' },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    $expr: { $gt: [{ $size: '$ips' }, 1] }
                }
            }
        ]);

        // 2. Records with change history
        const modifiedRecords = await Attendance.find({
            'changeLog.0': { $exists: true }
        })
            .populate('student', 'name rollNumber')
            .populate('subject', 'name code')
            .populate('changeLog.changedBy', 'email')
            .limit(50);

        // 3. Recent admin overrides
        const adminOverrides = await Attendance.find({
            method: 'admin-override'
        })
            .populate('student', 'name rollNumber')
            .populate('subject', 'name code')
            .populate('markedBy', 'name')
            .sort({ markedAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: {
                suspiciousIPs: multipleIPs.length,
                modifiedRecords: modifiedRecords.length,
                adminOverrides: adminOverrides.length,
                details: {
                    modifiedRecords: modifiedRecords.slice(0, 20),
                    adminOverrides
                }
            }
        });
    } catch (error) {
        console.error('Audit error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/eligibility/:studentId
// @desc    Check exam eligibility
// @access  Private (Admin)
router.get('/eligibility/:studentId', protect, authorize('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const subjects = await Subject.find({
            department: student.department,
            semester: student.semester
        });

        const eligibility = await Promise.all(
            subjects.map(async (subject) => {
                const attendance = await Attendance.find({
                    student: student._id,
                    subject: subject._id
                });

                const total = attendance.length;
                const present = attendance.filter(a => a.status === 'present').length;
                const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
                const isEligible = parseFloat(percentage) >= 75;

                return {
                    subject: {
                        id: subject._id,
                        name: subject.name,
                        code: subject.code
                    },
                    attendance: {
                        total,
                        present,
                        percentage: parseFloat(percentage)
                    },
                    isEligible,
                    shortfall: isEligible ? 0 : Math.ceil((0.75 * total) - present)
                };
            })
        );

        const overallEligible = eligibility.every(e => e.isEligible);

        res.json({
            success: true,
            data: {
                student: {
                    name: student.name,
                    rollNumber: student.rollNumber,
                    department: student.department,
                    semester: student.semester
                },
                overallEligible,
                subjects: eligibility
            }
        });
    } catch (error) {
        console.error('Eligibility check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/logs
// @desc    Get system activity logs
// @access  Private (Admin)
router.get('/logs', protect, authorize('admin'), async (req, res) => {
    try {
        const { limit = 100 } = req.query;

        // Get recent attendance with full details
        const logs = await Attendance.find()
            .populate('student', 'name rollNumber')
            .populate('subject', 'name code')
            .populate('markedBy', 'name employeeId')
            .sort({ markedAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Logs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
