import React from 'react';

function HistorySection({ history, loadFromHistory }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Riwayat Analisis</h2>
      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-purple-50 transition-colors"
              onClick={() => loadFromHistory(item)}
            >
              <p className="text-sm text-gray-700 truncate">"{item.text}"</p>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">{item.timestamp}</span>
                <span className="text-xs text-purple-600">{item.totalEmotions} emosi</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">Belum ada riwayat analisis</p>
      )}
    </div>
  );
}

export default HistorySection;
