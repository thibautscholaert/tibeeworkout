export interface WorkoutSet {
  id: string
  exerciseName: string
  weight: number
  reps: number
  timestamp: Date
  estimated1RM?: number
}

export interface WorkoutSession {
  date: string
  sets: WorkoutSet[]
}

export interface ExerciseHistory {
  exerciseName: string
  sessions: {
    date: string
    sets: WorkoutSet[]
  }[]
}
