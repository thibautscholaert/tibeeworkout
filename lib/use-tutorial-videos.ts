'use client';

import { getTutorialVideos } from '@/app/actions';
import { dataCache } from '@/lib/data-cache';
import { useEffect, useState } from 'react';
import type { TutorialVideo } from './types';

export function useTutorialVideos() {
  const [tutorialVideos, setTutorialVideos] = useState<TutorialVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTutorialVideos = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!forceRefresh) {
        const cachedData = dataCache.get<TutorialVideo[]>('tutorial-videos');
        if (cachedData) {
          setTutorialVideos(cachedData);
          setIsLoading(false);
          return;
        }
      }

      const result = await getTutorialVideos();
      if (result.success && result.data) {
        setTutorialVideos(result.data);
        dataCache.set('tutorial-videos', result.data, 3 * 60 * 1000);
      } else {
        setError(result.error || 'Failed to fetch tutorial videos');
      }
    } catch (err) {
      console.error('Failed to fetch tutorial videos:', err);
      setError('Failed to fetch tutorial videos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorialVideos();
  }, []);

  return { tutorialVideos, isLoading, error, fetchTutorialVideos };
}
