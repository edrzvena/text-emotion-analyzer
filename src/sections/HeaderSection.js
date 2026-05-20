import React from 'react';

function HeaderSection({ lexiconData }) {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl font-bold text-purple-600 mb-2">Text Emotion Analyzer</h1>
      <p className="text-gray-600">Analisis emosi dalam teks menggunakan NRC Emotion Lexicon</p>
      <p className="text-sm text-gray-500 mt-1">
        Lexicon loaded: {lexiconData ? Object.keys(lexiconData).length.toLocaleString() : 0} words
      </p>
    </header>
  );
}

export default HeaderSection;
