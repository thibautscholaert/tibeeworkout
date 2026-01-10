"use client"

import { useState, useMemo, useEffect } from "react"
import { TrendingUp, ChevronDown, Check, Search } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getWorkoutHistory } from "@/app/actions"
import { cn, formatDate } from "@/lib/utils"
import type { WorkoutSet } from "@/lib/types"

export function StatsView() {
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
  const [selectedExercise, setSelectedExercise] = useState<string>("Bench Press")
  const [exerciseOpen, setExerciseOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Get unique exercises from history
  const exercises = useMemo(() => {
    const unique = new Set(history.map((s) => s.exerciseName))
    return Array.from(unique).sort()
  }, [history])

  const filteredExercises = useMemo(() => {
    if (!searchQuery) return exercises
    return exercises.filter((ex) => ex.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [exercises, searchQuery])

  // Calculate chart data
  const chartData = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise)

    // Group by date and get max 1RM for each day
    const byDate = new Map<string, number>()
    exerciseSets.forEach((set) => {
      const dateKey = new Date(set.timestamp).toDateString()
      const current = byDate.get(dateKey) || 0
      if (set.estimated1RM && set.estimated1RM > current) {
        byDate.set(dateKey, set.estimated1RM)
      }
    })

    return Array.from(byDate.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, estimated1RM]) => ({
        date: formatDate(new Date(date)),
        estimated1RM,
      }))
  }, [history, selectedExercise])

  // Calculate stats
  const stats = useMemo(() => {
    if (chartData.length === 0) return null

    const values = chartData.map((d) => d.estimated1RM)
    const current = values[values.length - 1]
    const previous = values.length > 1 ? values[values.length - 2] : current
    const max = Math.max(...values)
    const change = current - previous
    const percentChange = previous > 0 ? ((change / previous) * 100).toFixed(1) : "0"

    return { current, max, change, percentChange }
  }, [chartData])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <TrendingUp className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Loading Stats...</h2>
          <p className="text-sm text-muted-foreground">Fetching your workout data</p>
        </div>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">No Stats Yet</h2>
          <p className="text-sm text-muted-foreground">Log some workouts to see your progress</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
        <p className="text-sm text-muted-foreground">Track your progress over time</p>
      </div>

      {/* Exercise Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Exercise</label>
        <Popover open={exerciseOpen} onOpenChange={setExerciseOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={exerciseOpen}
              className="w-full justify-between h-12 bg-transparent"
            >
              {selectedExercise}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-3rem)] max-w-md p-0" align="start">
            <div className="flex items-center border-b border-border px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 h-11"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {filteredExercises.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No exercise found.</p>
              ) : (
                filteredExercises.map((exercise) => (
                  <button
                    key={exercise}
                    type="button"
                    onClick={() => {
                      setSelectedExercise(exercise)
                      setExerciseOpen(false)
                      setSearchQuery("")
                    }}
                    className={cn(
                      "relative flex w-full cursor-pointer items-center rounded-md px-3 py-2.5 text-sm outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      selectedExercise === exercise && "bg-accent/50",
                    )}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedExercise === exercise ? "opacity-100" : "opacity-0")}
                    />
                    {exercise}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-secondary/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Current 1RM</p>
              <p className="text-2xl font-bold">{stats.current} kg</p>
              {stats.change !== 0 && (
                <p className={cn("text-sm font-medium", stats.change > 0 ? "text-primary" : "text-destructive")}>
                  {stats.change > 0 ? "+" : ""}
                  {stats.change} kg ({stats.percentChange}%)
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-secondary/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">All-Time Max</p>
              <p className="text-2xl font-bold">{stats.max} kg</p>
              <p className="text-sm text-muted-foreground">Estimated 1RM</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Estimated 1RM Progress</CardTitle>
          <CardDescription>Based on Brzycki formula</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer
              config={{
                estimated1RM: {
                  label: "Est. 1RM",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    domain={["dataMin - 10", "dataMax + 10"]}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="estimated1RM"
                    stroke="var(--color-estimated1RM)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-estimated1RM)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No data for this exercise yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
