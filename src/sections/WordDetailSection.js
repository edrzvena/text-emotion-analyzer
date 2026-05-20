import React from 'react';

function WordDetailSection({ analysis, emotionColors }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Kata</h2>
      {analysis && analysis.wordDetails.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {analysis.wordDetails.map((detail, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg shadow-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-800">{detail.original}</span>
                {detail.stem !== detail.original && (
                  <span className="text-xs text-gray-500">stem: {detail.stem}</span>
                )}
              </div>
              {detail.emotions.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {detail.emotions.map(emotion => (
                    <span
                      key={emotion}
                      className={`px-2 py-1 text-xs rounded-full ${emotionColors[emotion].bg} ${emotionColors[emotion].text}`}
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-xs mt-1">Tidak ada emosi terdeteksi</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">Masukkan teks dan klik analisis</p>
      )}
    </div>
  );
}

export default WordDetailSection;
