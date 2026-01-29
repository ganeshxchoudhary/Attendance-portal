import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import { getTeacherDashboard, generateQRCode, getQRStatus } from '../../services/api';
import { QrCode, Calendar, Clock, Users, RefreshCw, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const QRAttendance = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [validity, setValidity] = useState(5);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [timeLeft, setTimeLeft] = useState(0);

    const pollingRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchSubjects();
        return () => {
            stopPolling();
            stopTimer();
        };
    }, []);

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

    const startPolling = (token) => {
        stopPolling();
        pollingRef.current = setInterval(async () => {
            try {
                const response = await getQRStatus(token);
                if (response.data.success) {
                    setStatus(response.data.data);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 3000);
    };

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    const startTimer = (expiryTime) => {
        stopTimer();
        const updateTimer = () => {
            const now = new Date();
            const expiry = new Date(expiryTime);
            const diff = Math.max(0, Math.floor((expiry - now) / 1000));
            setTimeLeft(diff);
            if (diff <= 0) {
                stopTimer();
                stopPolling();
                setQrData(prev => prev ? { ...prev, expired: true } : null);
            }
        };
        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!selectedSubject) {
            setMessage({ type: 'error', text: 'Please select a subject' });
            return;
        }

        setGenerating(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                subjectId: selectedSubject,
                date: new Date().toISOString().split('T')[0],
                validityMinutes: parseInt(validity)
            };
            const response = await generateQRCode(payload);
            if (response.data.success) {
                const data = response.data.data;
                setQrData(data);
                setStatus({ totalMarked: 0, students: [] });
                startPolling(data.token);
                startTimer(data.expiresAt);
            }
        } catch (error) {
            console.error('QR generation error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate QR code' });
        } finally {
            setGenerating(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDownloadQR = () => {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;
        const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `attendance-qr-${selectedSubject}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <Sidebar>
            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-3 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
                            <QrCode size={28} />
                        </div>
                        QR Code Attendance
                    </h1>
                    {message.text && (
                        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 animate-slide-left ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            <span className="text-sm font-semibold">{message.text}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Control Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card shadow-md p-6 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                            <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <Calendar size={20} className="text-primary-600" />
                                Session Details
                            </h3>

                            <form onSubmit={handleGenerate} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                        Select Subject
                                    </label>
                                    <select
                                        className="input-field"
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        disabled={generating || (qrData && timeLeft > 0)}
                                    >
                                        <option value="">-- Choose Subject --</option>
                                        {subjects.map(subject => (
                                            <option key={subject._id} value={subject._id}>
                                                {subject.name} ({subject.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                        Validity (Minutes)
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            className="input-field pl-10"
                                            value={validity}
                                            onChange={(e) => setValidity(e.target.value)}
                                            disabled={generating || (qrData && timeLeft > 0)}
                                        >
                                            {[1, 2, 3, 5, 10, 15].map(min => (
                                                <option key={min} value={min}>{min} Minutes</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={generating || (qrData && timeLeft > 0)}
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-50"
                                >
                                    {generating ? (
                                        <RefreshCw className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <QrCode size={20} />
                                            {qrData && timeLeft > 0 ? 'Session Active' : 'Generate QR Code'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {qrData && (
                            <div className="card p-6 bg-gradient-to-br from-primary-600 to-purple-600 text-white border-0">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold uppercase tracking-widest opacity-80">Time Remaining</span>
                                    <Clock size={20} className="opacity-80" />
                                </div>
                                <div className="text-5xl font-extrabold text-center tabular-nums leading-tight">
                                    {timeLeft > 0 ? formatTime(timeLeft) : "EXPIRED"}
                                </div>
                                <p className="text-xs text-center mt-4 opacity-80 italic">
                                    QR code will automatically expire after the timer ends
                                </p>
                            </div>
                        )}
                    </div>

                    {/* QR Display Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {qrData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="card p-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800 shadow-xl border-0">
                                    <div className={`p-4 bg-white rounded-2xl shadow-inner mb-6 ${timeLeft <= 0 ? 'opacity-25 grayscale' : ''}`}>
                                        <QRCodeCanvas
                                            id="qr-canvas"
                                            value={JSON.stringify({
                                                token: qrData.token,
                                                subjectId: selectedSubject,
                                                expiresAt: qrData.expiresAt
                                            })}
                                            size={256}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6 text-center">
                                        Scan this code to mark your attendance
                                    </p>
                                    <button
                                        onClick={handleDownloadQR}
                                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition-colors"
                                    >
                                        <Download size={18} />
                                        Download Image
                                    </button>
                                </div>

                                <div className="card p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Users size={20} className="text-primary-600" />
                                            Students Marked
                                        </h3>
                                        <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-extrabold">
                                            {status?.totalMarked || 0}
                                        </span>
                                    </div>

                                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                        {status?.students.length > 0 ? (
                                            status.students.map((student, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.rollNumber}</p>
                                                    </div>
                                                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                                        <CheckCircle size={16} />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                                <Users size={48} className="mb-4 opacity-10" />
                                                <p className="text-sm font-medium">Waiting for scans...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/10">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
                                    <QrCode size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Start?</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs px-4">
                                    Select a subject and validity time on the left to generate an attendance QR code.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};

export default QRAttendance;
