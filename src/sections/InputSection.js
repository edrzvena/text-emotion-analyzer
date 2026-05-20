import React from 'react';

function InputSection({ inputText, setInputText, isLoading, lexiconData, analyzeText, clearAnalysis, analysis, allEmotions, emotionColors }) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
      <div className="mb-4">
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
          Masukkan teks untuk dianalisis:
        </label>
        <textarea
          id="text-input"
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik atau tempel teks Anda di sini..."
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={analyzeText}
          disabled={isLoading || !lexiconData}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex-1 disabled:opacity-50"
        >
          {isLoading ? 'Menganalisis...' : 'Analisis Emosi'}
        </button>
        <button
          onClick={clearAnalysis}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>

      {analysis && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Hasil Analisis:</h2>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Langkah Preprocessing:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Case Folding:</p>
                <p className="bg-white p-2 rounded">{analysis.preprocessing.foldedText}</p>
              </div>
              <div>
                <p className="text-gray-600">Remove Punctuation:</p>
                <p className="bg-white p-2 rounded">{analysis.preprocessing.noPunctText}</p>
              </div>
              <div>
                <p className="text-gray-600">Tokenizing:</p>
                <p className="bg-white p-2 rounded">{analysis.preprocessing.tokens.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-600">Stemming:</p>
                <p className="bg-white p-2 rounded">{analysis.preprocessing.stems.join(', ')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-700 mb-4">
              <span className="font-medium">Teks:</span> "{analysis.text}"
            </p>

            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Distribusi Emosi:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {allEmotions.map(emotion => (
                  <div key={emotion} className={`p-2 rounded-lg ${emotionColors[emotion].bg} ${emotionColors[emotion].border} border`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${emotionColors[emotion].text}`}>
                        {emotion}
                      </span>
                      <span className={`text-xs ${emotionColors[emotion].text}`}>
                        {analysis.emotionPercentages[emotion]}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${emotionColors[emotion].chart}`}
                        style={{ width: `${analysis.emotionPercentages[emotion]}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InputSection;
