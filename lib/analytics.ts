export interface TextAnalytics {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  readingTimeSeconds: number;
  fleschReadingEase: number;
  fleschGradeLevel: number;
  readingEaseLabel: string;
  avgWordsPerSentence: number;
}

function countSyllablesInWord(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  // Common suffix reductions
  const stripped = clean
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export function computeTextAnalytics(text: string): TextAnalytics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      readingTimeSeconds: 0,
      fleschReadingEase: 100,
      fleschGradeLevel: 0,
      readingEaseLabel: 'Empty',
      avgWordsPerSentence: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;

  // Split on sentence terminals
  const sentenceMatches = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentenceMatches.length);

  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllablesInWord(word);
  }

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;

  // Flesch Reading Ease: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  let flesch = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  flesch = Math.min(100, Math.max(0, Math.round(flesch * 10) / 10));

  // Flesch-Kincaid Grade Level: 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
  let grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  grade = Math.max(0, Math.round(grade * 10) / 10);

  let readingEaseLabel = 'Standard';
  if (flesch >= 90) readingEaseLabel = 'Very Easy (5th Grade)';
  else if (flesch >= 80) readingEaseLabel = 'Easy (6th Grade)';
  else if (flesch >= 70) readingEaseLabel = 'Fairly Easy (7th Grade)';
  else if (flesch >= 60) readingEaseLabel = 'Standard (8th–9th Grade)';
  else if (flesch >= 50) readingEaseLabel = 'Fairly Difficult (High School)';
  else if (flesch >= 30) readingEaseLabel = 'Difficult (College)';
  else readingEaseLabel = 'Very Scholarly (Graduate)';

  // Average reading speed ~ 220 words per minute -> 3.67 words/second
  const readingTimeSeconds = Math.max(1, Math.round(wordCount / 3.67));

  return {
    wordCount,
    charCount,
    sentenceCount,
    readingTimeSeconds,
    fleschReadingEase: flesch,
    fleschGradeLevel: grade,
    readingEaseLabel,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
  };
}
