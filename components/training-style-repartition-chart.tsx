'use client';

import { RepartitionPieChart } from '@/components/repartition-pie-chart';
import { buildTrainingStyleRepartition, type TrainingStyleCategory } from '@/lib/training-style-stats';
import type { WorkoutSet } from '@/lib/types';
import { Dumbbell, PersonStanding, Trophy, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

const TRAINING_STYLE_ICONS: Record<TrainingStyleCategory, LucideIcon> = {
  bodyweight: PersonStanding,
  powerlifting: Trophy,
  bodybuilding: Dumbbell,
};

type TrainingStyleRepartitionChartProps = {
  history: WorkoutSet[];
  className?: string;
};

export function TrainingStyleRepartitionChart({ history, className }: TrainingStyleRepartitionChartProps) {
  const slices = useMemo(() => buildTrainingStyleRepartition(history), [history]);

  const data = useMemo(
    () =>
      slices.map((slice) => ({
        name: slice.label,
        count: slice.count,
        percent: slice.percent,
        fill: slice.fill,
        icon: TRAINING_STYLE_ICONS[slice.category],
      })),
    [slices]
  );

  const totalSets = useMemo(() => data.reduce((sum, slice) => sum + slice.count, 0), [data]);

  return (
    <RepartitionPieChart
      className={className}
      data={data}
      filled
      hasHistory={history.length > 0}
      summary={`${totalSets.toLocaleString()} séries réparties par style d'entraînement`}
      noDataMessage="Aucun exercice reconnu (poids du corps, powerlifting ou bodybuilding)"
    />
  );
}
