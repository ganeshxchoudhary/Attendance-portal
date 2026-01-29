import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getTeacherDashboard } from '../../services/api';
import { BookOpen, Users, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await getTeacherDashboard();
            setData(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Teacher Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Welcome, {data?.teacher.name}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="stat-card">
                        <div className="flex items-center justify-between mb-4">
                            <BookOpen className="text-primary-600" size={32} />
                            <span className="text-3xl font-bold">{data?.stats.totalSubjects || 0}</span>
                        </div>
                        <h3 className="text-gray-600 dark:text-gray-400 font-medium">Assigned Subjects</h3>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between mb-4">
                            <Calendar className="text-green-600" size={32} />
                            <span className="text-3xl font-bold">{data?.stats.totalClassesConducted || 0}</span>
                        </div>
                        <h3 className="text-gray-600 dark:text-gray-400 font-medium">Classes Conducted</h3>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle className="text-purple-600" size={32} />
                            <span className="text-3xl font-bold">{data?.stats.recentlyMarked || 0}</span>
                        </div>
                        <h3 className="text-gray-600 dark:text-gray-400 font-medium">Recent Attendance</h3>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assigned Subjects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.subjects.map((subject) => (
                            <div key={subject._id} className="card hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{subject.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{subject.code}</p>
                                    </div>
                                    <BookOpen className="text-primary-600" size={24} />
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600 dark:text-gray-400"><strong>Department:</strong> {subject.department}</p>
                                    <p className="text-gray-600 dark:text-gray-400"><strong>Semester:</strong> {subject.semester}</p>
                                    <p className="text-gray-600 dark:text-gray-400"><strong>Lectures:</strong> {subject.totalLectures}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                                    <Link to="/teacher/mark-attendance" className="btn-primary text-xs py-2 px-3 flex-1 text-center">
                                        Mark Attendance
                                    </Link>
                                    <Link to={`/teacher/analytics/${subject._id}`} className="btn-secondary text-xs py-2 px-3 flex-1 text-center">
                                        Analytics
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};

export default TeacherDashboard;
