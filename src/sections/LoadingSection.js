import React from 'react';

function LoadingSection({ loadingProgress }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-64 bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-purple-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <p className="text-purple-800">Memuat lexicon data... {loadingProgress}%</p>
      </div>
    </div>
  );
}

export default LoadingSection;
