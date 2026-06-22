import type { WorkoutVariant } from './schemas';
import { WorkoutSet } from './types';

// Fonction pour obtenir les séries d'aujourd'hui
export function getTodaySession(history: WorkoutSet[]): WorkoutSet[] {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  return history
    .filter((set) => {
      const setDate = new Date(set.timestamp);
      return setDate >= todayStart && setDate < todayEnd;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Trier par ordre chronologique
}

export function groupTodaySessionByExercise(todaySession: WorkoutSet[]): {
  exerciseName: string;
  variant: WorkoutVariant;
  sets: WorkoutSet[];
  totalSets: number;
}[] {
  let key = '';
  const list: {
    exerciseName: string;
    variant: WorkoutVariant;
    sets: WorkoutSet[];
    totalSets: number;
  }[] = [];

  todaySession.forEach((set) => {
    const variant = set.variant || 'default';
    const groupKey = `${set.exerciseName}\u0000${variant}`;

    if (key === groupKey) {
      list[list.length - 1].sets.push(set);
      list[list.length - 1].totalSets++;
    } else {
      key = groupKey;
      list.push({
        exerciseName: set.exerciseName,
        variant,
        sets: [set],
        totalSets: 1,
      });
    }
  });

  return list;
}
