import { EXERCISES } from './exercises';
import { groupSetsByExercise } from './utils';

export const copySessionToClipboard = async (sets: any[]) => {
  try {
    const groupedByExercise = groupSetsByExercise(sets);
    const sessionText = Array.from(groupedByExercise.entries())
      .map(([exerciseName, exerciseSets]) => {
        // Grouper les séries par poids pour le format compact
        const setsByWeight = exerciseSets.reduce((acc, set) => {
          const weightKey = set.weight === 0 ? 'BW' : `${set.weight}kg`;
          if (!acc[weightKey]) {
            acc[weightKey] = [];
          }
          acc[weightKey].push(set.reps);
          return acc;
        }, {} as Record<string, number[]>);

        // Vérifier si c'est un exercice de type time
        const exerciseData = EXERCISES.find((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase());
        const isTimeType = exerciseData?.repType === 'time';

        // Formater chaque groupe de poids
        const weightLines = Object.entries(setsByWeight).map(([weight, reps]) => {
          const repsStr = reps.map(rep => isTimeType ? `${rep}''` : rep).join('/');
          return `${exerciseName} ${weight} ${repsStr}`;
        });

        return weightLines.join('\n');
      })
      .join('\n');

    await navigator.clipboard.writeText(sessionText);
  } catch (error) {
    console.error('Failed to copy session:', error);
  }
};
