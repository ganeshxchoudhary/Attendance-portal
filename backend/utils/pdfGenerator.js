import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateAttendanceReport = async (studentData, attendanceData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `attendance_${studentData.rollNumber}_${Date.now()}.pdf`;
            const filePath = path.join(__dirname, '..', 'temp', fileName);

            // Create temp directory if it doesn't exist
            const tempDir = path.join(__dirname, '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Header
            doc.fontSize(20).text('Attendance Report', { align: 'center' });
            doc.moveDown();

            // Student Details
            doc.fontSize(14).text('Student Information', { underline: true });
            doc.fontSize(11);
            doc.text(`Name: ${studentData.name}`);
            doc.text(`Roll Number: ${studentData.rollNumber}`);
            doc.text(`Department: ${studentData.department}`);
            doc.text(`Semester: ${studentData.semester}`);
            doc.moveDown();

            // Overall Statistics
            doc.fontSize(14).text('Overall Attendance', { underline: true });
            doc.fontSize(11);
            doc.text(`Total Classes: ${attendanceData.totalClasses}`);
            doc.text(`Classes Attended: ${attendanceData.attended}`);
            doc.text(`Overall Percentage: ${attendanceData.overallPercentage}%`);
            doc.moveDown();

            // Subject-wise breakdown
            doc.fontSize(14).text('Subject-wise Attendance', { underline: true });
            doc.fontSize(10);

            attendanceData.subjects.forEach((subject) => {
                doc.text(`\n${subject.name} (${subject.code})`);
                doc.text(`  Present: ${subject.present} / ${subject.total} (${subject.percentage}%)`);
            });

            doc.moveDown();
            doc.fontSize(8).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });

            doc.end();

            writeStream.on('finish', () => {
                resolve(filePath);
            });

            writeStream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};
