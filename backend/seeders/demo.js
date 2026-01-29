import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';

dotenv.config();

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Electrical'];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await Subject.deleteMany({});
        await Attendance.deleteMany({});
        await Notification.deleteMany({});

        // Create admin user
        console.log('👤 Creating admin user...');
        const adminUser = await User.create({
            email: 'admin@college.edu',
            password: 'admin123',
            role: 'admin',
            isApproved: true
        });
        console.log('✅ Admin created: admin@college.edu / admin123');

        // Create teachers
        console.log('\n👨‍🏫 Creating teachers...');
        const teachers = [];
        for (let i = 1; i <= 10; i++) {
            const dept = departments[(i - 1) % departments.length];
            const teacherUser = await User.create({
                email: `teacher${i}@college.edu`,
                password: 'teacher123',
                role: 'teacher',
                isApproved: true
            });

            const teacher = await Teacher.create({
                userId: teacherUser._id,
                email: teacherUser.email,
                name: `Prof. Teacher ${i}`,
                employeeId: `T${String(i).padStart(4, '0')}`,
                department: dept,
                phone: `+91${9000000000 + i}`
            });

            teachers.push(teacher);
            console.log(`✅ Teacher ${i}: teacher${i}@college.edu / teacher123`);
        }

        // Create subjects
        console.log('\n📚 Creating subjects...');
        const subjects = [];
        const subjectNames = [
            'Programming Principles and Practice with C and C++',
            'Computer Organization and Architecture',
            'OJT / Frontend Developer (HTML, CSS, JS)',
            'English Communication - Foundation',
            'Fundamentals of Business',
            'Mathematics for Computer Science',
            // Original subjects (minus Data Structures)
            'Algorithms', 'Database Management', 'Operating Systems',
            'Computer Networks', 'Software Engineering', 'Web Development', 'Artificial Intelligence',
            'Machine Learning', 'Cyber Security', 'Cloud Computing', 'Mobile Development',
            'Digital Electronics', 'Microprocessors', 'Signal Processing', 'Control Systems',
            'Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Manufacturing'
        ];

        for (let i = 0; i < subjectNames.length; i++) {
            // Force first 6 subjects to be in CS, Sem 1 for easy demo/testing
            const isRequestedSubject = i < 6;
            const dept = isRequestedSubject ? 'Computer Science' : departments[i % departments.length];
            const semester = isRequestedSubject ? 1 : (i % 8) + 1;
            const teacher = teachers.find(t => t.department === dept);

            const subject = await Subject.create({
                name: subjectNames[i],
                code: `SUB${String(i + 1).padStart(3, '0')}`,
                department: dept,
                semester: semester,
                assignedTeacher: teacher ? teacher._id : teachers[0]._id,
                credits: 3,
                totalLectures: 0
            });

            subjects.push(subject);
            console.log(`✅ Subject: ${subject.code} - ${subject.name} (${dept}, Sem ${semester})`);
        }

        // Create students
        console.log('\n🎓 Creating students...');
        const students = [];
        for (let i = 1; i <= 50; i++) {
            const dept = departments[(i - 1) % departments.length];
            const semester = ((i - 1) % 8) + 1;
            const year = new Date().getFullYear() - Math.floor((semester - 1) / 2);

            const studentUser = await User.create({
                email: `student${i}@college.edu`,
                password: 'student123',
                role: 'student',
                isApproved: true
            });

            const student = await Student.create({
                userId: studentUser._id,
                email: studentUser.email,
                name: `Student ${i}`,
                rollNumber: `${year}${dept.substring(0, 2).toUpperCase()}${String(i).padStart(3, '0')}`,
                department: dept,
                semester: semester,
                enrollmentYear: year,
                phone: `+91${8000000000 + i}`
            });

            students.push(student);

            if (i % 10 === 0) {
                console.log(`✅ Created ${i} students...`);
            }
        }
        console.log(`✅ Total students created: ${students.length}`);

        // Create attendance records (last 60 days)
        console.log('\n📝 Creating attendance records...');
        let attendanceCount = 0;
        const today = new Date();

        for (const subject of subjects) {
            // Get students for this subject's department and semester
            const subjectStudents = students.filter(
                s => s.department === subject.department && s.semester === subject.semester
            );

            if (subjectStudents.length === 0) continue;

            // Create attendance for last 30 days (3-4 classes per week)
            const daysToCreate = [0, 2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 28, 30];

            for (const daysAgo of daysToCreate) {
                const attendanceDate = new Date(today);
                attendanceDate.setDate(today.getDate() - daysAgo);
                attendanceDate.setHours(10, 0, 0, 0);

                for (const student of subjectStudents) {
                    // Randomize attendance with 80% present rate
                    const random = Math.random();
                    let status;
                    if (random < 0.80) {
                        status = 'present';
                    } else if (random < 0.95) {
                        status = 'absent';
                    } else {
                        status = 'leave';
                    }

                    await Attendance.create({
                        student: student._id,
                        subject: subject._id,
                        date: attendanceDate,
                        status: status,
                        markedBy: subject.assignedTeacher,
                        method: Math.random() > 0.7 ? 'qr' : 'manual',
                        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                        deviceInfo: 'Demo Device'
                    });

                    attendanceCount++;
                }

                // Update subject total lectures
                await Subject.findByIdAndUpdate(subject._id, {
                    $inc: { totalLectures: 1 }
                });
            }
        }
        console.log(`✅ Created ${attendanceCount} attendance records`);

        // Create notifications for students with low attendance
        console.log('\n🔔 Creating notifications...');
        let notificationCount = 0;
        for (const student of students.slice(0, 20)) {
            await Notification.create({
                user: student.userId,
                type: 'low-attendance',
                title: 'Low Attendance Alert',
                message: 'Your attendance is below 75% in one or more subjects. Please improve your attendance.',
                priority: 'high'
            });
            notificationCount++;
        }
        console.log(`✅ Created ${notificationCount} notifications`);

        console.log('\n✨ Demo data seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin:    admin@college.edu / admin123');
        console.log('Teacher:  teacher1@college.edu / teacher123');
        console.log('          (teacher1 to teacher10)');
        console.log('Student:  student1@college.edu / student123');
        console.log('          (student1 to student50)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();
