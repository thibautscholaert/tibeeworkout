import { EXERCISES } from '@/lib/exercises';
import type { WorkoutSet } from '@/lib/types';

export type TrainingStyleCategory = 'bodyweight' | 'powerlifting' | 'bodybuilding';

export const TRAINING_STYLE_LABELS: Record<TrainingStyleCategory, string> = {
  bodyweight: 'Poids du corps',
  powerlifting: 'Powerlifting',
  bodybuilding: 'Bodybuilding classique',
};

export const TRAINING_STYLE_COLORS: Record<TrainingStyleCategory, string> = {
  bodyweight: 'oklch(0.75 0.18 145)',
  powerlifting: 'oklch(0.8 0.15 80)',
  bodybuilding: 'oklch(0.65 0.15 200)',
};

const CATEGORY_ORDER: TrainingStyleCategory[] = ['bodyweight', 'powerlifting', 'bodybuilding'];

export type TrainingStyleSlice = {
  category: TrainingStyleCategory;
  label: string;
  count: number;
  percent: number;
  fill: string;
};

function getTrainingStyleCategory(exerciseName: string): TrainingStyleCategory | null {
  const exercise = EXERCISES.find((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase());
  if (!exercise) return null;

  if (exercise.bodyweight && !exercise.isPowerlifting) return 'bodyweight';
  if (exercise.isPowerlifting && !exercise.bodyweight) return 'powerlifting';
  if (!exercise.bodyweight && !exercise.isPowerlifting) return 'bodybuilding';

  return null;
}

/** One category per set (mutually exclusive). */
export function buildTrainingStyleRepartition(history: WorkoutSet[]): TrainingStyleSlice[] {
  const counts = new Map<TrainingStyleCategory, number>([
    ['bodyweight', 0],
    ['powerlifting', 0],
    ['bodybuilding', 0],
  ]);

  for (const set of history) {
    const category = getTrainingStyleCategory(set.exerciseName);
    if (!category) continue;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  const nonZero = CATEGORY_ORDER.map((category) => ({
    category,
    count: counts.get(category) ?? 0,
  })).filter((entry) => entry.count > 0);

  const total = nonZero.reduce((sum, entry) => sum + entry.count, 0);

  return nonZero
    .sort((a, b) => b.count - a.count)
    .map((entry) => ({
      category: entry.category,
      label: TRAINING_STYLE_LABELS[entry.category],
      count: entry.count,
      percent: total > 0 ? Math.round((entry.count / total) * 1000) / 10 : 0,
      fill: TRAINING_STYLE_COLORS[entry.category],
    }));
}
