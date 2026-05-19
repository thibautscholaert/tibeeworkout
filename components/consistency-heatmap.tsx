'use client';

import type { WorkoutSet } from '@/lib/types';
import { cn, groupSetsByDate } from '@/lib/utils';
import { addDays, differenceInCalendarDays, differenceInWeeks, eachWeekOfInterval, format, isAfter, startOfDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemo, useState } from 'react';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const LEVEL_CLASSES = [
  'bg-muted/30 border-border/30',
  'bg-primary/25 border-primary/20',
  'bg-primary/45 border-primary/30',
  'bg-primary/70 border-primary/40',
  'bg-primary border-primary',
] as const;

type HeatmapCell = {
  date: Date;
  count: number;
  level: number;
  isFuture: boolean;
};

function getIntensityLevel(setCount: number, maxCount: number): number {
  if (setCount === 0) return 0;
  if (maxCount <= 0) return 1;
  const ratio = setCount / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function buildConsistencyGrid(history: WorkoutSet[]): {
  weeks: HeatmapCell[][];
  maxCount: number;
  activeDays: number;
  totalWeeks: number;
  totalDays: number;
} {
  const byDate = groupSetsByDate(history);
  const dailyCounts = new Map<string, number>();
  byDate.forEach((sets, dateKey) => {
    dailyCounts.set(dateKey, sets.length);
  });

  const maxCount = Math.max(0, ...dailyCounts.values());
  const today = startOfDay(new Date());
  const rangeEnd = startOfWeek(today, { weekStartsOn: 1 });

  // Start from the week of the oldest record
  const oldestDate = history.reduce((oldest, set) => {
    const d = startOfDay(new Date(set.timestamp));
    return d < oldest ? d : oldest;
  }, today);
  const rangeStart = startOfWeek(oldestDate, { weekStartsOn: 1 });

  const totalWeeks = differenceInWeeks(rangeEnd, rangeStart) + 1;
  const totalDays = differenceInCalendarDays(rangeEnd, rangeStart) + 1;
  const weekStarts = eachWeekOfInterval({ start: rangeStart, end: rangeEnd }, { weekStartsOn: 1 });

  const weeks = weekStarts.map((weekStart) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(weekStart, dayIndex);
      const count = dailyCounts.get(date.toDateString()) ?? 0;
      return {
        date,
        count,
        level: getIntensityLevel(count, maxCount),
        isFuture: isAfter(date, today),
      };
    })
  );

  let activeDays = 0;
  weeks.forEach((week) => {
    week.forEach((cell) => {
      if (!cell.isFuture && cell.count > 0) activeDays++;
    });
  });

  return { weeks, maxCount, activeDays, totalWeeks, totalDays };
}

type ConsistencyHeatmapProps = {
  history: WorkoutSet[];
  className?: string;
};

export function ConsistencyHeatmap({ history, className }: ConsistencyHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const { weeks, maxCount, activeDays, totalWeeks, totalDays } = useMemo(() => buildConsistencyGrid(history), [history]);

  const tooltipText = hoveredCell
    ? hoveredCell.count > 0
      ? `${format(hoveredCell.date, 'EEEE d MMM yyyy', { locale: fr })} — ${hoveredCell.count} série${hoveredCell.count > 1 ? 's' : ''}`
      : `${format(hoveredCell.date, 'EEEE d MMM yyyy', { locale: fr })} — repos`
    : null;

  if (history.length === 0) {
    return (
      <div className={cn('flex h-[140px] items-center justify-center text-sm text-muted-foreground', className)}>
        Aucune donnée pour afficher la consistance
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {activeDays} jour{activeDays > 1 ? 's' : ''} actif{activeDays > 1 ? 's' : ''} sur {totalWeeks} semaine{totalWeeks > 1 ? 's' : ''} (
          {totalDays} jour{totalDays > 1 ? 's' : ''})
        </span>
        {tooltipText && <span className="text-foreground font-medium truncate max-w-[14rem] sm:max-w-none">{tooltipText}</span>}
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-[3px] shrink-0">
          <div className="h-[14px]" /> {/* spacer for month labels row */}
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                'h-[11px] w-7 flex items-center text-[10px] text-muted-foreground leading-none',
                i % 2 === 0 ? 'opacity-100' : 'opacity-0 sm:opacity-100'
              )}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex gap-[3px] min-w-min">
            {weeks.map((week, weekIndex) => {
              const firstDay = week[0].date;
              const showMonth = weekIndex === 0 || firstDay.getDate() <= 7;
              return (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  <div className="relative h-[14px]">
                    {showMonth && (
                      <span className="absolute top-0 left-0 text-[9px] text-muted-foreground leading-none whitespace-nowrap">
                        {format(firstDay, 'MMM', { locale: fr })}
                        {firstDay.getMonth() === 0 || weekIndex === 0 ? ` ${format(firstDay, 'yy')}` : ''}
                      </span>
                    )}
                  </div>
                  {week.map((cell) => (
                    <button
                      key={cell.date.toISOString()}
                      type="button"
                      disabled={cell.isFuture}
                      aria-label={
                        cell.count > 0
                          ? `${format(cell.date, 'd MMMM yyyy', { locale: fr })}, ${cell.count} séries`
                          : `${format(cell.date, 'd MMMM yyyy', { locale: fr })}, repos`
                      }
                      className={cn(
                        'h-[11px] w-[11px] rounded-sm border transition-colors',
                        cell.isFuture ? 'bg-transparent border-transparent cursor-default' : LEVEL_CLASSES[cell.level],
                        !cell.isFuture &&
                          'hover:ring-1 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                      )}
                      onMouseEnter={() => !cell.isFuture && setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      onFocus={() => !cell.isFuture && setHoveredCell(cell)}
                      onBlur={() => setHoveredCell(null)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Moins</span>
        {LEVEL_CLASSES.map((levelClass, level) => (
          <div key={level} className={cn('h-[11px] w-[11px] rounded-sm border', levelClass)} />
        ))}
        <span>Plus</span>
        {maxCount > 0 && <span className="ml-2 hidden sm:inline">(max {maxCount} séries/jour)</span>}
      </div>
    </div>
  );
}
