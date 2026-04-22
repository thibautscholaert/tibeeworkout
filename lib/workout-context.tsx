'use client';

import { useNotes } from '@/lib/use-notes';
import { useWorkoutHistory } from '@/lib/use-workout-history';
import { useWorkoutPrograms } from '@/lib/use-workout-programs';
import { createContext, useContext, type ReactNode } from 'react';
import type { ExerciseNote, Program, WorkoutSet } from './types';

interface WorkoutContextType {
  history: WorkoutSet[];
  workoutPrograms: Program[];
  notes: ExerciseNote[];
  fetchHistory: (forceRefresh?: boolean) => void;
  fetchNotes: (forceRefresh?: boolean) => void;
  isLoading: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { history, fetchHistory, isLoading: isLoadingHistory } = useWorkoutHistory();
  const { workoutPrograms, isLoading: isLoadingPrograms } = useWorkoutPrograms();
  const { notes, fetchNotes, isLoading: isLoadingNotes } = useNotes();

  return (
    <WorkoutContext.Provider
      value={{
        history,
        fetchHistory,
        workoutPrograms,
        notes,
        fetchNotes,
        isLoading: isLoadingHistory || isLoadingPrograms || isLoadingNotes,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
