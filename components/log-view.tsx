"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X, Check, ChevronDown, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { setFormSchema, type SetFormData } from "@/lib/schemas"
import { EXERCISES } from "@/lib/exercises"
import { useWorkout } from "@/lib/workout-context"
import { saveWorkoutSet } from "@/app/actions"
import { cn, formatWeight } from "@/lib/utils"
import { useWorkoutHistory } from "@/lib/use-workout-history"

export function LogView() {
  const { currentSession, addSet, removeSet } = useWorkout()
  const { history } = useWorkoutHistory()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [exerciseOpen, setExerciseOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Calculate most practiced exercises (top 5 by number of sets)
  const mostPracticedExercises = useMemo(() => {
    const exerciseCounts = new Map<string, number>()
    history.forEach((set) => {
      const count = exerciseCounts.get(set.exerciseName) || 0
      exerciseCounts.set(set.exerciseName, count + 1)
    })
    
    return Array.from(exerciseCounts.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 5) // Take top 5
      .map(([name]) => name) // Extract just the names
  }, [history])

  // Get the most practiced exercise as default
  const defaultExercise = mostPracticedExercises.length > 0 
    ? mostPracticedExercises[0] 
    : "Pull up"

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SetFormData>({
    resolver: zodResolver(setFormSchema),
    defaultValues: {
      exerciseName: defaultExercise,
      weight: 0,
      reps: 0,
    },
  })

  // Update default exercise when history loads (only once)
  const [hasSetDefault, setHasSetDefault] = useState(false)
  useEffect(() => {
    if (mostPracticedExercises.length > 0 && !hasSetDefault) {
      setValue("exerciseName", mostPracticedExercises[0])
      setHasSetDefault(true)
    }
  }, [mostPracticedExercises, setValue, hasSetDefault])

  const selectedExercise = watch("exerciseName")

  const selectedExerciseData = useMemo(() => {
    return EXERCISES.find((ex) => ex.name === selectedExercise)
  }, [selectedExercise])

  const filteredExercises = useMemo(() => {
    let exercises = EXERCISES
    if (searchQuery) {
      exercises = EXERCISES.filter((ex) => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    // Sort favorites first
    return [...exercises].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      return 0
    })
  }, [searchQuery])

  const onSubmit = async (data: SetFormData) => {
    setIsSubmitting(true)
    try {
      const timestamp = new Date()
      await saveWorkoutSet({ ...data, timestamp })
      addSet({
        exerciseName: data.exerciseName,
        weight: data.weight,
        reps: data.reps,
      })
      // Keep exercise selected, reset weight and reps for quick entry
      // setValue("weight", 0)
      // setValue("reps", 0)
    } catch (error) {
      console.error("Failed to save set:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Log Workout</h1>
        {/* <p className="text-sm text-muted-foreground">Quick entry between sets</p> */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Exercise Shortcuts */}
        {mostPracticedExercises.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center justify-center">
            {mostPracticedExercises.map((exerciseName) => (
              <Button
                key={exerciseName}
                type="button"
                variant={selectedExercise === exerciseName ? "default" : "outline"}
                size="sm"
                onClick={() => setValue("exerciseName", exerciseName)}
                className="flex-1"
              >
                {exerciseName}
              </Button>
            ))}
          </div>
        )}

        {/* Exercise Select */}
        <div className="space-y-2">
          <Label htmlFor="exercise">Exercise</Label>
          <Popover open={exerciseOpen} onOpenChange={setExerciseOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={exerciseOpen}
                className={cn("w-full justify-between h-12 text-base", !selectedExercise && "text-muted-foreground")}
              >
                {selectedExercise || "Select exercise..."}
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
                      key={exercise.name}
                      type="button"
                      onClick={() => {
                        setValue("exerciseName", exercise.name)
                        setExerciseOpen(false)
                        setSearchQuery("")
                      }}
                      className={cn(
                        "relative flex w-full cursor-pointer items-center rounded-md px-3 py-2.5 text-sm outline-none transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        selectedExercise === exercise.name && "bg-accent/50",
                      )}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedExercise === exercise.name ? "opacity-100" : "opacity-0")}
                      />
                      {exercise.favorite && (
                        <Star className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                      )}
                      {exercise.name}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.exerciseName && <p className="text-sm text-destructive">{errors.exerciseName.message}</p>}
        </div>

        {/* Weight & Reps Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              inputMode="decimal"
              placeholder="0"
              className="h-14 text-xl font-semibold text-center"
              {...register("weight", { valueAsNumber: true })}
            />
            {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps">{selectedExerciseData?.repType === "time" ? "Temps (s)" : "Reps"}</Label>
            <Input
              id="reps"
              type="number"
              inputMode="numeric"
              placeholder="0"
              className="h-14 text-xl font-semibold text-center"
              {...register("reps", { valueAsNumber: true })}
            />
            {errors.reps && <p className="text-sm text-destructive">{errors.reps.message}</p>}
          </div>
        </div>

        {/* Quick Add Button */}
        <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold" disabled={isSubmitting}>
          <Plus className="mr-2 h-5 w-5" />
          {isSubmitting ? "Adding..." : "Quick Add"}
        </Button>
      </form>

      {/* Current Session */}
      {currentSession.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Session</h2>
            <span className="text-sm text-muted-foreground">
              {currentSession.length} set{currentSession.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {currentSession.map((set, index) => (
              <Card key={set.id} className="bg-secondary/50">
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{set.exerciseName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatWeight(set.weight, set.exerciseName)} × {set.reps}{" "}
                        {EXERCISES.find((ex) => ex.name === set.exerciseName)?.repType === "time" ? "s" : "reps"}
                        {set.estimated1RM && <span className="ml-2 text-primary">~{set.estimated1RM} 1RM</span>}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSet(set.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove set</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
