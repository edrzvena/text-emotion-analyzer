import React, { useState, useEffect } from 'react';
import { emotionColors, allEmotions } from '../constants/emotions';
import LoadingSection from '../sections/LoadingSection';
import HeaderSection from '../sections/HeaderSection';
import InputSection from '../sections/InputSection';
import HistorySection from '../sections/HistorySection';
import WordDetailSection from '../sections/WordDetailSection';
import VisualizationSection from '../sections/VisualizationSection';

function Home() {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lexiconData, setLexiconData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const loadLexiconData = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(10);

        const response = await fetch('/NRC-Emotion-Lexicon-Wordlevel-v0.92.txt');
        setLoadingProgress(30);

        if (!response.ok) {
          throw new Error('File tidak ditemukan');
        }

        const text = await response.text();
        setLoadingProgress(60);

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
        setLexiconData({
          'love': { joy: true, trust: true, positive: true },
          'hate': { anger: true, disgust: true, negative: true },
          'happy': { joy: true, positive: true },
          'sad': { sadness: true, negative: true },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLexiconData();
  }, []);

  const caseFolding = (text) => text.toLowerCase();

  const removePunctuation = (text) => text.replace(/[^\w\s]/gi, '');

  const tokenizing = (text) => {
    return text.split(/\s+/).filter(token => token.length > 0);
  };

  const simpleStemming = (tokens) => {
    return tokens.map(token => {
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

    setTimeout(() => {
      try {
        const { foldedText, noPunctText, tokens, stems } = preprocessText(inputText);

        const emotionCount = {};
        const wordDetails = [];
        const emotionPercentages = {};

        allEmotions.forEach(emotion => {
          emotionCount[emotion] = 0;
        });

        tokens.forEach((token, index) => {
          const stem = stems[index];
          const emotions = [];

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

          emotions.forEach(emotion => {
            if (emotionCount[emotion] !== undefined) {
              emotionCount[emotion] += 1;
            }
          });
        });

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
    return <LoadingSection loadingProgress={loadingProgress} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <HeaderSection lexiconData={lexiconData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InputSection
            inputText={inputText}
            setInputText={setInputText}
            isLoading={isLoading}
            lexiconData={lexiconData}
            analyzeText={analyzeText}
            clearAnalysis={clearAnalysis}
            analysis={analysis}
            allEmotions={allEmotions}
            emotionColors={emotionColors}
          />

          <div className="space-y-6">
            <HistorySection history={history} loadFromHistory={loadFromHistory} />
            <WordDetailSection analysis={analysis} emotionColors={emotionColors} />
          </div>
        </div>

        {analysis && (
          <VisualizationSection analysis={analysis} emotionColors={emotionColors} />
        )}
      </div>
    </div>
  );
}

export default Home;
