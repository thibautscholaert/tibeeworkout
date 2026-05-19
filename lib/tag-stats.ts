import { EXERCISES, type ExerciseTag } from '@/lib/exercises';
import type { WorkoutSet } from '@/lib/types';

export type TagRepartitionSlice = {
  tag: ExerciseTag;
  count: number;
  percent: number;
  fill: string;
};

const TOP_TAGS = 12;

/** Distinct palette for up to 10 tag slices (oklch, dark-theme friendly). */
export const TAG_CHART_COLORS = [
  'oklch(0.75 0.18 145)',
  'oklch(0.65 0.15 200)',
  'oklch(0.7 0.12 280)',
  'oklch(0.8 0.15 80)',
  'oklch(0.62 0.2 30)',
  'oklch(0.72 0.16 25)',
  'oklch(0.68 0.14 170)',
  'oklch(0.78 0.12 320)',
  'oklch(0.7 0.1 240)',
  'oklch(0.82 0.11 55)',
] as const;

export function getTagsForExercise(exerciseName: string): ExerciseTag[] {
  const exercise = EXERCISES.find((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase());
  return exercise?.tags ?? [];
}

/** Aggregate set counts per exercise tag; returns the top N tags by volume. */
export function buildTopTagRepartition(history: WorkoutSet[], topN = TOP_TAGS): TagRepartitionSlice[] {
  const tagCounts = new Map<ExerciseTag, number>();

  for (const set of history) {
    const tags = getTagsForExercise(set.exerciseName);
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const top = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  const total = top.reduce((sum, [, count]) => sum + count, 0);

  return top.map(([tag, count], index) => ({
    tag,
    count,
    percent: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    fill: TAG_CHART_COLORS[index % TAG_CHART_COLORS.length],
  }));
}
