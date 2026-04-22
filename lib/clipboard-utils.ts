import { toast } from 'sonner';
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
    toast.success('Copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy session:', error);
    toast.error('Failed to copy to clipboard!');
  }
};

export const copyProgramToClipboard = async (program: any, sessionDay?: string) => {
  try {
    let sessionsToCopy = program.sessions;

    // Si un jour spécifique est fourni, ne copier que cette session
    if (sessionDay) {
      sessionsToCopy = program.sessions.filter((session: any) =>
        session.day.toLowerCase() === sessionDay.toLowerCase() ||
        session.session.toLowerCase() === sessionDay.toLowerCase()
      );
    }

    const programText = sessionsToCopy
      .map((session: any) => {

        const exercisesText = session.blocs
          .flatMap((bloc: any) => bloc.exercises)
          .map((exercise: any) => {
            const exerciseData = EXERCISES.find((ex) => ex.name.toLowerCase() === exercise.exerciseName.toLowerCase());
            const isTimeType = exerciseData?.repType === 'time';
            const isBodyweight = exerciseData?.bodyweight || false;

            // Formater le poids
            let weightText = '';
            if (exercise.charge && exercise.charge !== '0' && !isBodyweight) {
              weightText = ` @${exercise.charge}kg`;
            } else if (isBodyweight) {
              weightText = exercise.charge && exercise.charge !== '0' ? ` @${exercise.charge}kg` : ' BW';
            } else {
              weightText = '';
            }

            // Formater les reps
            let repsText = exercise.reps;
            if (isTimeType) {
              repsText = exercise.reps.includes('"') ? exercise.reps : `${exercise.reps}s`;
            }

            // Formater les séries
            const setsText = exercise.sets ? `${exercise.sets}x` : '';

            let exerciseLine = `${exercise.exerciseName} ${setsText}${repsText}${weightText}`;

            // Ajouter les notes si présentes
            if (exercise.notes) {
              exerciseLine += ` (${exercise.notes})`;
            }

            // Ajouter le temps de repos si présent
            if (exercise.recovery) {
              exerciseLine += ` [repos: ${exercise.recovery}]`;
            }

            return exerciseLine;
          })
          .join('\n');

        return exercisesText;
      })
      .join('\n');


    await navigator.clipboard.writeText(programText.trim());
    toast.success('Copied to clipboard!');

  } catch (error) {
    console.error('Failed to copy program:', error);
    toast.error('Failed to copy to clipboard!');

  }
};
