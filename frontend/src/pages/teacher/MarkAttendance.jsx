import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getTeacherDashboard, getStudentsBySubject, markAttendance } from '../../services/api';
import { Calendar, UserCheck, UserX, Clock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const MarkAttendance = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchStudents(selectedSubject);
        } else {
            setStudents([]);
            setAttendanceData({});
        }
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        try {
            const response = await getTeacherDashboard();
            if (response.data.success) {
                setSubjects(response.data.data.subjects);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setMessage({ type: 'error', text: 'Failed to load subjects' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (subjectId) => {
        try {
            setLoading(true);
            const response = await getStudentsBySubject(subjectId);
            if (response.data.success) {
                const fetchedStudents = response.data.data;
                setStudents(fetchedStudents);

                // Initialize attendance data as empty or default? 
                // Let's initialize as empty to force selection or maybe default to present? 
                // Defaulting to present is usually convenient.
                const initialData = {};
                fetchedStudents.forEach(student => {
                    initialData[student._id] = 'present';
                });
                setAttendanceData(initialData);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setMessage({ type: 'error', text: 'Failed to load students' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleMarkAll = (status) => {
        const newData = {};
        students.forEach(student => {
            newData[student._id] = status;
        });
        setAttendanceData(newData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!selectedSubject) {
            setMessage({ type: 'error', text: 'Please select a subject' });
            return;
        }

        if (Object.keys(attendanceData).length === 0) {
            setMessage({ type: 'error', text: 'No students to mark' });
            return;
        }

        setSubmitting(true);

        try {
            // Transform data for API
            const formattedData = Object.entries(attendanceData).map(([studentId, status]) => ({
                studentId,
                status
            }));

            const payload = {
                subjectId: selectedSubject,
                date: selectedDate,
                attendanceData: formattedData
            };

            const response = await markAttendance(payload);

            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });
                // Optional: clear form or redirect? usually stay to see confirmation.
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            const errorMsg = error.response?.data?.message || 'Failed to mark attendance';
            setMessage({ type: 'error', text: errorMsg });

            // If there are specific errors (e.g. duplicate), show them?
            if (error.response?.data?.errors) {
                // Could handle detailed errors here
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Sidebar>
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
                    {message.text && (
                        <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}
                </div>

                <div className="card mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Subject
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <option value="">-- Select Subject --</option>
                                {subjects.map(subject => (
                                    <option key={subject._id} value={subject._id}>
                                        {subject.name} ({subject.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    className="w-full pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !selectedSubject}
                                className={`w-full btn-primary py-2 flex items-center justify-center gap-2 ${(submitting || !selectedSubject) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Submit Attendance
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {selectedSubject && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Student List ({students.length})
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleMarkAll('present')}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                                >
                                    Mark All Present
                                </button>
                                <button
                                    onClick={() => handleMarkAll('absent')}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                                >
                                    Mark All Absent
                                </button>
                            </div>
                        </div>

                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Roll No</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Student Name</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-gray-500">
                                                    Loading students...
                                                </td>
                                            </tr>
                                        ) : students.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-gray-500">
                                                    No students found for this subject.
                                                </td>
                                            </tr>
                                        ) : (
                                            students.map((student) => (
                                                <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <td className="p-4 text-gray-900 dark:text-white font-medium">
                                                        {student.rollNumber}
                                                    </td>
                                                    <td className="p-4 text-gray-900 dark:text-white">
                                                        {student.name}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-4">
                                                            <label className={`cursor-pointer inline-flex items-center px-3 py-1 rounded-full transition-all ${attendanceData[student._id] === 'present'
                                                                    ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                                                                }`}>
                                                                <input
                                                                    type="radio"
                                                                    name={`status-${student._id}`}
                                                                    value="present"
                                                                    checked={attendanceData[student._id] === 'present'}
                                                                    onChange={() => handleStatusChange(student._id, 'present')}
                                                                    className="hidden"
                                                                />
                                                                <UserCheck size={16} className="mr-1" />
                                                                <span className="text-sm">Present</span>
                                                            </label>

                                                            <label className={`cursor-pointer inline-flex items-center px-3 py-1 rounded-full transition-all ${attendanceData[student._id] === 'absent'
                                                                    ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                                                                }`}>
                                                                <input
                                                                    type="radio"
                                                                    name={`status-${student._id}`}
                                                                    value="absent"
                                                                    checked={attendanceData[student._id] === 'absent'}
                                                                    onChange={() => handleStatusChange(student._id, 'absent')}
                                                                    className="hidden"
                                                                />
                                                                <UserX size={16} className="mr-1" />
                                                                <span className="text-sm">Absent</span>
                                                            </label>

                                                            <label className={`cursor-pointer inline-flex items-center px-3 py-1 rounded-full transition-all ${attendanceData[student._id] === 'leave'
                                                                    ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                                                                }`}>
                                                                <input
                                                                    type="radio"
                                                                    name={`status-${student._id}`}
                                                                    value="leave"
                                                                    checked={attendanceData[student._id] === 'leave'}
                                                                    onChange={() => handleStatusChange(student._id, 'leave')}
                                                                    className="hidden"
                                                                />
                                                                <Clock size={16} className="mr-1" />
                                                                <span className="text-sm">Leave</span>
                                                            </label>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Sidebar>
    );
};

export default MarkAttendance;
