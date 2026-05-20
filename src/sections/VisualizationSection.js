import React from 'react';

function VisualizationSection({ analysis, emotionColors }) {
  return (
    <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Visualisasi Data</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Persentase Emosi</h3>
          <div className="space-y-2">
            {Object.entries(analysis.emotionPercentages)
              .sort((a, b) => b[1] - a[1])
              .map(([emotion, percentage]) => (
                <div key={emotion} className="flex items-center">
                  <div className="w-24">
                    <span className={`text-sm font-medium ${emotionColors[emotion].text}`}>
                      {emotion}
                    </span>
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${emotionColors[emotion].chart}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-600 w-12">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-3">Intensitas Emosi</h3>
          <div className="space-y-2">
            {Object.entries(analysis.emotionCount)
              .filter(([_, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([emotion, count]) => (
                <div key={emotion} className="flex items-center">
                  <div className="w-24">
                    <span className={`text-sm font-medium ${emotionColors[emotion].text}`}>
                      {emotion}
                    </span>
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${emotionColors[emotion].chart}`}
                          style={{ width: `${(count / analysis.totalEmotions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-600 w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisualizationSection;
