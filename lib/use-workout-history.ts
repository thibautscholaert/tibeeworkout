"use client"

import { getWorkoutHistory } from "@/app/actions"
import { useEffect, useState } from "react"
import type { WorkoutSet } from "./types"

/**
 * Custom hook to fetch and transform workout history data
 * Shared logic between history-view and stats-view for consistency
 */
export function useWorkoutHistory() {
  const [history, setHistory] = useState<WorkoutSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getWorkoutHistory()
      if (result.success && result.data) {
        const transformedHistory: WorkoutSet[] = result.data.map((item, index) => ({
          id: `history-${index}-${item.timestamp}`,
          exerciseName: item.exerciseName,
          weight: item.weight,
          reps: item.reps,
          timestamp: new Date(item.timestamp),
          estimated1RM: item.oneRM,
        }))
        setHistory(transformedHistory)
      } else {
        setError(result.error || "Failed to fetch workout history")
      }
    } catch (err) {
      console.error("Failed to fetch workout history:", err)
      setError("Failed to fetch workout history")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  return { history, isLoading, error, fetchHistory }
}
