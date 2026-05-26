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
export type TimeRange = '1w' | '2w' | '1m' | '3m' | 'all' | 'nw';

const SHORTCUT_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '1w', label: '1S' },
  { value: '2w', label: '2S' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: 'all', label: 'Tout' },
];

function filterHistoryByWeeks<T extends { timestamp: Date }>(history: T[], weeks: number): T[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  return history.filter((s) => new Date(s.timestamp) >= cutoff);
}

function filterHistoryByRange<T extends { timestamp: Date }>(history: T[], range: TimeRange, customWeeks: number): T[] {
  if (range === 'all') return history;
  if (range === 'nw') return filterHistoryByWeeks(history, customWeeks);
  if (range === '1w') return filterHistoryByWeeks(history, 1);
  if (range === '2w') return filterHistoryByWeeks(history, 2);
  const now = new Date();
  const months = range === '1m' ? 1 : 3;
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  return history.filter((s) => new Date(s.timestamp) >= cutoff);
}

export function StatsView() {
  const { history, isLoading } = useWorkout();

  const { loadSavedValues, saveFormValues } = useReactFormPersistence('stats-view-mode', {
    view: 'global' as StatsViewMode,
    timeRange: 'all' as TimeRange,
    customWeeks: 4,
  });

  const [view, setView] = useState<StatsViewMode>(() => {
    const saved = loadSavedValues();
    return saved?.view === 'exercise' ? 'exercise' : 'global';
  });

  const [timeRange, setTimeRange] = useState<TimeRange>(() => {
    const saved = loadSavedValues();
    const validRanges: TimeRange[] = ['1w', '2w', '1m', '3m', 'all', 'nw'];
    return validRanges.includes(saved?.timeRange) ? saved.timeRange : 'all';
  });

  const [customWeeks, setCustomWeeks] = useState<number>(() => {
    const saved = loadSavedValues();
    return typeof saved?.customWeeks === 'number' && saved.customWeeks > 0 ? saved.customWeeks : 4;
  });

  useEffect(() => {
    saveFormValues({ view, timeRange, customWeeks });
  }, [view, timeRange, customWeeks, saveFormValues]);

  const filteredHistory = useMemo(() => filterHistoryByRange(history, timeRange, customWeeks), [history, timeRange, customWeeks]);

  const exerciseCount = useMemo(() => new Set(filteredHistory.map((s) => s.exerciseName)).size, [filteredHistory]);

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

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
          {SHORTCUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeRange(opt.value)}
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                timeRange === opt.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Dernières</span>
          <input
            type="number"
            min={1}
            max={104}
            value={customWeeks}
            onChange={(e) => {
              const val = Math.max(1, Math.min(104, Number(e.target.value)));
              setCustomWeeks(val);
              setTimeRange('nw');
            }}
            onFocus={() => setTimeRange('nw')}
            className={cn(
              'w-14 rounded-md border px-2 py-1 text-xs text-center transition-colors bg-background',
              timeRange === 'nw' ? 'border-primary text-foreground' : 'border-border/60 text-muted-foreground'
            )}
          />
          <span className="text-xs text-muted-foreground shrink-0">semaines</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setView('global')}
          className={cn(
            'flex items-center justify-center gap-4 rounded-xl border text-sm font-medium transition-all py-3',
            view === 'global'
              ? 'border-green-500/60 bg-green-500/10 text-green-500 shadow-sm shadow-green-500/10'
              : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-green-500/30 hover:text-green-400'
          )}
        >
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
              view === 'global' ? 'bg-green-500/20' : 'bg-muted/50'
            )}
          >
            <BarChart3 className="h-4 shrink-0" />
          </div>
          Global
        </button>
        <button
          type="button"
          onClick={() => setView('exercise')}
          className={cn(
            'flex items-center justify-center gap-4 rounded-xl border text-sm font-medium transition-all py-3',
            view === 'exercise'
              ? 'border-green-500/60 bg-green-500/10 text-green-500 shadow-sm shadow-green-500/10'
              : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-green-500/30 hover:text-green-400'
          )}
        >
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
              view === 'exercise' ? 'bg-green-500/20' : 'bg-muted/50'
            )}
          >
            <Dumbbell className="h-4 shrink-0" />
          </div>
          Par exercice
        </button>
      </div>

      <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {view === 'global' ? <StatsGlobalSection history={filteredHistory} /> : <StatsExerciseSection history={filteredHistory} />}
      </motion.div>
    </div>
  );
}
