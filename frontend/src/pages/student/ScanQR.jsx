import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { validateQRCode } from '../../services/api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, AlertCircle, CheckCircle, Smartphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScanQR = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 10,
        });

        scanner.render(onScanSuccess, onScanError);

        function onScanSuccess(result) {
            scanner.clear();
            setIsScanning(false);
            handleAttendanceSubmission(result);
        }

        function onScanError(err) {
            // console.warn(err);
        }

        return () => {
            scanner.clear().catch(e => console.error('Failed to clear scanner', e));
        };
    }, []);

    const handleAttendanceSubmission = async (qrData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await validateQRCode(qrData);
            if (response.data.success) {
                setScanResult({
                    message: response.data.message,
                    details: response.data.data
                });
            }
        } catch (error) {
            console.error('QR Submission error:', error);
            setError(error.response?.data?.message || 'Failed to process QR code. It may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        window.location.reload(); // Simplest way to restart the scanner cleanly
    };

    return (
        <Sidebar>
            <div className="p-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/student')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <Camera size={28} />
                        </div>
                        Scan Attendance QR
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Scanner Section */}
                    <div className="space-y-6">
                        <div className={`card overflow-hidden border-0 shadow-2xl relative ${!isScanning ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div id="reader" className="w-full"></div>
                            {isScanning && (
                                <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500 animate-scan-line z-10"></div>
                            )}
                        </div>

                        <div className="card p-6 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800">
                            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Smartphone size={16} />
                                Instructions
                            </h3>
                            <ul className="text-sm text-indigo-800 dark:text-indigo-400 space-y-2">
                                <li className="flex gap-2">
                                    <span className="font-bold text-indigo-600">1.</span>
                                    Position the QR code within the frame
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-indigo-600">2.</span>
                                    Ensure adequate lighting
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-indigo-600">3.</span>
                                    Wait for the automatic confirmation
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Result Section */}
                    <div className="flex flex-col">
                        {loading && (
                            <div className="card h-full flex flex-col items-center justify-center p-12 text-center animate-pulse">
                                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verifying...</h3>
                                <p className="text-gray-500 mt-2">Connecting to secure attendance server</p>
                            </div>
                        )}

                        {scanResult && !loading && (
                            <div className="card h-full border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-12 text-center flex flex-col items-center justify-center animate-bounce-in">
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/40 mb-8">
                                    <CheckCircle size={48} />
                                </div>
                                <h2 className="text-3xl font-extrabold text-green-900 dark:text-green-400 mb-4">
                                    Success!
                                </h2>
                                <p className="text-green-800 dark:text-green-300 font-medium mb-8 text-lg">
                                    {scanResult.message}
                                </p>
                                <div className="w-full bg-white/50 dark:bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                                    <p className="text-xs font-bold text-green-700 dark:text-green-500 uppercase tracking-widest mb-2">Subject Recorded</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">Attendance Confirmed</p>
                                </div>
                                <button
                                    onClick={() => navigate('/student')}
                                    className="mt-10 btn-primary w-full py-4 bg-green-600 hover:bg-green-700 shadow-green-500/20"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="card h-full border-0 shadow-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-12 text-center flex flex-col items-center justify-center animate-shake">
                                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/40 mb-8">
                                    <AlertCircle size={48} />
                                </div>
                                <h2 className="text-3xl font-extrabold text-red-900 dark:text-red-400 mb-4">
                                    Oops!
                                </h2>
                                <p className="text-red-800 dark:text-red-300 font-medium mb-8 text-lg">
                                    {error}
                                </p>
                                <button
                                    onClick={resetScanner}
                                    className="btn-primary w-full py-4 bg-red-600 hover:bg-red-700 shadow-red-500/20"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/student')}
                                    className="mt-4 text-sm font-bold text-red-700 hover:underline"
                                >
                                    Cancel and Go Back
                                </button>
                            </div>
                        )}

                        {!scanResult && !error && !loading && (
                            <div className="card h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/10">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
                                    <QrCode size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Scanner Ready</h3>
                                <p className="text-gray-500 dark:text-gray-400">Your camera will automatically scan the attendance QR code.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};

export default ScanQR;
