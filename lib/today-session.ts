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
  sets: WorkoutSet[];
  totalSets: number;
}[] {
  // const exerciseGroups = new Map<string, WorkoutSet[]>();
  let key = '';
  const list: {
    exerciseName: string;
    sets: WorkoutSet[];
    totalSets: number;
  }[] = [];

  todaySession.forEach((set) => {
    if (key === set.exerciseName) {
      list[list.length - 1].sets.push(set);
      list[list.length - 1].totalSets++;
    } else {
      key = set.exerciseName;
      list.push({
        exerciseName: set.exerciseName,
        sets: [set],
        totalSets: 1,
      });
    }
  });


  return list;
}
