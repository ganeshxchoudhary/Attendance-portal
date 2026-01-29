import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
        }, 1500);
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
                <div className="w-full max-w-md">
                    <div className="glass rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
                        <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                            <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Check your email</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            If an account exists for <span className="font-semibold text-gray-900 dark:text-white">{email}</span>, you will receive password reset instructions.
                        </p>
                        <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                            <ArrowLeft size={18} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="glass rounded-2xl shadow-2xl p-8 animate-slide-up">
                    {/* Header */}
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Enter your email and we'll send you instructions to reset your password.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input-field pl-11"
                                    placeholder="your-email@college.edu"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Instructions
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
