"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { WorkoutSet } from "./types"
import { calculateEstimated1RM } from "./utils"

interface WorkoutContextType {
  currentSession: WorkoutSet[]
  history: WorkoutSet[]
  addSet: (set: Omit<WorkoutSet, "id" | "timestamp" | "estimated1RM">) => void
  removeSet: (id: string) => void
  clearSession: () => void
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

// Sample historical data for demo
const SAMPLE_HISTORY: WorkoutSet[] = [
  {
    id: "1",
    exerciseName: "Bench Press",
    weight: 135,
    reps: 10,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    estimated1RM: 180,
  },
  {
    id: "2",
    exerciseName: "Bench Press",
    weight: 155,
    reps: 8,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    estimated1RM: 191,
  },
  {
    id: "3",
    exerciseName: "Squat",
    weight: 185,
    reps: 8,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    estimated1RM: 228,
  },
  {
    id: "4",
    exerciseName: "Deadlift",
    weight: 225,
    reps: 5,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    estimated1RM: 253,
  },
  {
    id: "5",
    exerciseName: "Bench Press",
    weight: 145,
    reps: 10,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    estimated1RM: 193,
  },
  {
    id: "6",
    exerciseName: "Bench Press",
    weight: 165,
    reps: 6,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    estimated1RM: 191,
  },
  {
    id: "7",
    exerciseName: "Overhead Press",
    weight: 95,
    reps: 8,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    estimated1RM: 117,
  },
  {
    id: "8",
    exerciseName: "Squat",
    weight: 195,
    reps: 6,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    estimated1RM: 226,
  },
  {
    id: "9",
    exerciseName: "Squat",
    weight: 205,
    reps: 5,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    estimated1RM: 231,
  },
  {
    id: "10",
    exerciseName: "Deadlift",
    weight: 245,
    reps: 5,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    estimated1RM: 276,
  },
  {
    id: "11",
    exerciseName: "Bench Press",
    weight: 155,
    reps: 8,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    estimated1RM: 191,
  },
  {
    id: "12",
    exerciseName: "Bench Press",
    weight: 175,
    reps: 4,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    estimated1RM: 191,
  },
  {
    id: "13",
    exerciseName: "Overhead Press",
    weight: 100,
    reps: 6,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    estimated1RM: 116,
  },
]

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<WorkoutSet[]>([])
  const [history, setHistory] = useState<WorkoutSet[]>(SAMPLE_HISTORY)

  const addSet = useCallback((set: Omit<WorkoutSet, "id" | "timestamp" | "estimated1RM">) => {
    const newSet: WorkoutSet = {
      ...set,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      estimated1RM: calculateEstimated1RM(set.weight, set.reps, set.exerciseName),
    }
    setCurrentSession((prev) => [...prev, newSet])
    setHistory((prev) => [...prev, newSet])
  }, [])

  const removeSet = useCallback((id: string) => {
    setCurrentSession((prev) => prev.filter((set) => set.id !== id))
    setHistory((prev) => prev.filter((set) => set.id !== id))
  }, [])

  const clearSession = useCallback(() => {
    setCurrentSession([])
  }, [])

  return (
    <WorkoutContext.Provider value={{ currentSession, history, addSet, removeSet, clearSession }}>
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
