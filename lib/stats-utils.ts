import type { WorkoutSet } from '@/lib/types';

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) return Math.round(weight * (1 + reps / 30));
  const res = weight * (36 / (37 - reps));
  return Math.round(res);
}

export function groupSetsBySession(sets: WorkoutSet[]): Map<string, WorkoutSet[]> {
  const grouped = new Map<string, WorkoutSet[]>();
  const sortedSets = [...sets].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  sortedSets.forEach((set) => {
    const setTime = set.timestamp.getTime();
    let sessionKey: string | null = null;
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    for (const [key, sessionSets] of grouped.entries()) {
      if (sessionSets.length === 0) continue;

      const isWithinRange = sessionSets.some((sessionSet) => {
        const timeDiff = Math.abs(setTime - sessionSet.timestamp.getTime());
        return timeDiff <= twoHoursInMs;
      });

      if (isWithinRange) {
        sessionKey = key;
        break;
      }
    }

    if (!sessionKey) {
      sessionKey = new Date(set.timestamp).toDateString();
    }

    const existing = grouped.get(sessionKey) || [];
    grouped.set(sessionKey, [...existing, set]);
  });

  return grouped;
}
