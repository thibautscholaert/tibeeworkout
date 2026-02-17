'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { copySessionToClipboard } from '@/lib/clipboard-utils';
import { EXERCISES } from '@/lib/exercises';
import { cn, formatDate, formatReps, formatWeight, groupSetsByDate, groupSetsByExercise } from '@/lib/utils';
import { useWorkout } from '@/lib/workout-context';
import { isWarmupSet } from '@/lib/workout-suggestions';
import {
  BarChart3,
  BicepsFlexedIcon,
  Calendar,
  Check,
  Copy,
  Dumbbell,
  Filter,
  Flame,
  PersonStandingIcon,
  Target,
  TrendingUp,
  Trophy,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';

export function HistoryView() {
  const { history } = useWorkout();
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all unique exercise names from history
  const allExerciseNames = useMemo(() => {
    const names = Array.from(new Set(history.map((set) => set.exerciseName))).sort();
    return names;
  }, [history]);

  // Filter exercise names based on search query
  const filteredExerciseNames = useMemo(() => {
    if (!searchQuery) return allExerciseNames;
    return allExerciseNames.filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allExerciseNames, searchQuery]);

  const groupedByDate = useMemo(() => {
    const byDate = groupSetsByDate(history);
    // Sort by date descending
    return Array.from(byDate.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [history]);

  // Filter sessions by selected exercises
  const filteredGroupedByDate = useMemo(() => {
    if (selectedExercises.length === 0) return groupedByDate;

    return groupedByDate.filter(([_, sets]) => {
      const sessionExercises = new Set(sets.map((set) => set.exerciseName));
      return selectedExercises.some((exercise) => sessionExercises.has(exercise));
    });
  }, [groupedByDate, selectedExercises]);

  // Calculer les statistiques globales
  const totalStats = useMemo(() => {
    const filteredSets = selectedExercises.length === 0 ? history : history.filter((set) => selectedExercises.includes(set.exerciseName));

    const totalVolume = filteredSets.reduce((acc, set) => acc + set.weight * set.reps, 0);
    const totalReps = filteredSets.reduce((acc, set) => acc + set.reps, 0);
    const uniqueExercises = new Set(filteredSets.map((set) => set.exerciseName)).size;
    const totalDays = filteredGroupedByDate.length;

    return { totalVolume, totalReps, uniqueExercises, totalDays };
  }, [history, filteredGroupedByDate, selectedExercises]);

  const toggleExercise = (exerciseName: string) => {
    setSelectedExercises((prev) => (prev.includes(exerciseName) ? prev.filter((e) => e !== exerciseName) : [...prev, exerciseName]));
  };

  const clearFilters = () => {
    setSelectedExercises([]);
    setSearchQuery('');
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Aucun historique</h2>
          <p className="text-sm text-muted-foreground max-w-sm">Commencez à enregistrer vos séries pour voir votre historique d'entraînement ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Historique</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {filteredGroupedByDate.length}
          </div>
          <span className="text-sm text-muted-foreground">sessions</span>
        </div>
      </div>

      <Separator className="my-0" />

      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer par exercice
              {selectedExercises.length > 0 && (
                <Badge variant="default" className="ml-2 h-5 px-1.5">
                  {selectedExercises.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <div className="p-2 border-b">
              <Input placeholder="Rechercher un exercice..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8" />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {filteredExerciseNames.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucun exercice trouvé</p>
              ) : (
                filteredExerciseNames.map((exerciseName) => {
                  const isSelected = selectedExercises.includes(exerciseName);
                  const exerciseData = EXERCISES.find((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase());
                  const isPowerlifting = exerciseData?.isPowerlifting || false;
                  const isBodyweight = exerciseData?.bodyweight || false;

                  return (
                    <button
                      key={exerciseName}
                      type="button"
                      onClick={() => toggleExercise(exerciseName)}
                      className={cn(
                        'relative flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm outline-none transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        isSelected && 'bg-accent/50'
                      )}
                    >
                      <div className={cn('flex h-4 w-4 items-center justify-center rounded border', isSelected && 'bg-primary border-primary')}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="flex-1 text-left">{exerciseName}</span>
                      {isBodyweight ? <PersonStandingIcon className="h-4 w-4 text-green-600" /> : <Dumbbell className="h-3 w-3 text-blue-600" />}
                    </button>
                  );
                })
              )}
            </div>
            {selectedExercises.length > 0 && (
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full h-8">
                  <X className="h-4 w-4 mr-2" />
                  Effacer les filtres
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Display selected exercises as badges */}
        {selectedExercises.length > 0 && (
          <>
            {selectedExercises.map((exercise) => (
              <Badge key={exercise} variant="secondary" className="h-8 px-2">
                {exercise}
                <button onClick={() => toggleExercise(exercise)} className="ml-1.5 hover:bg-muted-foreground/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </>
        )}
      </div>

      <Separator className="my-0" />

      {/* Statistiques globales */}
      <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-primary" />
          <span className="font-semibold">Statistiques globales</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">{totalStats.totalDays}</div>
            <div className="text-xs text-muted-foreground">Jours</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">{totalStats.uniqueExercises}</div>
            <div className="text-xs text-muted-foreground">Exercices</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">{totalStats.totalVolume.toLocaleString()}kg</div>
            <div className="text-xs text-muted-foreground">Volume total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">{totalStats.totalReps.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Reps totales</div>
          </div>
        </div>
      </div>

      <Separator className="my-0" />

      {/* Sessions par date */}
      {filteredGroupedByDate.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted border border-muted-foreground/20">
            <Filter className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Aucune session trouvée</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Aucune session ne contient les exercices sélectionnés. Essayez de modifier vos filtres.
            </p>
            {selectedExercises.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                <X className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {filteredGroupedByDate.map(([dateString, sets], dateIndex) => {
            const byExercise = groupSetsByExercise(sets);
            const exerciseEntries = Array.from(byExercise.entries());
            const date = new Date(dateString);
            const isToday = dateString === new Date().toISOString().split('T')[0];
            const sessionVolume = sets.reduce((acc, set) => acc + set.weight * set.reps, 0);

            // Get exercise types for the header
            const exerciseTypes = exerciseEntries.map(([exerciseName]) => {
              const exerciseData = EXERCISES.find((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase());
              return {
                name: exerciseName,
                isPowerlifting: exerciseData?.isPowerlifting || false,
                isBodyweight: exerciseData?.bodyweight || false,
              };
            });

            const bodyweightCount = exerciseTypes.filter((e) => e.isBodyweight && !e.isPowerlifting).length;
            const otherCount = exerciseTypes.length - bodyweightCount;

            return (
              <AccordionItem key={dateString} value={dateString} className="border-none">
                <AccordionTrigger
                  className={`rounded-lg p-4 border-l-4 hover:no-underline ${isToday ? 'border-l-primary bg-primary/5 shadow-sm' : 'border-l-muted bg-muted/20'}`}
                >
                  <div className="flex items-start gap-4 w-full pr-2">
                    {/* <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                    <span className="text-xl font-bold text-primary">{dateIndex + 1}</span>
                  </div> */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className={`font-semibold text-lg flex items-center flex-wrap gap-2 ${isToday ? 'text-primary' : ''}`}>
                          {isToday ? <Flame className="h-5 w-5 text-orange-500" /> : <Calendar className="h-5 w-5 text-muted-foreground" />}
                          {formatDate(date)}
                          {isToday && (
                            <Badge variant="default" className="text-sm">
                              Aujourd'hui
                            </Badge>
                          )}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copySessionToClipboard(sets);
                          }}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                          {exerciseEntries.length} exercice{exerciseEntries.length > 1 ? 's' : ''} • {sets.length} série{sets.length > 1 ? 's' : ''}
                        </p>
                        {/* Exercise type badges */}
                        {otherCount > 0 && (
                          <Badge variant="outline" className="text-sm px-2 h-6 bg-blue-500/10 text-blue-600 border-blue-300/50">
                            <Dumbbell className="h-4 w-4 mr-1" />
                            {otherCount}
                          </Badge>
                        )}
                        {bodyweightCount > 0 && (
                          <Badge variant="outline" className="text-sm px-2 h-6 bg-green-500/10 text-green-600 border-green-300/50">
                            <PersonStandingIcon className="h-4 w-4 mr-1" />
                            {bodyweightCount}
                          </Badge>
                        )}
                      </div>
                      {/* Exercise names preview */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {exerciseEntries.map(([name], idx) => (
                          <span key={name} className="text-sm text-muted-foreground/70">
                            {name}
                            {idx < exerciseEntries.length - 1 && ' •'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  {/* Exercices de la session */}
                  <div className="space-y-3 ml-2 mt-2">
                    {exerciseEntries.map(([exerciseName, exerciseSets], exerciseIndex) => {
                      const totalVolume = exerciseSets.reduce((acc, s) => acc + s.weight * s.reps, 0);
                      const maxWeight = Math.max(...exerciseSets.map((s) => s.weight));
                      const avgReps = Math.round(exerciseSets.reduce((acc, s) => acc + s.reps, 0) / exerciseSets.length);

                      // Get all-time best for this exercise to determine warmup sets
                      const allTimeSetsForExercise = history.filter((set) => set.exerciseName === exerciseName);
                      const allTimeBest = allTimeSetsForExercise.reduce<any>((best, set) => {
                        if (!best) return set;
                        const bestScore = best.estimated1RM || best.weight * best.reps;
                        const setScore = set.estimated1RM || set.weight * set.reps;
                        return setScore > bestScore ? set : best;
                      }, null);

                      // Get exercise type info
                      const exerciseData = EXERCISES.find((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase());
                      const isPowerlifting = exerciseData?.isPowerlifting || false;
                      const isBodyweight = exerciseData?.bodyweight || false;

                      return (
                        <div key={exerciseName} className="space-y-1">
                          {/* Header de l'exercice */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                {exerciseIndex + 1}
                              </div>
                              <h4 className="font-medium text-sm">{exerciseName}</h4>
                              {isPowerlifting && (
                                <Badge variant="outline" className="text-xs p-1 bg-blue-500/10 text-blue-600 border-blue-300/50">
                                  <Dumbbell className="h-3.5 w-3.5" />
                                </Badge>
                              )}
                              {isBodyweight && !isPowerlifting && (
                                <Badge variant="outline" className="text-xs p-1 bg-green-500/10 text-green-600 border-green-300/50">
                                  <PersonStandingIcon className="h-3.5 w-3.5" />
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span className="whitespace-nowrap">{exerciseSets.length} séries</span>
                              <span className="text-primary font-medium whitespace-nowrap">Max: {formatWeight(maxWeight, exerciseName)}</span>
                            </div>
                          </div>

                          {/* Séries */}
                          <div className="grid grid-cols-1 gap-1">
                            {exerciseSets.map((set, setIndex) => {
                              const isWarmup = isWarmupSet(set, allTimeBest, exerciseSets);

                              return (
                                <div
                                  key={set.id}
                                  className={cn(
                                    'group relative overflow-hidden rounded-lg border py-1 px-2 transition-all',
                                    isWarmup
                                      ? 'border-orange-200/30 bg-orange-50/5 hover:bg-orange-50/10 hover:border-orange-300/50 hover:shadow-md'
                                      : isToday
                                        ? 'border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 hover:shadow-md'
                                        : 'border-primary/30 bg-card hover:bg-muted/50 hover:border-primary/50 hover:shadow-md'
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          'flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold',
                                          isWarmup ? 'bg-orange-100/20 text-orange-400' : 'bg-primary/10 text-primary'
                                        )}
                                      >
                                        {setIndex + 1}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isWarmup ? (
                                          <Flame className="h-3 w-3 text-orange-500 mr-0.5" />
                                        ) : (
                                          <BicepsFlexedIcon className="h-3 w-3 text-primary mr-0.5" />
                                        )}
                                        <span className="text-sm font-medium font-mono">{formatWeight(set.weight, set.exerciseName)}</span>
                                        <span className="text-xs text-muted-foreground">×</span>
                                        <span className="text-sm font-medium font-mono">{formatReps(set.reps, set.exerciseName)}</span>
                                      </div>
                                      {set.estimated1RM && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-muted-foreground">1RM:</span>
                                          <span className="text-xs font-medium text-primary">~{set.estimated1RM}kg</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(set.timestamp).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </div>
                                  </div>

                                  {/* Barre de progression */}
                                  <div
                                    className={cn(
                                      'absolute bottom-0 left-0 h-0.5 transition-all group-hover:h-1',
                                      isWarmup
                                        ? 'bg-gradient-to-r from-orange-300/30 to-orange-400/50'
                                        : 'bg-gradient-to-r from-primary/30 to-primary/60'
                                    )}
                                    style={{ width: `${((setIndex + 1) / exerciseSets.length) * 100}%` }}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          {/* Statistiques de l'exercice */}
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 rounded-lg bg-muted/30 p-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <BarChart3 className="h-3 w-3" />
                              <span>Volume: {totalVolume.toLocaleString()}kg</span>
                            </div>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <TrendingUp className="h-3 w-3" />
                              <span>Moy: {avgReps} reps</span>
                            </div>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <Trophy className="h-3 w-3" />
                              <span>Max: {formatWeight(maxWeight, exerciseName)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
