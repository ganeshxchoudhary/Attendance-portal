import React from 'react';

const Loading = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="text-center">
                <div className="inline-block relative w-20 h-20">
                    <div className="absolute border-4 border-primary-200 dark:border-primary-900 rounded-full w-20 h-20"></div>
                    <div className="absolute border-4 border-primary-600 border-t-transparent rounded-full w-20 h-20 animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
            </div>
        </div>
    );
};

export default Loading;
