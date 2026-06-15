import { EXERCISES, type ExerciseCategory, type ExerciseTag } from '@/lib/exercises';
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

/** Category colors grouped by prefix family:
 *  pull_* → green shades
 *  push_* → blue shades
 *  squat / hinge → amber/orange shades
 *  core → red/rose shade
 *  skill → purple shade
 *  mobility / conditioning → teal/cyan shades
 */
export const CATEGORY_CHART_COLORS: Record<ExerciseCategory, string> = {
  pull_vertical: 'oklch(0.72 0.18 145)',
  pull_horizontal: 'oklch(0.60 0.15 155)',
  push_vertical: 'oklch(0.65 0.18 240)',
  push_horizontal: 'oklch(0.55 0.15 250)',
  squat: 'oklch(0.78 0.17 75)',
  hinge: 'oklch(0.68 0.16 55)',
  core: 'oklch(0.65 0.2 25)',
  skill: 'oklch(0.68 0.16 300)',
  mobility: 'oklch(0.72 0.14 185)',
  conditioning: 'oklch(0.65 0.13 200)',
  cardio: 'oklch(0.65 0.13 200)',
};

export type CategoryRepartitionSlice = {
  category: ExerciseCategory;
  count: number;
  percent: number;
  fill: string;
};

export function getCategoryForExercise(exerciseName: string): ExerciseCategory[] {
  const exercise = EXERCISES.find((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase());
  return exercise?.category ?? [];
}

/** Group order for sequential display: pull_* together, push_* together, then the rest. */
const CATEGORY_GROUP_ORDER: ExerciseCategory[] = [
  'pull_vertical',
  'pull_horizontal',
  'push_vertical',
  'push_horizontal',
  'squat',
  'hinge',
  'core',
  'skill',
  'mobility',
  'conditioning',
];

/** Aggregate set counts per exercise category; returns categories sorted by group then by volume within each group. */
export function buildCategoryRepartition(history: WorkoutSet[]): CategoryRepartitionSlice[] {
  const categoryCounts = new Map<ExerciseCategory, number>();

  for (const set of history) {
    const categories = getCategoryForExercise(set.exerciseName);
    categories.forEach((category) => {
      if (category) {
        categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
      }
    });
  }

  const entries = Array.from(categoryCounts.entries());

  // Sort by group order first, then by count descending within the same group
  const sorted = entries.sort(([catA, countA], [catB, countB]) => {
    const groupA = CATEGORY_GROUP_ORDER.indexOf(catA);
    const groupB = CATEGORY_GROUP_ORDER.indexOf(catB);
    if (groupA !== groupB) return groupA - groupB;
    return countB - countA;
  });

  const total = sorted.reduce((sum, [, count]) => sum + count, 0);

  return sorted.map(([category, count]) => ({
    category,
    count,
    percent: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    fill: CATEGORY_CHART_COLORS[category],
  }));
}
