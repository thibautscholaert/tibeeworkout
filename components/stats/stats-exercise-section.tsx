'use client';

import { ConsistencyHeatmap } from '@/components/consistency-heatmap';
import { BestPerfTooltip } from '@/components/stats/best-perf-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EXERCISES } from '@/lib/exercises';
import { useReactFormPersistence } from '@/lib/form-persistence';
import { calculate1RM, groupSetsBySession } from '@/lib/stats-utils';
import type { WorkoutSet } from '@/lib/types';
import { calculateEstimated1RM, cn, formatDate, formatReps, formatWeight, isBW } from '@/lib/utils';
import { BicepsFlexed, Check, ChevronDown, Dumbbell, Search, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type StatsExerciseSectionProps = {
  history: WorkoutSet[];
};

export function StatsExerciseSection({ history }: StatsExerciseSectionProps) {
  const { loadSavedValues, saveFormValues } = useReactFormPersistence('stats-filters-form', {
    selectedExercise: '',
    searchQuery: '',
  });

  const [selectedExercise, setSelectedExercise] = useState<string>(() => {
    const saved = loadSavedValues();
    return saved?.selectedExercise || '';
  });
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    const saved = loadSavedValues();
    return saved?.searchQuery || '';
  });

  useEffect(() => {
    saveFormValues({ selectedExercise, searchQuery });
  }, [selectedExercise, searchQuery, saveFormValues]);

  const exercises = useMemo(() => {
    const unique = new Set(history.map((s) => s.exerciseName));
    return Array.from(unique).sort();
  }, [history]);

  const mostPracticedExercises = useMemo(() => {
    const exerciseCounts = new Map<string, number>();
    history.forEach((set) => {
      const count = exerciseCounts.get(set.exerciseName) || 0;
      exerciseCounts.set(set.exerciseName, count + 1);
    });
    return Array.from(exerciseCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [history]);

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

  const exerciseData = useMemo(() => EXERCISES.find((ex) => ex.name === selectedExercise), [selectedExercise]);
  const repType = exerciseData?.repType ?? 'reps';

  const selectedExerciseHistory = useMemo(
    () => (selectedExercise ? history.filter((s) => s.exerciseName === selectedExercise) : []),
    [history, selectedExercise]
  );

  const chartData = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    const sessions = groupSetsBySession(exerciseSets);
    const sessionData = Array.from(sessions.entries()).map(([sessionKey, sets]) => ({
      sessionKey,
      value: sets.reduce((sum, set) => sum + set.reps, 0),
      date: formatDate(new Date(sessionKey)),
    }));
    return sessionData
      .sort((a, b) => new Date(a.sessionKey).getTime() - new Date(b.sessionKey).getTime())
      .map((d) => ({
        date: d.date,
        value: d.value,
        label: repType === 'time' ? 'Total Time' : 'Total Reps',
        metricType: 'reps' as const,
      }));
  }, [history, selectedExercise, repType]);

  const bestPerfChartData = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    const sessions = groupSetsBySession(exerciseSets);
    const sessionBestPerf = Array.from(sessions.entries()).map(([sessionKey, sets]) => {
      const bestSet = sets.sort((a, b) => {
        const oneRMA = calculateEstimated1RM(a.weight, a.reps, selectedExercise) || 0;
        const oneRMB = calculateEstimated1RM(b.weight, b.reps, selectedExercise) || 0;
        if (isBW(selectedExercise)) {
          if (oneRMA && oneRMB) return oneRMB - oneRMA;
          const volumeA = a.reps * (a.weight || 1);
          const volumeB = b.reps * (b.weight || 1);
          if (volumeB !== volumeA) return volumeB - volumeA;
          return b.weight - a.weight;
        }
        return oneRMB - oneRMA;
      })[0];
      if (!bestSet) return null;
      const oneRM = calculateEstimated1RM(bestSet.weight, bestSet.reps, selectedExercise);
      const value = oneRM || bestSet.weight;
      return {
        sessionKey,
        value,
        date: formatDate(new Date(sessionKey)),
        reps: bestSet.reps,
        weight: bestSet.weight,
        oneRM: value,
      };
    });
    return sessionBestPerf
      .filter((b): b is NonNullable<typeof b> => b !== null)
      .filter((b) => b.weight > 0)
      .sort((a, b) => new Date(a.sessionKey).getTime() - new Date(b.sessionKey).getTime())
      .map((d) => ({
        date: d.date,
        value: d.value,
        label: exerciseData?.bodyweight ? 'Meilleure perf (Reps)' : 'Meilleure perf (1RM)',
        metricType: exerciseData?.bodyweight ? ('reps' as const) : ('1rm' as const),
        reps: d.reps,
        weight: d.weight,
        oneRM: d.oneRM,
      }));
  }, [history, selectedExercise, exerciseData]);

  const volumeChartData = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    const sessions = groupSetsBySession(exerciseSets);
    const sessionBestPerf = Array.from(sessions.entries()).map(([sessionKey, sets]) => {
      const bestSet = sets.sort((a, b) => {
        if (exerciseData?.bodyweight) return b.reps - a.reps;
        const volumeA = a.reps * a.weight;
        const volumeB = b.reps * b.weight;
        if (volumeB !== volumeA) return volumeB - volumeA;
        return b.weight - a.weight;
      })[0];
      let value: number;
      if (exerciseData?.bodyweight) {
        value = bestSet.reps;
      } else {
        const oneRM = calculateEstimated1RM(bestSet.weight, bestSet.reps, selectedExercise);
        value = oneRM || bestSet.weight;
      }
      return {
        sessionKey,
        value,
        date: formatDate(new Date(sessionKey)),
        reps: bestSet.reps,
        weight: bestSet.weight,
        oneRM: value,
      };
    });
    return sessionBestPerf
      .sort((a, b) => new Date(a.sessionKey).getTime() - new Date(b.sessionKey).getTime())
      .map((d) => ({
        date: d.date,
        value: d.value,
        label: exerciseData?.bodyweight ? 'Meilleure perf (Reps)' : 'Meilleure perf (1RM)',
        metricType: exerciseData?.bodyweight ? ('reps' as const) : ('1rm' as const),
        reps: d.reps,
        weight: d.weight,
        oneRM: d.oneRM,
      }));
  }, [history, selectedExercise, exerciseData]);

  const maxRepsPerSet = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;
    const bestSet = exerciseSets.reduce((max, current) => (current.reps > (max?.reps ?? -1) ? current : max), exerciseSets[0]);
    return { date: bestSet.timestamp, count: bestSet.reps, weight: bestSet.weight };
  }, [history, selectedExercise]);

  const maxPerSession = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;
    const sessions = groupSetsBySession(exerciseSets);
    const sessionTotals = Array.from(sessions.entries()).map(([sessionKey, sets]) => ({
      date: new Date(sessionKey),
      count: sets.reduce((sum, set) => sum + set.reps, 0),
    }));
    return sessionTotals.reduce((max, current) => (current.count > (max?.count ?? -1) ? current : max), sessionTotals[0]);
  }, [history, selectedExercise]);

  const bestPerfRepsWeight = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;
    const bestSet = exerciseSets.sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return b.reps - a.reps;
    })[0];
    return bestSet ? { reps: bestSet.reps, weight: bestSet.weight, volume: bestSet.reps * bestSet.weight, date: new Date(bestSet.timestamp) } : null;
  }, [history, selectedExercise]);

  const best1RM = useMemo(() => {
    if (!exerciseData) return null;
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;
    const oneRMs = exerciseSets.map((set) => ({
      oneRM: calculate1RM(set.weight, set.reps),
      weight: set.weight,
      reps: set.reps,
    }));
    return oneRMs.reduce((max, current) => (current.oneRM > max.oneRM ? current : max));
  }, [history, selectedExercise, exerciseData]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const values = chartData.map((d) => d.value);
    const current = values[values.length - 1];
    const previous = values.length > 1 ? values[values.length - 2] : current;
    const max = Math.max(...values);
    const change = current - previous;
    const percentChange = previous > 0 ? ((change / previous) * 100).toFixed(1) : '0';
    const metricType = chartData[0]?.metricType || 'reps';
    return { current, max, bestSession: max, change, percentChange, metricType };
  }, [chartData]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Par exercice</h2>
      </div>

      {mostPracticedExercises.length > 0 && (
        <div className="flex gap-1 flex-wrap items-center justify-between overflow-y-auto h-16 pr-2">
          {mostPracticedExercises.map((exerciseName) => (
            <button
              key={exerciseName}
              type="button"
              onClick={() => setSelectedExercise(exerciseName)}
              className={cn(
                'px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                'border border-border/40 bg-muted/30 hover:bg-muted/60 hover:border-border/60',
                'text-muted-foreground hover:text-foreground',
                selectedExercise === exerciseName && 'bg-primary/10 border-primary/30 text-primary'
              )}
            >
              <span className="text-ellipsis overflow-hidden max-w-[6rem] block truncate">{exerciseName}</span>
            </button>
          ))}
        </div>
      )}

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

      {!selectedExercise ? (
        <p className="text-sm text-muted-foreground text-center py-8">Sélectionnez un exercice pour voir ses statistiques</p>
      ) : (
        <>
          {stats && (
            <div className="space-y-4">
              <header className="flex items-center gap-2">
                <BicepsFlexed className="h-5 w-5 text-primary" />
                <h3 className="text-base font-medium">Statistiques de performance</h3>
              </header>

              <div className="grid gap-3 grid-cols-2">
                {bestPerfRepsWeight !== null && (
                  <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 py-0">
                    <CardContent className="py-2 px-4">
                      <p className="text-sm text-muted-foreground">Meilleure perf</p>
                      <p className="text-2xl font-bold">
                        {formatReps(bestPerfRepsWeight.reps, selectedExercise)} × {formatWeight(bestPerfRepsWeight.weight, selectedExercise)}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDate(bestPerfRepsWeight.date)}</p>
                    </CardContent>
                  </Card>
                )}
                {best1RM !== null && (
                  <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 py-0">
                    <CardContent className="py-2 px-4">
                      <p className="text-sm text-muted-foreground">1RM Estimé</p>
                      <p className="text-2xl font-bold">{formatWeight(best1RM.oneRM, selectedExercise)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatReps(best1RM.reps, selectedExercise)} × {formatWeight(best1RM.weight, selectedExercise)}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {maxRepsPerSet !== null && (
                  <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 py-0">
                    <CardContent className="py-2 px-4">
                      <p className="text-sm text-muted-foreground">{repType === 'time' ? 'Max Time/Set' : 'Max Reps/Set'}</p>
                      <p className="text-2xl font-bold">
                        {formatReps(maxRepsPerSet.count, selectedExercise)} x {formatWeight(maxRepsPerSet.weight, selectedExercise)}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDate(new Date(maxRepsPerSet.date))}</p>
                    </CardContent>
                  </Card>
                )}
                {maxPerSession !== null && (
                  <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 py-0">
                    <CardContent className="py-2 px-4">
                      <p className="text-sm text-muted-foreground">{repType === 'time' ? 'Max Time/Session' : 'Max Reps/Session'}</p>
                      <p className="text-2xl font-bold">{formatReps(maxPerSession.count, selectedExercise)}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(maxPerSession.date)}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <header className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-base font-medium">Progression — {selectedExercise}</h3>
            </header>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Consistance</CardTitle>
                <CardDescription>Activité par jour</CardDescription>
              </CardHeader>
              <CardContent>
                <ConsistencyHeatmap key={selectedExercise} history={selectedExerciseHistory} />
              </CardContent>
            </Card>

            {bestPerfChartData.length > 0 && (
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Best 1RM Progress</CardTitle>
                  <CardDescription>Meilleure performance (1RM estimé) par session</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: exerciseData?.bodyweight ? 'Reps' : '1RM (kg)',
                        color: 'hsl(var(--chart-1))',
                      },
                    }}
                    className="h-[250px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bestPerfChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          className="fill-muted-foreground"
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <ChartTooltip
                          content={<BestPerfTooltip exerciseData={exerciseData} selectedExercise={selectedExercise} />}
                          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                        />
                        <Line type="monotone" dataKey="value" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {volumeChartData.length > 0 && (
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Volume Progress</CardTitle>
                  <CardDescription>Meilleure volume par session</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: exerciseData?.bodyweight ? 'Reps' : '1RM (kg)',
                        color: 'hsl(var(--chart-1))',
                      },
                    }}
                    className="h-[250px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={volumeChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          className="fill-muted-foreground"
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <ChartTooltip
                          content={<BestPerfTooltip exerciseData={exerciseData} selectedExercise={selectedExercise} />}
                          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                        />
                        <Line type="monotone" dataKey="value" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

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
                        <Line type="monotone" dataKey="value" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">No data for this exercise yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </section>
  );
}
