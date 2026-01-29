import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, UserCheck, FileText,
    Settings, LogOut, Shield, ClipboardCheck, Award
} from 'lucide-react';

const Sidebar = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getMenuItems = () => {
        switch (user?.role) {
            case 'student':
                return [
                    { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
                    { path: '/student/report', icon: FileText, label: 'Reports' },
                    { path: '/student/profile', icon: Settings, label: 'Profile' }
                ];
            case 'teacher':
                return [
                    { path: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
                    { path: '/teacher/mark-attendance', icon: UserCheck, label: 'Mark Attendance' },
                    { path: '/teacher/qr-attendance', icon: ClipboardCheck, label: 'QR Attendance' }
                ];
            case 'admin':
                return [
                    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
                    { path: '/admin/students', icon: Users, label: 'Students' },
                    { path: '/admin/teachers', icon: Users, label: 'Teachers' },
                    { path: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
                    { path: '/admin/audit', icon: Shield, label: 'Audit' },
                    { path: '/admin/eligibility', icon: Award, label: 'Eligibility' }
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shadow-sm">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200 bg-white">
                    <img
                        src="/institute_logo.png"
                        alt="Institute of Innovation"
                        className="h-12 w-auto mb-2 object-contain"
                    />
                    <p className="text-xs font-bold text-blue-900 tracking-widest uppercase opacity-70">
                        {user?.role} Portal
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-100'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Fixed User section at bottom */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 px-3 py-2 mb-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Verified User</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold shadow-lg hover:shadow-rose-300 transition-all active:scale-95"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-3 font-bold uppercase tracking-widest">System v1.0.4</p>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default Sidebar;
