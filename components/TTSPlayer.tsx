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
  const [prevText, setPrevText] = useState(text);
  const [isSupported] = useState<boolean>(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const [rate, setRate] = useState<number>(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPausedRef = useRef(false);

  // Reset playing state cleanly when source text changes
  if (prevText !== text) {
    setPrevText(text);
    setIsPlaying(false);
  }

  // Cancel speech on unmount or when text changes
  useEffect(() => {
    isPausedRef.current = false;
    return () => {
      isPausedRef.current = false;
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
      isPausedRef.current = true;
      setIsPlaying(false);
      return;
    }

    if (isPausedRef.current && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      isPausedRef.current = false;
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    isPausedRef.current = false;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;

    utterance.onend = () => {
      isPausedRef.current = false;
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      isPausedRef.current = false;
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    isPausedRef.current = false;
    setIsPlaying(false);
  };

  const handleCycleRate = () => {
    const nextRate = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1;
    setRate(nextRate);
    if (isPlaying || isPausedRef.current) {
      handleStop();
    }
  };

  const barPrimary = theme.isDark
    ? theme.id === 'cyber'
      ? 'bg-emerald-400'
      : 'bg-cyan-400'
    : 'bg-[#C2410C]';
  const barSecondary = theme.isDark
    ? theme.id === 'cyber'
      ? 'bg-emerald-300'
      : 'bg-cyan-300'
    : 'bg-orange-500';

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
            ? `${theme.accentFg} font-semibold`
            : `${theme.inkMuted} ${theme.inkHover}`
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
          <span className={`w-0.5 h-2 rounded-full animate-pulse ${barPrimary}`} />
          <span className={`w-0.5 h-3 rounded-full animate-pulse delay-75 ${barSecondary}`} />
          <span className={`w-0.5 h-1.5 rounded-full animate-pulse delay-150 ${barPrimary}`} />
          <span className={`w-0.5 h-2.5 rounded-full animate-pulse ${barSecondary}`} />
        </div>
      ) : null}

      {isPlaying ? (
        <button
          type="button"
          onClick={handleStop}
          aria-label="Stop audio"
          className={`${theme.inkMuted} ${theme.inkHover} p-0.5 cursor-pointer`}
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={handleCycleRate}
        title="Playback speed"
        className={`font-mono text-[10px] ${theme.inkMuted} ${theme.inkHover} px-1 py-0.5 rounded cursor-pointer`}
      >
        {rate}x
      </button>
    </div>
  );
}
