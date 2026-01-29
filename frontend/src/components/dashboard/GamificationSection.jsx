import React from 'react';
import { Award, Zap, Star, Trophy, Target } from 'lucide-react';

const GamificationSection = ({ attendancePercentage }) => {
    // Mock gamification logic
    const streak = 14; // Mock 2 week streak
    const points = Math.floor(attendancePercentage * 10);

    const badges = [
        { id: 1, name: 'Early Bird', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100', earned: true },
        { id: 2, name: 'Perfect Week', icon: Star, color: 'text-purple-500', bg: 'bg-purple-100', earned: streak > 5 },
        { id: 3, name: 'Consistency', icon: Target, color: 'text-blue-500', bg: 'bg-blue-100', earned: attendancePercentage > 85 },
        { id: 4, name: 'Top 10%', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-100', earned: false },
    ];

    return (
        <div className="card bg-white dark:bg-gray-800 border-l-4 border-yellow-400 animate-slide-up animation-delay-400">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="text-yellow-500" />
                        Achievements
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Keep it up to earn more!</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                        {streak} Days
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Streak</div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${badge.earned ? 'bg-gray-50 dark:bg-gray-700/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/10' : 'bg-gray-100/50 dark:bg-gray-800 opacity-50 grayscale'}`}
                    >
                        <div className={`p-3 rounded-full mb-2 ${badge.earned ? badge.bg : 'bg-gray-200 dark:bg-gray-700'}`}>
                            <badge.icon size={20} className={badge.earned ? badge.color : 'text-gray-400'} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center">
                            {badge.name}
                        </span>
                        {badge.earned && (
                            <span className="mt-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold">
                                Earned
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-500">Progress to "Attendance Master"</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{points}/1000 XP</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full relative"
                        style={{ width: `${(points / 1000) * 100}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-purple-500 rounded-full shadow-md"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationSection;
