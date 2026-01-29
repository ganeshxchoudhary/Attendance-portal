import React from 'react';
import Sidebar from '../../components/Sidebar';
import { BarChart3 } from 'lucide-react';

const Analytics = () => {
    return (
        <Sidebar>
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <BarChart3 size={32} />
                    Class Analytics
                </h1>
                <div className="card">
                    <p className="text-gray-600 dark:text-gray-400">Analytics dashboard coming soon...</p>
                </div>
            </div>
        </Sidebar>
    );
};

export default Analytics;
