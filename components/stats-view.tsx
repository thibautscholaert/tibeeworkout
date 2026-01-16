'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { EXERCISES } from '@/lib/exercises';
import type { WorkoutSet } from '@/lib/types';
import { cn, formatDate, formatReps, formatWeight } from '@/lib/utils';
import { useWorkout } from '@/lib/workout-context';
import { BicepsFlexed, Check, ChevronDown, Search, Star, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Helper function to calculate 1RM for any non-bodyweight exercise
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) return Math.round(weight * (1 + reps / 30));
  // Brzycki formula: weight × (36 / (37 - reps))
  return Math.round(weight * (36 / (37 - reps)));
}

// Helper function to group sets by session (day or 2h time range)
function groupSetsBySession(sets: WorkoutSet[]): Map<string, WorkoutSet[]> {
  const grouped = new Map<string, WorkoutSet[]>();

  // Sort sets by timestamp
  const sortedSets = [...sets].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  sortedSets.forEach((set) => {
    const setTime = set.timestamp.getTime();
    let sessionKey: string | null = null;
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    // Try to find an existing session within 2 hours
    // Check if the set is within 2h of any set in the session
    for (const [key, sessionSets] of grouped.entries()) {
      if (sessionSets.length === 0) continue;

      // Check if set is within 2h of any set in this session
      const isWithinRange = sessionSets.some((sessionSet) => {
        const timeDiff = Math.abs(setTime - sessionSet.timestamp.getTime());
        return timeDiff <= twoHoursInMs;
      });

      if (isWithinRange) {
        sessionKey = key;
        break;
      }
    }

    // If no session found within 2h, create a new one based on date
    if (!sessionKey) {
      sessionKey = new Date(set.timestamp).toDateString();
    }

    const existing = grouped.get(sessionKey) || [];
    grouped.set(sessionKey, [...existing, set]);
  });

  return grouped;
}

export function StatsView() {
  const { history, isLoading } = useWorkout();
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique exercises from history (same logic as history-view)
  const exercises = useMemo(() => {
    const unique = new Set(history.map((s) => s.exerciseName));
    return Array.from(unique).sort();
  }, [history]);

  // Calculate most practiced exercises (top 5 by number of sets)
  const mostPracticedExercises = useMemo(() => {
    const exerciseCounts = new Map<string, number>();
    history.forEach((set) => {
      const count = exerciseCounts.get(set.exerciseName) || 0;
      exerciseCounts.set(set.exerciseName, count + 1);
    });

    return Array.from(exerciseCounts.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 10)
      .map(([name]) => name); // Extract just the names
  }, [history]);

  // Set default exercise to most practiced, or first available if no history
  useEffect(() => {
    if (mostPracticedExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(mostPracticedExercises[0]);
    } else if (exercises.length > 0 && !exercises.includes(selectedExercise)) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise, mostPracticedExercises]);

  const filteredExercises = useMemo(() => {
    if (!searchQuery) return exercises;
    return exercises.filter((ex) => ex.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [exercises, searchQuery]);

  // Get exercise data
  const exerciseData = useMemo(() => {
    return EXERCISES.find((ex) => ex.name === selectedExercise);
  }, [selectedExercise]);

  const repType = exerciseData?.repType ?? 'reps';

  // Calculate chart data - cumulate reps/time per session
  const chartData = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    const sessions = groupSetsBySession(exerciseSets);

    // Cumulate reps/time per session
    const sessionData = Array.from(sessions.entries()).map(([sessionKey, sets]) => {
      const total = sets.reduce((sum, set) => sum + set.reps, 0);
      return {
        sessionKey,
        value: total,
        date: formatDate(new Date(sessionKey)),
      };
    });

    return sessionData
      .sort((a, b) => new Date(a.sessionKey).getTime() - new Date(b.sessionKey).getTime())
      .map((d) => ({
        date: d.date,
        value: d.value,
        label: repType === 'time' ? 'Total Time' : 'Total Reps',
        metricType: 'reps' as const,
      }));
  }, [history, selectedExercise, repType]);

  // Calculate max reps/time per set
  const maxRepsPerSet = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;
    return Math.max(...exerciseSets.map((set) => set.reps));
  }, [history, selectedExercise]);

  // Calculate max per session (grouped by day or 2h range)
  const maxPerSession = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;

    const sessions = groupSetsBySession(exerciseSets);
    const sessionTotals = Array.from(sessions.values()).map((sets) => sets.reduce((sum, set) => sum + set.reps, 0));

    return sessionTotals.length > 0 ? Math.max(...sessionTotals) : null;
  }, [history, selectedExercise]);

  // Calculate best performance (reps * weight)
  const bestPerfRepsWeight = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;

    // Find the set with the best weight
    const maxWeight = Math.max(...exerciseSets.map((set) => set.weight));
    const bestSet = exerciseSets.find((set) => set.weight === maxWeight);

    return bestSet
      ? {
          reps: bestSet.reps,
          weight: bestSet.weight,
          volume: bestSet.reps * bestSet.weight,
        }
      : null;
  }, [history, selectedExercise]);

  // Calculate best 1RM (only for non-bodyweight exercises)
  const best1RM = useMemo(() => {
    if (!exerciseData || exerciseData.bodyweight) return null;

    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;

    // Calculate 1RM for each set using the helper function
    const oneRMs = exerciseSets.map((set) => {
      const oneRM = calculate1RM(set.weight, set.reps);
      return { oneRM, weight: set.weight, reps: set.reps };
    });

    if (oneRMs.length === 0) return null;

    // Find the best 1RM
    const best = oneRMs.reduce((max, current) => (current.oneRM > max.oneRM ? current : max));

    return best;
  }, [history, selectedExercise, exerciseData]);

  // Calculate stats
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const values = chartData.map((d) => d.value);
    const current = values[values.length - 1];
    const previous = values.length > 1 ? values[values.length - 2] : current;
    const max = Math.max(...values);
    const change = current - previous;
    const percentChange = previous > 0 ? ((change / previous) * 100).toFixed(1) : '0';
    const metricType = chartData[0]?.metricType || 'reps';

    // Best session is the max cumulated reps/time
    const bestSession = max;

    return { current, max, bestSession, change, percentChange, metricType };
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
          <TrendingUp className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Loading Stats...</h2>
          <p className="text-sm text-muted-foreground">Fetching your workout data</p>
        </div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">No Stats Yet</h2>
          <p className="text-sm text-muted-foreground">Log some workouts to see your progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
          {/* <p className="text-sm text-muted-foreground">Track your progress over time</p> */}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">{exercises.length}</div>
          <span className="text-sm text-muted-foreground">exercices</span>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Exercise Favorites - Subtle suggestions */}
      {mostPracticedExercises.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Star className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Exercices favoris</span>
            <div className="flex-1 h-px bg-border/50"></div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {mostPracticedExercises.map((exerciseName) => (
              <button
                key={exerciseName}
                type="button"
                onClick={() => setSelectedExercise(exerciseName)}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  'border border-border/40 bg-muted/30 hover:bg-muted/60 hover:border-border/60',
                  'text-muted-foreground hover:text-foreground',
                  selectedExercise === exerciseName && 'bg-primary/10 border-primary/30 text-primary'
                )}
              >
                <span className="text-ellipsis overflow-hidden max-w-[120px] block truncate">{exerciseName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Selector */}
      <div className="space-y-2">
        <Popover open={exerciseOpen} onOpenChange={setExerciseOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={exerciseOpen}
              className={cn('w-full justify-between h-12 text-base', !selectedExercise && 'text-muted-foreground')}
            >
              {selectedExercise || 'Select exercise...'}
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
                      setSelectedExercise(exercise);
                      setExerciseOpen(false);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'relative flex w-full cursor-pointer items-center rounded-md px-3 py-2.5 text-sm outline-none transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      selectedExercise === exercise && 'bg-accent/50'
                    )}
                  >
                    <Check className={cn('mr-2 h-4 w-4', selectedExercise === exercise ? 'opacity-100' : 'opacity-0')} />
                    {exercise}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator className="my-2" />

      {/* Stats Cards */}
      {stats && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BicepsFlexed className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Statistiques de performance</h2>
          </div>

          <div className="grid gap-3 grid-cols-2">
            {maxRepsPerSet !== null && (
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{repType === 'time' ? 'Max Time/Set' : 'Max Reps/Set'}</p>
                  <p className="text-2xl font-bold">{formatReps(maxRepsPerSet, selectedExercise)}</p>
                  <p className="text-sm text-muted-foreground">Max en une série</p>
                </CardContent>
              </Card>
            )}
            {maxPerSession !== null && (
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{repType === 'time' ? 'Max Time/Session' : 'Max Reps/Session'}</p>
                  <p className="text-2xl font-bold">{formatReps(maxPerSession, selectedExercise)}</p>
                  <p className="text-sm text-muted-foreground">Max par session</p>
                </CardContent>
              </Card>
            )}
            {bestPerfRepsWeight !== null && (
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Meilleure perf</p>
                  <p className="text-2xl font-bold">
                    {formatReps(bestPerfRepsWeight.reps, selectedExercise)} × {formatWeight(bestPerfRepsWeight.weight, selectedExercise)}
                  </p>
                  <p className="text-sm text-muted-foreground">{bestPerfRepsWeight.volume} kg total</p>
                </CardContent>
              </Card>
            )}
            {best1RM !== null && (
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">1RM Estimé</p>
                  <p className="text-2xl font-bold">{formatWeight(best1RM.oneRM, selectedExercise)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatReps(best1RM.reps, selectedExercise)} × {formatWeight(best1RM.weight, selectedExercise)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Separator className="my-2" />

      {/* Chart */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Progression dans le temps</h2>
        </div>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{repType === 'time' ? 'Total Time Progress' : 'Total Reps Progress'}</CardTitle>
            <CardDescription>{repType === 'time' ? 'Cumulé du temps par session' : 'Cumulé des reps par session'}</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  value: {
                    label: chartData[0]?.label || 'Value',
                    color: 'hsl(var(--chart-1))',
                  },
                }}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      className="fill-muted-foreground"
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'var(--color-value)' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">No data for this exercise yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
