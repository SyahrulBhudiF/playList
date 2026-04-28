import { useState, useCallback, useEffect } from 'react';
import type { Track } from '../types';

export interface PlaybackState {
  isPlaying: boolean;
  progress: number;
}

export function usePlayback(initialTrack: Track | null = null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (initialTrack) setIsPlaying(true);
    else setIsPlaying(false);
  }, [initialTrack]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  return {
    isPlaying,
    setIsPlaying,
    progress,
    setProgress,
    togglePlay,
    updateProgress
  };
}
