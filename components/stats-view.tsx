'use client';

import { StatsExerciseSection } from '@/components/stats/stats-exercise-section';
import { StatsGlobalSection } from '@/components/stats/stats-global-section';
import { useReactFormPersistence } from '@/lib/form-persistence';
import { cn } from '@/lib/utils';
import { useWorkout } from '@/lib/workout-context';
import { BarChart3, Dumbbell, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

export type StatsViewMode = 'global' | 'exercise';

export function StatsView() {
  const { history, isLoading } = useWorkout();

  const { loadSavedValues, saveFormValues } = useReactFormPersistence('stats-view-mode', {
    view: 'global' as StatsViewMode,
  });

  const [view, setView] = useState<StatsViewMode>(() => {
    const saved = loadSavedValues();
    return saved?.view === 'exercise' ? 'exercise' : 'global';
  });

  useEffect(() => {
    saveFormValues({ view });
  }, [view, saveFormValues]);

  const exerciseCount = useMemo(() => new Set(history.map((s) => s.exerciseName)).size, [history]);

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

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <motion.div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
          <TrendingUp className="h-8 w-8 text-primary" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">No Stats Yet</h2>
          <p className="text-sm text-muted-foreground">Log some workouts to see your progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
        <div className="flex items-center gap-2 shrink-0">
          <motion.div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {exerciseCount}
          </motion.div>
          <span className="text-sm text-muted-foreground">exercices</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
        <button
          type="button"
          onClick={() => setView('global')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
            view === 'global' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <BarChart3 className="h-4 w-4 shrink-0" />
          Global
        </button>
        <button
          type="button"
          onClick={() => setView('exercise')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
            view === 'exercise' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Dumbbell className="h-4 w-4 shrink-0" />
          Par exercice
        </button>
      </div>

      <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {view === 'global' ? <StatsGlobalSection history={history} /> : <StatsExerciseSection history={history} />}
      </motion.div>
    </div>
  );
}
