'use client';

import { RepartitionPieChart } from '@/components/repartition-pie-chart';
import { buildTopTagRepartition } from '@/lib/tag-stats';
import type { WorkoutSet } from '@/lib/types';
import { useMemo } from 'react';

type ExerciseTagsRepartitionChartProps = {
  history: WorkoutSet[];
  className?: string;
};

export function ExerciseTagsRepartitionChart({ history, className }: ExerciseTagsRepartitionChartProps) {
  const slices = useMemo(() => buildTopTagRepartition(history), [history]);

  const data = useMemo(
    () =>
      slices.map((slice) => ({
        name: slice.tag,
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
      summary={`${totalSets.toLocaleString()} attributions de tags sur le top 10 (une série peut compter dans plusieurs tags)`}
      noDataMessage="Aucun exercice reconnu avec des tags dans l'historique"
    />
  );
}
