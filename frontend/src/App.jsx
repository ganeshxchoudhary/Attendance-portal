import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import AttendanceReport from './pages/student/Report';
import ScanQR from './pages/student/ScanQR';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import QRAttendance from './pages/teacher/QRAttendance';
import ClassAnalytics from './pages/teacher/Analytics';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import StudentsManagement from './pages/admin/Students';
import TeachersManagement from './pages/admin/Teachers';
import SubjectsManagement from './pages/admin/Subjects';
import AuditPage from './pages/admin/Audit';
import EligibilityPage from './pages/admin/Eligibility';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

function AppRoutes() {
    const { loading, isAuthenticated, user } = useAuth();

    if (loading) {
        return <Loading />;
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to={`/${user.role}`} replace /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to={`/${user.role}`} replace /> : <Register />}
            />
            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            {/* Student routes */}
            <Route
                path="/student"
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/profile"
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <StudentProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/report"
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <AttendanceReport />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/scan-qr"
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <ScanQR />
                    </ProtectedRoute>
                }
            />

            {/* Teacher routes */}
            <Route
                path="/teacher"
                element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                        <TeacherDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/mark-attendance"
                element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                        <MarkAttendance />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/qr-attendance"
                element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                        <QRAttendance />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/analytics/:subjectId"
                element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                        <ClassAnalytics />
                    </ProtectedRoute>
                }
            />

            {/* Admin routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/students"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <StudentsManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/teachers"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <TeachersManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/subjects"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <SubjectsManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/audit"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AuditPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/eligibility"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <EligibilityPage />
                    </ProtectedRoute>
                }
            />

            {/* Redirect based on authentication */}
            <Route
                path="/"
                element={
                    isAuthenticated ? (
                        <Navigate to={`/${user.role}`} replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
