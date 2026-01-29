import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getAdminDashboard } from '../../services/api';
import { Users, BookOpen, UserCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await getAdminDashboard();
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link to="/admin/students" className="stat-card hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="text-primary-600" size={32} />
                            <span className="text-3xl font-bold">{data?.stats.totalStudents || 0}</span>
                        </div>
                        <h3 className="text-gray-600 dark:text-gray-400 font-medium">Total Students</h3>
                    </Link>

                    <Link to="/admin/teachers" className="stat-card hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <UserCheck className="text-green-600" size={32} />
                            <span className="text-3xl font-bold">{data?.stats.totalTeachers || 0}</span>
                        </div>
                        <h3 className="text-gray-600 dark:text-gray-400 font-medium">Total Teachers</h3>
                    </Link>

                    <Link to="/admin/subjects" className="stat-card hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <BookOpen className="text-purple-600" size={32} />
                            <span className="text-3xl font-bold">{data?.stats.totalSubjects || 0}</span>
                        </div>
                        <h3 className="text-gray-600 dark:text-gray-400 font-medium">Total Subjects</h3>
                    </Link>

                    <div className="stat-card">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="text-orange-600" size={32} />
                            <span className="text-3xl font-bold">{data?.stats.overallAttendance || 0}%</span>
                        </div>
                        <h3 className="text-gray-600 dark:text-gray-400 font-medium">Overall Attendance</h3>
                    </div>
                </div>

                {data?.stats.pendingTeachers > 0 && (
                    <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <Link to="/admin/teachers" className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-300 mb-1">
                                    Pending Teacher Approvals
                                </h3>
                                <p className="text-yellow-800 dark:text-yellow-400">
                                    {data.stats.pendingTeachers} teacher(s) awaiting approval
                                </p>
                            </div>
                            <button className="btn-primary">Review</button>
                        </Link>
                    </div>
                )}

                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {data?.recentActivity.slice(0, 10).map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {activity.student?.name} - {activity.subject?.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Marked by {activity.markedBy?.name || 'System'} • {new Date(activity.markedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${activity.status === 'present'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {activity.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Sidebar >
    );
};

export default AdminDashboard;
