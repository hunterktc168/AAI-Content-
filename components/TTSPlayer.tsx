'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import type { ThemeConfig } from '@/lib/theme';

interface TTSPlayerProps {
  text: string;
  theme: ThemeConfig;
}

export default function TTSPlayer({ text, theme }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported] = useState<boolean>(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const [rate, setRate] = useState<number>(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cancel speech on unmount or when text changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  if (!isSupported || !text.trim()) {
    return null;
  }

  const handlePlayPause = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleCycleRate = () => {
    const nextRate = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1;
    setRate(nextRate);
    if (isPlaying) {
      handleStop();
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-colors ${
        theme.tray
      } ${theme.border}`}
    >
      <button
        type="button"
        onClick={handlePlayPause}
        aria-label={isPlaying ? 'Pause read aloud' : 'Read aloud with speech audio'}
        className={`inline-flex items-center gap-1 font-medium transition-colors cursor-pointer ${
          isPlaying
            ? `${theme.isDark ? 'text-cyan-400' : 'text-emerald-700'} font-semibold`
            : `${theme.inkMuted} hover:${theme.ink}`
        }`}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span className="text-[11px]">{isPlaying ? 'Pause' : 'Listen'}</span>
      </button>

      {/* Animated Soundwave equalizer while speaking */}
      {isPlaying ? (
        <div className="flex items-end gap-0.5 h-3 px-1" aria-hidden="true">
          <span
            className={`w-0.5 h-2 rounded-full animate-pulse ${
              theme.isDark ? 'bg-cyan-400' : 'bg-emerald-600'
            }`}
          />
          <span
            className={`w-0.5 h-3 rounded-full animate-pulse delay-75 ${
              theme.isDark ? 'bg-cyan-300' : 'bg-emerald-500'
            }`}
          />
          <span
            className={`w-0.5 h-1.5 rounded-full animate-pulse delay-150 ${
              theme.isDark ? 'bg-cyan-400' : 'bg-emerald-600'
            }`}
          />
          <span
            className={`w-0.5 h-2.5 rounded-full animate-pulse ${
              theme.isDark ? 'bg-cyan-300' : 'bg-emerald-500'
            }`}
          />
        </div>
      ) : null}

      {isPlaying ? (
        <button
          type="button"
          onClick={handleStop}
          aria-label="Stop audio"
          className={`${theme.inkMuted} hover:${theme.ink} p-0.5 cursor-pointer`}
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={handleCycleRate}
        title="Playback speed"
        className={`font-mono text-[10px] ${theme.inkMuted} hover:${theme.ink} px-1 py-0.5 rounded cursor-pointer`}
      >
        {rate}x
      </button>
    </div>
  );
}
