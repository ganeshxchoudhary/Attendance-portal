import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateExcelReport = async (attendanceData, subjectInfo) => {
    try {
        // Create workbook
        const wb = xlsx.utils.book_new();

        // Prepare data for worksheet
        const wsData = [
            ['Attendance Report'],
            ['Subject:', subjectInfo.name],
            ['Subject Code:', subjectInfo.code],
            ['Generated on:', new Date().toLocaleString()],
            [],
            ['Roll Number', 'Student Name', 'Present', 'Absent', 'Leave', 'Total', 'Percentage']
        ];

        // Add student data
        attendanceData.forEach(student => {
            wsData.push([
                student.rollNumber,
                student.name,
                student.present,
                student.absent,
                student.leave,
                student.total,
                student.percentage + '%'
            ]);
        });

        // Create worksheet
        const ws = xlsx.utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
            { wch: 15 },
            { wch: 25 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 12 }
        ];

        // Add worksheet to workbook
        xlsx.utils.book_append_sheet(wb, ws, 'Attendance');

        // Generate file
        const fileName = `attendance_${subjectInfo.code}_${Date.now()}.xlsx`;
        const tempDir = path.join(__dirname, '..', 'temp');

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const filePath = path.join(tempDir, fileName);
        xlsx.writeFile(wb, filePath);

        return filePath;
    } catch (error) {
        throw new Error('Failed to generate Excel report: ' + error.message);
    }
};
