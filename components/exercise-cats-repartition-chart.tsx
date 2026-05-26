'use client';

import { RepartitionPieChart } from '@/components/repartition-pie-chart';
import { buildCategoryRepartition } from '@/lib/tag-stats';
import type { WorkoutSet } from '@/lib/types';
import { useMemo } from 'react';

type ExerciseCatsRepartitionChartProps = {
  history: WorkoutSet[];
  className?: string;
};

export function ExerciseCatsRepartitionChart({ history, className }: ExerciseCatsRepartitionChartProps) {
  const slices = useMemo(() => buildCategoryRepartition(history), [history]);

  const data = useMemo(
    () =>
      slices.map((slice) => ({
        name: slice.category,
        count: slice.count,
        percent: slice.percent,
        fill: slice.fill,
      })),
    [slices]
  );

  const totalSets = useMemo(() => data.reduce((sum, slice) => sum + slice.count, 0), [data]);

  return (
    <RepartitionPieChart
      className={className}
      data={data}
      hasHistory={history.length > 0}
      summary={`${totalSets.toLocaleString()} séries réparties par catégorie d'exercice`}
      noDataMessage="Aucun exercice reconnu avec des catégories dans l'historique"
    />
  );
}
