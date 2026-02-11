'use client';

import { saveWorkoutSet } from '@/app/actions';
import { ChronoIndicator } from '@/components/chrono-indicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { EXERCISES } from '@/lib/exercises';
import { setFormSchema, type SetFormData } from '@/lib/schemas';
import { getWithTTL, setWithTTL } from '@/lib/storage';
import { getTodaySession, groupTodaySessionByExercise } from '@/lib/today-session';
import { cn, formatReps, formatWeight, roundToNearest5 } from '@/lib/utils';
import { useWorkout } from '@/lib/workout-context';
import { getWorkoutSuggestions, isWarmupSet } from '@/lib/workout-suggestions';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BarChart3,
  BicepsFlexedIcon,
  Check,
  ChevronDown,
  Dumbbell,
  DumbbellIcon,
  Flame,
  Lightbulb,
  Plus,
  Search,
  SkipForward,
  Star,
  Target,
  TargetIcon,
  Trophy,
  WeightIcon,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

export function LogView() {
  const { history, fetchHistory, workoutPrograms } = useWorkout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [targetReps, setTargetReps] = useState<number>(0);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [programOpen, setProgramOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  // Load selected program/day from localStorage on mount
  useEffect(() => {
    const storedProgramTitle = getWithTTL<string>('selectedProgram');
    const storedDay = getWithTTL<string>('selectedSession');

    if (storedProgramTitle && workoutPrograms.length > 0) {
      // Find program by title instead of ID
      const program = workoutPrograms.find((p) => p.title === storedProgramTitle);
      if (program) {
        setSelectedProgram(program.id); // Store ID for internal use
        if (storedDay) {
          setSelectedSession(storedDay);
        }
      } else {
        // Clear invalid program from storage
        localStorage.removeItem('selectedProgram');
        localStorage.removeItem('selectedSession');
      }
    } else {
      // Auto-detect today's workout from history
      if (workoutPrograms.length > 0) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todaySets = history.filter((set) => {
          const setDate = new Date(set.timestamp);
          return setDate >= todayStart;
        });

        if (todaySets.length > 0) {
          // Get unique exercises from today
          const todayExercises = Array.from(new Set(todaySets.map((set) => set.exerciseName.toLowerCase())));

          // Try to match with a program/session
          for (const program of workoutPrograms) {
            for (const session of program.sessions) {
              const sessionExercises = session.blocs.flatMap((bloc) => bloc.exercises.map((ex) => ex.exerciseName.toLowerCase()));

              // Check if today's exercises match this session (at least 50% overlap)
              const matchCount = todayExercises.filter((ex) => sessionExercises.includes(ex)).length;
              const matchPercentage = matchCount / todayExercises.length;

              if (matchPercentage >= 0.5) {
                setSelectedProgram(program.id);
                const isAnyDay = session.day.toLowerCase() === 'any';
                setSelectedSession(isAnyDay ? session.session : session.day);
                // Save to localStorage
                setWithTTL('selectedProgram', program.title, 2 * 60 * 60 * 1000);
                setWithTTL('selectedSession', isAnyDay ? session.session : session.day, 2 * 60 * 60 * 1000);
                return; // Exit early once match is found
              }
            }
          }
        }
      }
    }
  }, [workoutPrograms, history]);

  // Save selected program to localStorage with 2-hour TTL (using title)
  const handleProgramSelect = (programId: string) => {
    const program = workoutPrograms.find((p) => p.id === programId);
    if (program) {
      setSelectedProgram(programId);
      setSelectedSession(''); // Reset day when program changes
      setProgramOpen(false);
      setWithTTL('selectedProgram', program.title, 2 * 60 * 60 * 1000); // Store title, not ID
    }
  };

  // Save selected day to localStorage with 2-hour TTL
  const handleSessionSelect = (day: string) => {
    setSelectedSession(day);
    setSessionOpen(false);
    setWithTTL('selectedSession', day, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
  };

  // Obtenir les séries d'aujourd'hui
  const todaySession = useMemo(() => {
    return getTodaySession(history);
  }, [history]);

  // Grouper les séries par exercice
  const todaySessionGrouped = useMemo(() => {
    return groupTodaySessionByExercise(todaySession);
  }, [todaySession]);

  // Obtenir les suggestions intelligentes (array)
  const allSuggestions = useMemo(() => {
    return getWorkoutSuggestions(workoutPrograms, history, selectedProgram, selectedSession);
  }, [workoutPrograms, history, selectedProgram, selectedSession]);

  // Obtenir la suggestion actuelle en fonction de l'index
  const suggestions = useMemo(() => {
    if (allSuggestions.length === 0) {
      return {
        nextExercise: null,
        programName: null,
        blocName: null,
        completedSeries: 0,
        totalSeries: 0,
        suggestedReps: null,
        suggestedCharge: null,
        exerciseDetails: null,
        completedExercises: [],
        remainingExercises: [],
        isCompletingCurrentExercise: false,
      };
    }
    return allSuggestions[Math.min(suggestionIndex, allSuggestions.length - 1)];
  }, [allSuggestions, suggestionIndex]);

  // Reset suggestion index when suggestions change
  useEffect(() => {
    setSuggestionIndex(0);
  }, [allSuggestions.length, selectedProgram, selectedSession]);

  // Handle skip functionality
  const handleSkipSuggestion = () => {
    if (suggestionIndex < allSuggestions.length - 1) {
      setSuggestionIndex((prev) => prev + 1);
    } else {
      // Loop back to the first suggestion
      setSuggestionIndex(0);
    }
  };

  // Calculate most practiced exercises (top 5 by number of sets)
  const mostPracticedExercises = useMemo(() => {
    const exerciseCounts = new Map<string, number>();
    history.forEach((set) => {
      const count = exerciseCounts.get(set.exerciseName) || 0;
      exerciseCounts.set(set.exerciseName, count + 1);
    });

    return (
      Array.from(exerciseCounts.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        // .slice(0, 19) // Take top x
        .map(([name]) => name)
    ); // Extract just the names
  }, [history]);

  // Get the suggested exercise as default, fallback to most practiced
  const defaultExercise = suggestions.nextExercise || (mostPracticedExercises.length > 0 ? mostPracticedExercises[0] : 'Pull up');

  // Get selected program details
  const selectedProgramData = useMemo(() => {
    return workoutPrograms.find((program) => program.id === selectedProgram);
  }, [workoutPrograms, selectedProgram]);

  // Get available sessions for selected program
  const availableDays = useMemo(() => {
    return selectedProgramData?.sessions || [];
  }, [selectedProgramData]);

  const hasOnlyAnyDay = useMemo(() => {
    return availableDays.every((session) => session.day.toLowerCase() === 'any');
  }, [availableDays]);

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
  });

  // Load saved exercise from localStorage and set default (client-side only)
  const [hasSetDefault, setHasSetDefault] = useState(false);
  useEffect(() => {
    if (!hasSetDefault) {
      const savedExercise = getWithTTL<string>('selectedExercise');
      const exerciseToSet = savedExercise || defaultExercise;
      if (exerciseToSet) {
        setValue('exerciseName', exerciseToSet);
        setHasSetDefault(true);
      }
    }
  }, [defaultExercise, setValue, hasSetDefault]);

  const selectedExercise = watch('exerciseName');

  // Save selectedExercise to localStorage whenever it changes
  useEffect(() => {
    if (selectedExercise) {
      setWithTTL('selectedExercise', selectedExercise, 2 * 60 * 60 * 1000); // 2 hours TTL
    }
  }, [selectedExercise]);

  const selectedExerciseData = useMemo(() => {
    return EXERCISES.find((ex) => ex.name.toLowerCase() === selectedExercise.toLowerCase());
  }, [selectedExercise]);

  // Calculate best 1RM for selected exercise (for target weight default / warmup)
  const best1RM = useMemo(() => {
    if (!selectedExerciseData || selectedExerciseData.bodyweight) return null;

    const exerciseSets = history.filter((set) => set.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;

    const oneRMs = exerciseSets.filter((set) => set.estimated1RM).map((set) => set.estimated1RM!);
    if (oneRMs.length === 0) return null;
    return Math.max(...oneRMs);
  }, [history, selectedExercise, selectedExerciseData]);

  // Best perf (same as stats page): best set by weight then reps
  const bestPerfRepsWeight = useMemo(() => {
    const exerciseSets = history.filter((s) => s.exerciseName === selectedExercise);
    if (exerciseSets.length === 0) return null;

    const bestSet = [...exerciseSets].sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return b.reps - a.reps;
    })[0];

    return bestSet ? { reps: bestSet.reps, weight: bestSet.weight } : null;
  }, [history, selectedExercise]);

  // Calculate best set for each exercise (today vs all time)
  const getBestSetComparison = useMemo(() => {
    return (exerciseName: string, todaySets: any[]) => {
      // Best set from today's session
      const todayBest = todaySets.reduce<any>((best, set) => {
        if (!best) return set;
        // Compare by estimated 1RM if available, otherwise by weight * reps
        const bestScore = best.estimated1RM || best.weight * best.reps;
        const setScore = set.estimated1RM || set.weight * set.reps;
        return setScore > bestScore ? set : best;
      }, null);

      // Best set from all time
      const allTimeSets = history.filter((set) => set.exerciseName === exerciseName);
      const allTimeBest = allTimeSets.reduce<any>((best, set) => {
        if (!best) return set;
        const bestScore = best.estimated1RM || best.weight * best.reps;
        const setScore = set.estimated1RM || set.weight * set.reps;
        return setScore > bestScore ? set : best;
      }, null);

      return { todayBest, allTimeBest };
    };
  }, [history]);

  // Update target weight and target reps when exercise changes
  useEffect(() => {
    const defaultTargetWeight = bestPerfRepsWeight?.weight ?? 0;
    const defaultTargetReps = bestPerfRepsWeight?.reps ?? 0;
    // if (selectedExerciseData?.warmupProtocol?.some((w) => w.weightUnit === '%')) {
    //   if (best1RM) {
    //     setTargetWeight(roundToNearest5(best1RM));
    //     setTargetReps(1);
    //   } else {
    //     const firstFixedWeight = selectedExerciseData.warmupProtocol.find((w) => w.weightUnit !== '%');
    //     if (firstFixedWeight) {
    //       setTargetWeight(roundToNearest5(parseFloat(firstFixedWeight.weight)));
    //       setTargetReps(firstFixedWeight.reps);
    //     } else {
    //       setTargetWeight(defaultTargetWeight);
    //       setTargetReps(defaultTargetReps);
    //     }
    //   }
    // } else {
    setTargetWeight(defaultTargetWeight);
    setTargetReps(defaultTargetReps);
    // }
  }, [selectedExercise, best1RM, selectedExerciseData, bestPerfRepsWeight]);

  const filteredExercises = useMemo(() => {
    let exercises = EXERCISES;
    if (searchQuery) {
      exercises = EXERCISES.filter((ex) => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    // Sort favorites first
    return [...exercises].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return 0;
    });
  }, [searchQuery]);

  const onSubmit = async (data: SetFormData) => {
    setIsSubmitting(true);
    try {
      const timestamp = new Date();
      await saveWorkoutSet({ ...data, timestamp });
      // Rafraîchir l'historique pour mettre à jour la session du jour
      fetchHistory();
      // Optionnel : reset weight et reps pour une saisie rapide
      // setValue("weight", 0)
      // setValue("reps", 0)
    } catch (error) {
      console.error('Failed to save set:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background pb-2 -mx-4 px-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Log Workout</h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <ChronoIndicator />
        </div>

        <Separator className="" />
      </div>

      {/* Program and Day Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="program" className="text-sm text-muted-foreground">
            Programme
          </Label>
          <Popover open={programOpen} onOpenChange={setProgramOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={programOpen} className="w-full justify-between">
                {selectedProgramData?.title || 'Select program...'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-3rem)] max-w-md p-0" align="start">
              <div className="max-h-[300px] overflow-y-auto p-1">
                {workoutPrograms.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No programs found.</p>
                ) : (
                  workoutPrograms.map((program) => (
                    <button
                      key={program.id}
                      type="button"
                      onClick={() => {
                        handleProgramSelect(program.id);
                      }}
                      className={cn(
                        'relative flex w-full cursor-pointer items-center rounded-md px-3 py-2.5 text-sm outline-none transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        selectedProgram === program.id && 'bg-accent/50'
                      )}
                    >
                      <Check className={cn('mr-2 h-4 w-4', selectedProgram === program.id ? 'opacity-100' : 'opacity-0')} />
                      {program.title}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="day" className="text-sm text-muted-foreground">
            {hasOnlyAnyDay ? 'Session' : 'Jour'}
          </Label>
          <Popover open={sessionOpen} onOpenChange={setSessionOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={sessionOpen} className="w-full justify-between" disabled={!selectedProgram}>
                {selectedSession || `Select ${hasOnlyAnyDay ? 'session' : 'jour'}...`}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-3rem)] max-w-md p-0" align="start">
              <div className="max-h-[300px] overflow-y-auto p-1">
                {availableDays.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {selectedProgram ? 'No sessions found.' : 'Select a program first.'}
                  </p>
                ) : (
                  availableDays.map((session) => {
                    const isAnyDay = session.day.toLowerCase() === 'any';
                    return (
                      <button
                        key={session.session}
                        type="button"
                        onClick={() => {
                          handleSessionSelect(isAnyDay ? session.session : session.day);
                        }}
                        className={cn(
                          'relative flex w-full cursor-pointer items-center rounded-md px-3 py-2.5 text-sm outline-none transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          (selectedSession === session.session || selectedSession === session.day) && 'bg-accent/50'
                        )}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedSession === session.session || selectedSession === session.day ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {isAnyDay ? `${session.session}` : `${session.day}`}
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator className="" />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Smart Suggestions */}
        {suggestions.nextExercise && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="px-2">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold text-sm">
                    Suggestion{' '}
                    <span className="font-normal text-xs">
                      ({suggestionIndex + 1}/{allSuggestions.length})
                    </span>
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {suggestions.programName}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{suggestions.nextExercise}</p>
                    <Badge variant={suggestions.isCompletingCurrentExercise ? 'default' : 'outline'} className="shrink-0 text-xs">
                      {suggestions.completedSeries}/{suggestions.totalSeries} séries
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Bloc: {suggestions.blocName} • {suggestions.suggestedReps} reps
                  </p>

                  <p className="text-xs text-muted-foreground flex gap-1 items-center">
                    {(suggestions.suggestedCharge ?? 0) > 0 ? (
                      <>
                        <DumbbellIcon className="inline h-4 w-4 mr-1" /> {suggestions.suggestedCharge} kg
                      </>
                    ) : (
                      <>
                        <WeightIcon className="inline h-4 w-4 mr-1" /> Poids du corps
                      </>
                    )}
                  </p>

                  {suggestions.exerciseDetails?.notes && (
                    <p className="text-xs text-primary/80 italic mt-1 flex gap-1 items-center">
                      <Lightbulb className="inline h-4 w-4 mr-1" /> {suggestions.exerciseDetails.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setValue('exerciseName', suggestions.nextExercise!);
                      if (suggestions.suggestedReps !== null) {
                        setValue('reps', suggestions.suggestedReps);
                      }
                      if (suggestions.suggestedCharge !== null) {
                        setValue('weight', suggestions.suggestedCharge);
                      } else {
                        setValue('weight', targetWeight);
                        setValue('reps', targetReps);
                      }
                    }}
                    className="text-sm"
                  >
                    <Zap className="mr-1 h-4 w-4" />
                    Utiliser
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSkipSuggestion}
                    variant="secondary"
                    className="text-sm"
                    disabled={!allSuggestions || allSuggestions.length <= 1}
                  >
                    <SkipForward className="mr-1 h-4 w-4" />
                    Skip
                  </Button>
                  {/* {suggestions.isCompletingCurrentExercise && (
                    <p className="text-xs text-center text-muted-foreground">Série {suggestions.completedSeries + 1}</p>
                  )} */}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Select */}
        <div className="space-y-2">
          {/* Exercise Favorites - Subtle suggestions */}
          {mostPracticedExercises.length > 0 && (
            <div className="flex gap-0.5 flex-wrap items-center justify-between overflow-y-auto h-16 pr-2">
              {mostPracticedExercises.map((exerciseName) => (
                <button
                  key={exerciseName}
                  type="button"
                  onClick={() => setValue('exerciseName', exerciseName)}
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

          {/* <Label htmlFor="exercise">Exercise</Label> */}
          <Popover open={exerciseOpen} onOpenChange={setExerciseOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={exerciseOpen}
                className={cn('w-full justify-between ', !selectedExercise && 'text-muted-foreground')}
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
                      key={exercise.name}
                      type="button"
                      onClick={() => {
                        setValue('exerciseName', exercise.name);
                        setExerciseOpen(false);
                        setSearchQuery('');
                      }}
                      className={cn(
                        'relative flex w-full cursor-pointer items-center rounded-md px-3 py-2.5 text-sm outline-none transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        selectedExercise === exercise.name && 'bg-accent/50'
                      )}
                    >
                      <Check className={cn('mr-2 h-4 w-4', selectedExercise === exercise.name ? 'opacity-100' : 'opacity-0')} />
                      {exercise.favorite && <Star className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />}
                      {exercise.name}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.exerciseName && <p className="text-sm text-destructive">{errors.exerciseName.message}</p>}
        </div>

        <Separator className="" />

        {/* Warmup Protocol + Target + Best perf */}
        <div className="bg-muted/30 rounded-lg p-2 border border-border/50 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setValue('weight', roundToNearest5(targetWeight));
                  setValue('reps', targetReps);
                }}
              >
                <TargetIcon className="h-5 w-5 text-green-600" />
              </button>
              <Input
                type="number"
                placeholder="target"
                step={0.5}
                value={targetWeight}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                className="h-6 w-10 text-xs text-center border-border/50 cursor-pointer hover:bg-accent/50 transition-colors"
              />
              <span className="text-xs font-bold text-muted-foreground">kg</span>
              <span className="text-xs text-muted-foreground">×</span>
              <Input
                type="number"
                placeholder="reps"
                min={1}
                value={targetReps || ''}
                onChange={(e) => setTargetReps(parseInt(e.target.value, 10) || 0)}
                className="h-6 w-8 text-xs text-center border-border/50 cursor-pointer hover:bg-accent/50 transition-colors"
              />
              {/* <span className="text-xs text-muted-foreground">reps</span> */}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {bestPerfRepsWeight != null && (
                <button
                  type="button"
                  onClick={() => {
                    setValue('weight', bestPerfRepsWeight.weight);
                    setTargetWeight(bestPerfRepsWeight.weight);
                    setValue('reps', bestPerfRepsWeight.reps);
                    setTargetReps(bestPerfRepsWeight.reps);
                  }}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <Trophy className="h-4 w-4" />
                  {formatReps(bestPerfRepsWeight.reps, selectedExercise)} × {formatWeight(bestPerfRepsWeight.weight, selectedExercise)}
                </button>
              )}
              {best1RM != null && (
                <button
                  type="button"
                  onClick={() => {
                    setValue('weight', roundToNearest5(best1RM));
                    setTargetWeight(roundToNearest5(best1RM));
                    setValue('reps', 1);
                    setTargetReps(1);
                  }}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-colors cursor-pointer"
                >
                  <Star className="h-4 w-4" />
                  1RM: {best1RM}kg
                </button>
              )}
            </div>
          </div>
          {selectedExerciseData?.warmupProtocol && (
            <div className="flex gap-1 flex-wrap items-center justify-center">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-muted-foreground">Warmup</span>
              {selectedExerciseData.warmupProtocol.map((warmupSet, index) => {
                const calculatedWeight =
                  warmupSet.weightUnit === '%' && targetWeight
                    ? roundToNearest5(targetWeight * (parseFloat(warmupSet.weight) / 100))
                    : roundToNearest5(parseFloat(warmupSet.weight));

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setValue('weight', calculatedWeight);
                      setValue('reps', warmupSet.reps);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-background border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <span className="font-medium">
                      {warmupSet.weightUnit === '%' && targetWeight
                        ? `${calculatedWeight}kg`
                        : warmupSet.weightUnit === '%'
                          ? `${warmupSet.weight}%`
                          : `${warmupSet.weight}kg`}
                    </span>
                    <span className="text-muted-foreground">×{warmupSet.reps}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Weight & Reps Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="weight" className="text-sm text-muted-foreground">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              step={0.5}
              inputMode="decimal"
              placeholder="0"
              className="h-10 text-lg font-semibold text-center"
              {...register('weight', { valueAsNumber: true })}
            />
            {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="reps" className="text-sm text-muted-foreground">
              {selectedExerciseData?.repType === 'time' ? 'Temps (s)' : 'Reps'}
            </Label>
            <Input
              id="reps"
              type="number"
              inputMode="numeric"
              placeholder="0"
              className="h-10 text-lg font-semibold text-center"
              {...register('reps', { valueAsNumber: true })}
            />
            {errors.reps && <p className="text-sm text-destructive">{errors.reps.message}</p>}
          </div>
        </div>

        {/* Quick Add Button */}
        <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold" disabled={isSubmitting}>
          <Plus className="mr-2 h-5 w-5" />
          {isSubmitting ? 'Ajout...' : 'Ajouter'}
        </Button>
      </form>

      {selectedExerciseData?.description && (
        <div className="mt-4 p-3 bg-muted rounded-lg border border-border" dangerouslySetInnerHTML={{ __html: selectedExerciseData.description }} />
      )}

      <Separator className="my-4" />

      {/* Today's Session */}
      {todaySession.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Session d'aujourd'hui</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {todaySession.length}
              </div>
              <span className="text-sm text-muted-foreground">série{todaySession.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Affichage groupé par exercice */}
          <div className="space-y-4">
            {todaySessionGrouped.map((exerciseGroup, groupIndex) => (
              <div key={exerciseGroup.exerciseName} className="relative">
                {/* Header de l'exercice */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                    <span className="text-lg font-bold text-primary">{groupIndex + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{exerciseGroup.exerciseName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {exerciseGroup.totalSets} série
                      {exerciseGroup.totalSets !== 1 ? 's' : ''} •{exerciseGroup.sets.reduce((total, set) => total + set.reps, 0)} reps au total
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {new Date(exerciseGroup.sets[0].timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {exerciseGroup.sets.length > 1 && (
                        <span>
                          {' '}
                          -{' '}
                          {new Date(exerciseGroup.sets[exerciseGroup.sets.length - 1].timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Séries en grille */}
                <div className="grid grid-cols-1 gap-2 ml-13">
                  {exerciseGroup.sets.map((set, index) => {
                    const { allTimeBest } = getBestSetComparison(exerciseGroup.exerciseName, exerciseGroup.sets);
                    const isWarmup = isWarmupSet(set, allTimeBest);

                    return (
                      <div
                        key={set.id}
                        className={cn(
                          'group relative overflow-hidden rounded-lg border p-3 transition-all hover:shadow-sm',
                          isWarmup
                            ? 'bg-gradient-to-r from-orange-50/10 to-card/80 hover:border-orange-300/50'
                            : 'border-border/50 bg-gradient-to-r from-card to-card/50 hover:border-primary/30'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold',
                                isWarmup ? 'bg-orange-100/20 text-orange-400' : 'bg-primary/10 text-primary'
                              )}
                            >
                              {index + 1}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                {isWarmup ? (
                                  <Flame className="h-4 w-4 text-orange-500 mr-1" />
                                ) : (
                                  <BicepsFlexedIcon className="h-4 w-4 text-primary mr-1" />
                                )}
                                <span className="text-sm font-medium">{formatWeight(set.weight, set.exerciseName)}</span>
                                <span className="text-xs text-muted-foreground">×</span>
                                <span className="text-sm font-medium">{set.reps}</span>
                                <span className="text-sm text-muted-foreground">
                                  {EXERCISES.find((ex) => ex.name.toLocaleLowerCase() === set.exerciseName.toLocaleLowerCase())?.repType === 'time'
                                    ? 'seconds'
                                    : 'reps'}
                                </span>
                              </div>
                              {set.estimated1RM && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">1RM:</span>
                                  <span className="text-xs font-medium text-primary">~{set.estimated1RM}kg</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(set.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        {/* Barre de progression visuelle */}
                        <div
                          className={cn(
                            'absolute bottom-0 left-0 h-0.5 transition-all group-hover:h-1',
                            isWarmup ? 'bg-gradient-to-r from-orange-300/30 to-orange-400/50' : 'bg-gradient-to-r from-primary/20 to-primary/40'
                          )}
                          style={{
                            width: `${((index + 1) / exerciseGroup.totalSets) * 100}%`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Statistiques de l'exercice - Améliorées */}
                {(() => {
                  const { todayBest, allTimeBest } = getBestSetComparison(exerciseGroup.exerciseName, exerciseGroup.sets);
                  const totalReps = exerciseGroup.sets.reduce((total, set) => total + set.reps, 0);

                  const todayScore = todayBest?.estimated1RM || todayBest?.weight * todayBest?.reps || 0;
                  const allTimeScore = allTimeBest?.estimated1RM || allTimeBest?.weight * allTimeBest?.reps || 0;
                  const isNewRecord = todayScore >= allTimeScore;

                  return (
                    <div className="mt-3 ml-13 flex items-center gap-4 rounded-lg bg-muted/30 p-2 text-xs text-muted-foreground">
                      <div className={`flex items-center gap-1 ${isNewRecord ? 'text-green-600 font-medium' : ''}`}>
                        <Trophy className={`h-3 w-3 ${isNewRecord ? 'text-green-600' : ''}`} />
                        <span>
                          Aujourd'hui: {formatWeight(todayBest?.weight || 0, exerciseGroup.exerciseName)} × {todayBest?.reps || 0}
                          {todayBest?.estimated1RM && ` (~${todayBest.estimated1RM}kg)`}
                          {isNewRecord && todayScore > 0 && ' 🔥'}
                        </span>
                      </div>
                      {allTimeBest && (
                        <div className={`flex items-center gap-1 ${!isNewRecord ? 'text-amber-600 font-medium' : ''}`}>
                          <Star className={`h-3 w-3 ${!isNewRecord ? 'text-amber-600' : ''}`} />
                          <span>
                            Record: {formatWeight(allTimeBest.weight, exerciseGroup.exerciseName)} × {allTimeBest.reps}
                            {allTimeBest.estimated1RM && ` (~${allTimeBest.estimated1RM}kg)`}
                            {!isNewRecord && ' 👑'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>{totalReps} reps total</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Separator entre les exercices */}
                {groupIndex < todaySessionGrouped.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Résumé global de la session - Amélioré */}
          <div className="mt-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-semibold">Résumé de la session</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{todaySessionGrouped.length}</div>
                <div className="text-xs text-muted-foreground">Exercices</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{todaySession.length}</div>
                <div className="text-xs text-muted-foreground">Séries totales</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{todaySession.reduce((total, set) => total + set.reps, 0)}</div>
                <div className="text-xs text-muted-foreground">Reps totales</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
