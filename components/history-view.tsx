"use client"

import { useMemo, useEffect, useState } from "react"
import { Calendar } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWorkoutHistory } from "@/app/actions"
import { formatDate, groupSetsByDate, groupSetsByExercise, formatWeight } from "@/lib/utils"
import type { WorkoutSet } from "@/lib/types"

export function HistoryView() {
  const [history, setHistory] = useState<WorkoutSet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true)
      try {
        const result = await getWorkoutHistory()
        if (result.success && result.data) {
          // Transform the data from the action to match WorkoutSet type
          const transformedHistory: WorkoutSet[] = result.data.map((item, index) => ({
            id: `history-${index}-${item.timestamp}`,
            exerciseName: item.exerciseName,
            weight: item.weight,
            reps: item.reps,
            timestamp: new Date(item.timestamp),
            estimated1RM: item.oneRM,
          }))
          setHistory(transformedHistory)
        }
      } catch (error) {
        console.error("Failed to fetch workout history:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const groupedByDate = useMemo(() => {
    const byDate = groupSetsByDate(history)
    // Sort by date descending
    return Array.from(byDate.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
  }, [history])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Calendar className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Loading History...</h2>
          <p className="text-sm text-muted-foreground">Fetching your workout data</p>
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">No Workout History</h2>
          <p className="text-sm text-muted-foreground">Start logging sets to see your history here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">{history.length} total sets logged</p>
      </div>

      {/* Grouped Workouts */}
      <div className="space-y-4">
        {groupedByDate.map(([dateString, sets]) => {
          const byExercise = groupSetsByExercise(sets)
          const exerciseEntries = Array.from(byExercise.entries())
          const date = new Date(dateString)

          return (
            <Card key={dateString}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <Accordion type="multiple" className="w-full">
                  {exerciseEntries.map(([exerciseName, exerciseSets]) => {
                    const totalVolume = exerciseSets.reduce((acc, s) => acc + s.weight * s.reps, 0)
                    const maxWeight = Math.max(...exerciseSets.map((s) => s.weight))

                    return (
                      <AccordionItem key={exerciseName} value={exerciseName} className="border-border/50">
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex flex-1 items-center justify-between pr-2">
                            <span className="font-medium">{exerciseName}</span>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{exerciseSets.length} sets</span>
                              <span className="text-primary font-medium">{formatWeight(maxWeight, exerciseName)}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pb-2">
                            {exerciseSets.map((set, idx) => (
                              <div
                                key={set.id}
                                className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                                    {idx + 1}
                                  </span>
                                  <span className="font-mono">
                                    {formatWeight(set.weight, set.exerciseName)} × {set.reps}
                                  </span>
                                </div>
                                {set.estimated1RM && (
                                  <span className="text-sm text-muted-foreground">~{set.estimated1RM} 1RM</span>
                                )}
                              </div>
                            ))}
                            <div className="mt-2 flex justify-between border-t border-border/50 pt-2 text-sm text-muted-foreground">
                              <span>Total Volume</span>
                              <span className="font-semibold text-foreground">{totalVolume.toLocaleString()} kg</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
