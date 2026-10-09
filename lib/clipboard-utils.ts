import { WorkoutEquipment, WorkoutVariant } from '@/lib/schemas';
import { Program, ProgramBloc, ProgramExercise, ProgramSession, WorkoutSet } from '@/lib/types';
import { toast } from 'sonner';
import { EXERCISES, getDefaultEquipment } from './exercises';
import { areSameVariants, getDayLabel, groupSetsByDate } from './utils';

export const copySessionToClipboard = async (sets: WorkoutSet[]) => {
  try {
    const sessionText = formatSessionSets(sets);
    await navigator.clipboard.writeText(sessionText);
    toast.success('Copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy session:', error);
    toast.error('Failed to copy to clipboard!');
  }
};

const formatSessionSets = (sets: WorkoutSet[]): string => {
  const groupedSets: { exerciseName: string; variants: WorkoutVariant[]; exoVariant?: string; equipment: WorkoutEquipment; sets: WorkoutSet[] }[] =
    [];

  sets.forEach((set) => {
    const variants = set.variants || [];
    const exoVariant = set.exoVariant;
    const equipment = set.equipment || 'floor';
    const previousGroup = groupedSets[groupedSets.length - 1];

    if (
      previousGroup &&
      previousGroup.exerciseName === set.exerciseName &&
      areSameVariants(previousGroup.variants, variants) &&
      previousGroup.exoVariant === exoVariant &&
      previousGroup.equipment === equipment
    ) {
      previousGroup.sets.push(set);
      return;
    }

    groupedSets.push({ exerciseName: set.exerciseName, variants, exoVariant, equipment, sets: [set] });
  });

  return groupedSets
    .map(({ exerciseName, variants, exoVariant, equipment, sets: exerciseSets }) => {
      const setsByWeight = exerciseSets.reduce(
        (acc, set) => {
          const weightKey = set.weight === 0 ? 'BW' : `${set.weight}kg`;
          if (!acc[weightKey]) acc[weightKey] = [];
          acc[weightKey].push(set.reps);
          return acc;
        },
        {} as Record<string, number[]>
      );
      const exerciseData = EXERCISES.find((ex) => ex.name.toLowerCase() === exerciseName.toLowerCase());
      const isTimeType = exerciseData?.repType === 'time';
      const variantLabel = variants.length > 0 ? ` (${variants.join(',')})` : '';
      const exoVariantLabel = exoVariant ? ` (${exoVariant})` : '';
      const exerciseLabel = `${exerciseName}${variantLabel}${exoVariantLabel} [${equipment}]`;
      return Object.entries(setsByWeight)
        .map(([weight, reps]) => {
          const repsStr = reps.map((rep) => (isTimeType ? `${rep}${exerciseData.repTypeUnit === 'minute' ? "'" : "''"}` : rep)).join('/');
          return `${exerciseLabel} ${weight} ${repsStr}`;
        })
        .join('\n');
    })
    .join('\n');
};

export const copyWeekToClipboard = async (weekSets: WorkoutSet[]) => {
  try {
    const byDate = groupSetsByDate(weekSets);
    const sortedDates = Array.from(byDate.entries()).sort((a, b) => new Date(a[0] as string).getTime() - new Date(b[0] as string).getTime());

    const weekText = sortedDates
      .map(([dateStr, sets]) => {
        const dayLabel = getDayLabel(new Date(dateStr as string));
        const sessionText = formatSessionSets(sets);
        return `[${dayLabel}]\n${sessionText}`;
      })
      .join('\n\n');

    await navigator.clipboard.writeText(weekText);
    toast.success('Semaine copiée !');
  } catch (error) {
    console.error('Failed to copy week:', error);
    toast.error('Échec de la copie');
  }
};

export const copyProgramToClipboard = async (program: Program, sessionDay?: string) => {
  try {
    let sessionsToCopy = program.sessions;

    // Si un jour spécifique est fourni, ne copier que cette session
    if (sessionDay) {
      sessionsToCopy = program.sessions.filter(
        (session: ProgramSession) =>
          session.day.toLowerCase() === sessionDay.toLowerCase() || session.session.toLowerCase() === sessionDay.toLowerCase()
      );
    }

    const sessionsByDay = new Map<string, { day: string; sessions: ProgramSession[] }>();
    sessionsToCopy.forEach((session) => {
      const dayKey = session.day.toLowerCase();
      const dayGroup = sessionsByDay.get(dayKey) || { day: session.day, sessions: [] };
      dayGroup.sessions.push(session);
      sessionsByDay.set(dayKey, dayGroup);
    });

    const programText = Array.from(sessionsByDay.values())
      .map(({ day, sessions }) => {
        const exercisesText = sessions
          .flatMap((session) => session.blocs)
          .flatMap((bloc: ProgramBloc) => bloc.exercises)
          .map((exercise: ProgramExercise) => {
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
              repsText = exercise.reps.includes('"') ? exercise.reps : `${exercise.reps}${exerciseData.repTypeUnit === 'minute' ? "'" : "''"}`;
            }

            // Formater les séries
            const setsText = exercise.sets && exercise.sets > 1 ? `${exercise.sets}x` : '';

            const variantLabel = exercise.variants.length > 0 ? ` - ${exercise.variants.join(',')}` : '';
            const equipment = exercise.equipment || getDefaultEquipment(exercise.exerciseName);
            const exerciseLabel = `${exercise.exerciseName}${variantLabel} [${equipment}]`;
            let exerciseLine = `${exerciseLabel} ${setsText}${repsText}${weightText}`;

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

        return `[${day}]\n${exercisesText}`;
      })
      .join('\n\n');

    await navigator.clipboard.writeText(programText.trim());
    toast.success('Copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy program:', error);
    toast.error('Failed to copy to clipboard!');
  }
};
