import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { WorkoutSet } from "./types"
import { EXERCISES } from "./exercises"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateEstimated1RM(weight: number, reps: number, exerciseName?: string): number | undefined {
  // Ne calculer le 1RM que pour les exercices de powerlifting/bodybuilding
  if (exerciseName) {
    const exercise = EXERCISES.find((ex) => ex.name === exerciseName)
    if (!exercise || !exercise.isPowerlifting) {
      return undefined
    }
  }

  if (reps === 1) return weight
  if (reps > 12) return Math.round(weight * (1 + reps / 30))
  // Brzycki formula: weight × (36 / (37 - reps))
  return Math.round(weight * (36 / (37 - reps)))
}

export function formatWeight(weight: number, exerciseName?: string): string {
  if (exerciseName) {
    const exercise = EXERCISES.find((ex) => ex.name === exerciseName)
    if (exercise?.bodyweight) {
      if (weight === 0) {
        return "BW"
      } else {
        return `+${weight}kg`
      }
    }
  }
  return `${weight} kg`
}

export function formatDate(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function groupSetsByDate(sets: WorkoutSet[]): Map<string, WorkoutSet[]> {
  const grouped = new Map<string, WorkoutSet[]>()
  sets.forEach((set) => {
    const dateKey = new Date(set.timestamp).toDateString()
    const existing = grouped.get(dateKey) || []
    grouped.set(dateKey, [...existing, set])
  })
  return grouped
}

export function groupSetsByExercise(sets: WorkoutSet[]): Map<string, WorkoutSet[]> {
  const grouped = new Map<string, WorkoutSet[]>()
  sets.forEach((set) => {
    const existing = grouped.get(set.exerciseName) || []
    grouped.set(set.exerciseName, [...existing, set])
  })
  return grouped
}
