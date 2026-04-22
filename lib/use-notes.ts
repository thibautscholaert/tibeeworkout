'use client';

import { getNotes } from '@/app/actions';
import { dataCache } from '@/lib/data-cache';
import { useEffect, useState } from 'react';
import type { ExerciseNote } from './types';

/**
 * Custom hook to fetch and manage exercise notes data
 */
export function useNotes() {
  const [notes, setNotes] = useState<ExerciseNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to get from cache first
      if (!forceRefresh) {
        const cachedData = dataCache.get<ExerciseNote[]>('exercise-notes');
        if (cachedData) {
          setNotes(cachedData);
          setIsLoading(false);
          return;
        }
      }

      const result = await getNotes();
      if (result.success && result.data) {
        setNotes(result.data);
        // Cache for 3 minutes
        dataCache.set('exercise-notes', result.data, 3 * 60 * 1000);
      } else {
        setError(result.error || 'Failed to fetch notes');
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return { notes, isLoading, error, fetchNotes };
}

/**
 * Get note for a specific exercise
 */
export function useExerciseNote(exerciseName: string) {
  const { notes, isLoading, error, fetchNotes } = useNotes();

  const exerciseNote = notes.find(note => note.exerciseName === exerciseName);

  return { note: exerciseNote, isLoading, error, fetchNotes };
}
