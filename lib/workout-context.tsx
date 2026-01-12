"use client"

import { useWorkoutHistory } from "@/lib/use-workout-history"
import { useWorkoutPrograms } from "@/lib/use-workout-programs"
import { createContext, useContext, type ReactNode } from "react"
import type { Program, WorkoutSet } from "./types"

interface WorkoutContextType {
  history: WorkoutSet[]
  workoutPrograms: Program[]
  fetchHistory: () => void
  isLoading: boolean
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { history, fetchHistory, isLoading: isLoadingHistory } = useWorkoutHistory()
  const { workoutPrograms , isLoading: isLoadingPrograms } = useWorkoutPrograms()

  return (
    <WorkoutContext.Provider value={{ 
      history, 
      fetchHistory, 
      workoutPrograms,
      isLoading: isLoadingHistory || isLoadingPrograms
    }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  const context = useContext(WorkoutContext)
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider")
  }
  return context
}
