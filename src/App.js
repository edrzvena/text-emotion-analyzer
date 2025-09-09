import React, { useState, useEffect } from 'react';

const emotionColors = {
  anger: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', chart: 'bg-red-400' },
  anticipation: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', chart: 'bg-orange-400' },
  disgust: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', chart: 'bg-green-400' },
  fear: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', chart: 'bg-purple-400' },
  joy: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', chart: 'bg-yellow-400' },
  sadness: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', chart: 'bg-blue-400' },
  surprise: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', chart: 'bg-pink-400' },
  trust: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', chart: 'bg-indigo-400' },
  positive: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', chart: 'bg-teal-400' },
  negative: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', chart: 'bg-rose-400' },
};

const allEmotions = ['anger', 'anticipation', 'disgust', 'fear', 'joy', 'sadness', 'surprise', 'trust', 'positive', 'negative'];

function App() {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lexiconData, setLexiconData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Load lexicon data from file
  useEffect(() => {
    const loadLexiconData = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(10);
        
        // Load the NRC Emotion Lexicon file
        const response = await fetch('/NRC-Emotion-Lexicon-Wordlevel-v0.92.txt');
        setLoadingProgress(30);
        
        if (!response.ok) {
          throw new Error('File tidak ditemukan');
        }
        
        const text = await response.text();
        setLoadingProgress(60);
        
        // Parse the lexicon data
        const lines = text.split('\n');
        const lexicon = {};
        
        lines.forEach(line => {
          const parts = line.trim().split('\t');
          if (parts.length === 3) {
            const [word, emotion, value] = parts;
            
            if (!lexicon[word]) {
              lexicon[word] = {};
            }
            
            lexicon[word][emotion] = parseInt(value) === 1;
          }
        });
        
        setLexiconData(lexicon);
        setLoadingProgress(100);
        
      } catch (error) {
        console.error('Error loading lexicon:', error);
        // Fallback to a basic lexicon if file loading fails
        setLexiconData({
          'love': { joy: true, trust: true, positive: true },
          'hate': { anger: true, disgust: true, negative: true },
          'happy': { joy: true, positive: true },
          'sad': { sadness: true, negative: true },
          // Add more fallback entries as needed
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLexiconData();
  }, []);

  // Preprocessing functions
  const caseFolding = (text) => text.toLowerCase();

  const removePunctuation = (text) => text.replace(/[^\w\s]/gi, '');

  const tokenizing = (text) => {
    return text.split(/\s+/).filter(token => token.length > 0);
  };

  const simpleStemming = (tokens) => {
    return tokens.map(token => {
      // Simple stemming rules for common English words
      if (token.endsWith('ing')) return token.replace(/ing$/, '');
      if (token.endsWith('ed')) return token.replace(/ed$/, '');
      if (token.endsWith('s')) return token.replace(/s$/, '');
      if (token.endsWith('es')) return token.replace(/es$/, '');
      if (token.endsWith('ly')) return token.replace(/ly$/, '');
      return token;
    });
  };

  const preprocessText = (text) => {
    const foldedText = caseFolding(text);
    const noPunctText = removePunctuation(foldedText);
    const tokens = tokenizing(noPunctText);
    const stems = simpleStemming(tokens);
    return { foldedText, noPunctText, tokens, stems };
  };

  const analyzeText = () => {
    if (!inputText.trim() || !lexiconData) return;

    setIsLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      try {
        // Preprocess text
        const { foldedText, noPunctText, tokens, stems } = preprocessText(inputText);
        
        // Analyze emotions
        const emotionCount = {};
        const wordDetails = [];
        const emotionPercentages = {};
        
        // Initialize emotion counters
        allEmotions.forEach(emotion => {
          emotionCount[emotion] = 0;
        });

        // Analyze each token
        tokens.forEach((token, index) => {
          const stem = stems[index];
          const emotions = [];
          
          // Check both original token and stemmed version in lexicon
          if (lexiconData[token]) {
            Object.entries(lexiconData[token]).forEach(([emotion, value]) => {
              if (value && allEmotions.includes(emotion)) {
                emotions.push(emotion);
              }
            });
          }
          
          if (stem !== token && lexiconData[stem]) {
            Object.entries(lexiconData[stem]).forEach(([emotion, value]) => {
              if (value && allEmotions.includes(emotion) && !emotions.includes(emotion)) {
                emotions.push(emotion);
              }
            });
          }
          
          wordDetails.push({ 
            original: token, 
            stem: stem, 
            emotions: emotions 
          });
          
          // Count emotions
          emotions.forEach(emotion => {
            if (emotionCount[emotion] !== undefined) {
              emotionCount[emotion] += 1;
            }
          });
        });

        // Calculate percentages
        const totalEmotions = Object.values(emotionCount).reduce((sum, count) => sum + count, 0);
        allEmotions.forEach(emotion => {
          emotionPercentages[emotion] = totalEmotions > 0 
            ? ((emotionCount[emotion] / totalEmotions) * 100).toFixed(2) 
            : '0.00';
        });

        const result = {
          text: inputText,
          preprocessing: { foldedText, noPunctText, tokens, stems },
          wordDetails,
          emotionCount,
          emotionPercentages,
          totalEmotions,
          timestamp: new Date().toLocaleString()
        };

        setAnalysis(result);
        setHistory(prev => [result, ...prev.slice(0, 4)]);
      } catch (error) {
        console.error("Error analyzing text:", error);
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setInputText('');
  };

  const loadFromHistory = (item) => {
    setInputText(item.text);
    setAnalysis(item);
  };

  if (isLoading && !lexiconData) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">Text Emotion Analyzer</h1>
          <p className="text-gray-600">Analisis emosi dalam teks menggunakan NRC Emotion Lexicon</p>
          <p className="text-sm text-gray-500 mt-1">
            Lexicon loaded: {lexiconData ? Object.keys(lexiconData).length.toLocaleString() : 0} words
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
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
                
                {/* Preprocessing Steps */}
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

          {/* History & Info Section */}
          <div className="space-y-6">
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
          </div>
        </div>

        {analysis && (
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
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;