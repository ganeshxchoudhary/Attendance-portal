import React from 'react';
import Sidebar from '../../components/Sidebar';
import { FileText, Download } from 'lucide-react';

const Report = () => {
    return (
        <Sidebar>
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance Reports</h1>
                    <button className="btn-primary flex items-center gap-2">
                        <Download size={20} />
                        Download PDF
                    </button>
                </div>
                <div className="card">
                    <div className="flex items-center gap-4 mb-6">
                        <FileText size={32} className="text-primary-600" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Reports</h2>
                            <p className="text-gray-600 dark:text-gray-400">View and download your attendance reports</p>
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Detailed reports coming soon...</p>
                </div>
            </div>
        </Sidebar>
    );
};

export default Report;
