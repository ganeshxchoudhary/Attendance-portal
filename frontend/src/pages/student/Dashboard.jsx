import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getStudentDashboard } from '../../services/api';
import {
    Calendar, AlertCircle, BookOpen, GraduationCap,
    CheckCircle2, XCircle, Info, ChevronRight, BarChart2, QrCode
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await getStudentDashboard();
            setData(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 font-medium">Loading academic records...</p>
                    </div>
                </div>
            </Sidebar>
        );
    }

    if (!data) {
        return (
            <Sidebar>
                <div className="p-8 text-center text-gray-600">No student records found.</div>
            </Sidebar>
        );
    }

    const chartData = data.subjectStats.map(s => ({
        name: s.subject.code,
        percentage: s.percentage,
        fullName: s.subject.name
    }));

    return (
        <Sidebar>
            <div className="bg-gray-50 min-h-screen p-6 md:p-8 text-gray-900">
                {/* Academic Header */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700">
                            <GraduationCap size={40} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{data.student.name}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><span className="font-semibold text-gray-700">ID:</span> {data.student.rollNumber}</span>
                                <span className="flex items-center gap-1"><span className="font-semibold text-gray-700">Course:</span> {data.student.department}</span>
                                <span className="flex items-center gap-1"><span className="font-semibold text-gray-700">Semester:</span> {data.student.semester}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/student/scan-qr"
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95"
                        >
                            <QrCode size={20} />
                            Scan QR
                        </Link>
                        <div className="text-right hidden md:block">
                            <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Session Status</p>
                            <div className="text-emerald-600 font-bold flex items-center justify-end gap-1 mt-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                Active Academic Session
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Classes', value: data.overall.totalClasses, icon: Calendar, color: 'blue' },
                        { label: 'Classes Attended', value: data.overall.present, icon: CheckCircle2, color: 'emerald' },
                        { label: 'Classes Missed', value: data.overall.absent, icon: XCircle, color: 'rose' },
                        { label: 'Overall Attendance', value: `${data.overall.percentage}%`, icon: BarChart2, color: data.overall.percentage >= 75 ? 'blue' : 'rose' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
                                    <stat.icon size={22} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">{stat.label}</span>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Attendance Alerts */}
                {data.lowAttendance && data.lowAttendance.length > 0 && (
                    <div className="mb-8 border border-amber-200 bg-amber-50 rounded-xl p-5">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                <AlertCircle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-amber-900 font-bold text-lg leading-6 mb-1">Attendance Shortage Alert</h3>
                                <p className="text-amber-800 text-sm mb-3">
                                    Your attendance is below the mandatory <span className="font-bold underline">75%</span> in the following subjects. This may impact your examination eligibility.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {data.lowAttendance.map(s => (
                                        <span key={s.subject.id} className="inline-flex items-center px-3 py-1 bg-white border border-amber-200 rounded-md text-sm font-semibold text-amber-900">
                                            {s.subject.name} ({s.percentage}%)
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button className="hidden lg:flex items-center gap-1 text-sm font-bold text-amber-700 hover:text-amber-800 underline">
                                View Policy <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Subject-Wise Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <BookOpen size={20} className="text-blue-600" />
                                    Subject-wise Attendance Records
                                </h2>
                                <span className="text-xs font-medium text-gray-400">AY 2025-26</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Code</th>
                                            <th className="px-6 py-4">Subject Name</th>
                                            <th className="px-6 py-4 text-center">Total</th>
                                            <th className="px-6 py-4 text-center">Attended</th>
                                            <th className="px-6 py-4 text-center">Percentage</th>
                                            <th className="px-6 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.subjectStats.map(s => (
                                            <tr key={s.subject.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm font-bold text-gray-500">{s.subject.code}</td>
                                                <td className="px-6 py-4 font-semibold text-gray-800">{s.subject.name}</td>
                                                <td className="px-6 py-4 text-center text-gray-600">{s.total}</td>
                                                <td className="px-6 py-4 text-center text-emerald-600 font-medium">{s.present}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`font-bold ${s.percentage >= 75 ? 'text-blue-600' : 'text-rose-600'}`}>
                                                        {s.percentage}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {s.percentage >= 75 ? (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full uppercase">Safe</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full uppercase tracking-tighter italic">Shortage</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Simple Chart Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                                <BarChart2 size={20} className="text-indigo-600" />
                                Attendance Analytics
                            </h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white border border-gray-200 p-2 shadow-xl rounded-lg">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{payload[0].payload.fullName}</p>
                                                            <p className="text-sm font-extrabold text-blue-600">{payload[0].value}%</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#3b82f6' : '#f43f5e'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded"></div>
                                    <span>Safe (&ge;75%)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-rose-500 rounded"></div>
                                    <span>Shortage (&lt;75%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links / ERP Style Info */}
                        <div className="bg-gray-800 rounded-xl p-6 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Info size={20} />
                                    </div>
                                    <h3 className="font-bold underline decoration-blue-400 decoration-2 underline-offset-4">Academic Notice</h3>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                                    Mid-semester examinations are scheduled from March 15th. Ensure 75% attendance to generate your hall ticket.
                                </p>
                                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                                    Download Academic Calendar
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};

export default StudentDashboard;
