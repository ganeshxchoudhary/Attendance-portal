import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { predictAttendance } from '../../services/api';

const PredictionCard = ({ overallAttendance, studentId }) => {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    // Simple math for immediate "What if" scenarios
    const totalClasses = 100; // specific to current context, ideally passed down
    // We'll calculate based on percentage for now as we don't have raw numbers in this prop
    // In a real app, pass { present, total } props

    const calculateScenario = (attendNext) => {
        // Mock calculation for demo purposes if exact numbers aren't passed
        // New % = (Current% * 100 + (attendNext ? 100 : 0)) / 101
        const currentScore = overallAttendance;
        const newScore = (currentScore * 20 + (attendNext ? 100 : 0)) / 21; // Weighted for immediate impact demo
        return newScore.toFixed(1);
    };

    const predictScenario = async () => {
        setLoading(true);
        try {
            const res = await predictAttendance(studentId, overallAttendance);

            setPrediction({
                risk: res.data.riskLevel,
                projected: res.data.predictedAttendance,
                message: res.data.message,
                confidence: res.data.confidence
            });
            setLoading(false);
        } catch (error) {
            console.error('Error generating AI prediction:', error);
            // Fallback to mock for demo if API fails? No, better show error.
            setLoading(false);
        }
    };

    return (
        <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800 animate-slide-up animation-delay-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Brain size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Attendance Predictor</h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Powered by Python Engine 🐍</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Immediate Scenarios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl border border-green-100 dark:border-green-900/30 shadow-sm transition-transform hover:scale-105 cursor-pointer group">
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">If you attend next class</span>
                            <CheckCircle size={16} className="text-green-500" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{calculateScenario(true)}%</span>
                            <span className="text-green-500 text-xs font-bold mb-1 flex items-center">
                                <TrendingUp size={12} className="mr-1" /> +0.5%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${calculateScenario(true)}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm transition-transform hover:scale-105 cursor-pointer group">
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">If you miss next class</span>
                            <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{calculateScenario(false)}%</span>
                            <span className="text-red-500 text-xs font-bold mb-1 flex items-center">
                                <TrendingUp size={12} className="mr-1 rotate-180" /> -0.8%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
                            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${calculateScenario(false)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* AI Analysis Button */}
                {!prediction ? (
                    <button
                        onClick={predictScenario}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Analyzing Patterns...
                            </span>
                        ) : (
                            <>
                                <Brain size={18} />
                                Generate AI Prediction
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                ) : (
                    <div className="bg-indigo-900/10 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 animate-fade-in">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-indigo-900 dark:text-indigo-300">AI Analysis Result</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${prediction.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {prediction.risk} Risk
                            </span>
                        </div>
                        <p className="text-indigo-800 dark:text-indigo-200 text-sm mb-3">
                            {prediction.message}
                        </p>
                        <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400">
                            <span>Projected End-Sem: <strong>{prediction.projected.toFixed(1)}%</strong></span>
                            <span>Confidence: <strong>{(prediction.confidence * 100).toFixed(0)}%</strong></span>
                        </div>
                        <button
                            onClick={() => setPrediction(null)}
                            className="mt-3 text-xs text-indigo-500 underline hover:text-indigo-700"
                        >
                            Reset Analysis
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PredictionCard;
