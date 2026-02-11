import { Program, ProgramExercise, WorkoutSet } from './types';

// Fonction pour obtenir le jour de la semaine en français
function getCurrentDayInFrench(): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const today = new Date();
  return days[today.getDay()];
}

// Fonction pour déterminer si une série est un échauffement
// Une série est considérée comme échauffement si sa charge est < 70% de la meilleure charge
export function isWarmupSet(set: WorkoutSet, bestPerformance: WorkoutSet | null): boolean {
  if (!bestPerformance) {
    return false; // Pas de référence, on compte la série
  }

  const bestWeight = bestPerformance.estimated1RM || bestPerformance.weight;
  const setWeight = set.estimated1RM || set.weight;

  // Une série est un échauffement si sa charge est < 70% de la meilleure charge
  const warmupThreshold = 0.7;
  return setWeight < (bestWeight * warmupThreshold);
}

// Fonction pour normaliser les noms de jours
function normalizeDayName(day: string): string {
  const dayMap: { [key: string]: string } = {
    // French variations
    lundi: 'Lundi',
    mardi: 'Mardi',
    mercredi: 'Mercredi',
    jeudi: 'Jeudi',
    vendredi: 'Vendredi',
    samedi: 'Samedi',
    dimanche: 'Dimanche',
    // English variations
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
    // Short variations
    lun: 'Lundi',
    mar: 'Mardi',
    mer: 'Mercredi',
    jeu: 'Jeudi',
    ven: 'Vendredi',
    sam: 'Samedi',
    dim: 'Dimanche',
    mon: 'Lundi',
    tue: 'Mardi',
    wed: 'Mercredi',
    thu: 'Jeudi',
    fri: 'Vendredi',
    sat: 'Samedi',
    sun: 'Dimanche',
    // Numeric variations (1 = Monday, 7 = Sunday)
    '1': 'Lundi',
    '2': 'Mardi',
    '3': 'Mercredi',
    '4': 'Jeudi',
    '5': 'Vendredi',
    '6': 'Samedi',
    '7': 'Dimanche',
  };

  const normalized = dayMap[day.toLowerCase().trim()];
  return normalized || day;
}

// Fonction pour obtenir les séries réalisées aujourd'hui par exercice
function getTodayExerciseStats(history: WorkoutSet[]): Map<string, WorkoutSet[]> {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const exerciseStats = new Map<string, WorkoutSet[]>();

  history
    .filter((set) => {
      const setDate = new Date(set.timestamp);
      return setDate >= todayStart;
    })
    .forEach((set) => {
      if (!exerciseStats.has(set.exerciseName)) {
        exerciseStats.set(set.exerciseName, []);
      }
      exerciseStats.get(set.exerciseName)!.push(set);
    });

  return exerciseStats;
}

// Fonction pour vérifier si un exercice est complété
function isExerciseCompleted(exercise: ProgramExercise, completedSets: WorkoutSet[]): boolean {
  return completedSets.length >= exercise.sets;
}

// Type pour une suggestion d'exercice
export interface ExerciseSuggestion {
  nextExercise: string | null;
  programName: string | null;
  blocName: string | null;
  completedSeries: number;
  totalSeries: number;
  suggestedReps: number | null;
  suggestedCharge: number | null;
  exerciseDetails: ProgramExercise | null;
  completedExercises: string[];
  remainingExercises: string[];
  isCompletingCurrentExercise: boolean;
}

// Fonction principale pour obtenir les suggestions (retourne maintenant un tableau)
export function getWorkoutSuggestions(
  programs: Program[],
  history: WorkoutSet[],
  selectedProgramId?: string,
  selectedDay?: string
): ExerciseSuggestion[] {
  const currentDay = selectedDay || getCurrentDayInFrench();
  const todayStats = getTodayExerciseStats(history);

  // Filtrer les programmes selon la sélection
  const programsToCheck = selectedProgramId
    ? programs.filter(program => program.id === selectedProgramId)
    : programs;

  const suggestions: ExerciseSuggestion[] = [];

  // Trouver le programme du jour actuel ou du programme sélectionné
  for (const program of programsToCheck) {
    const todayProgram = program.sessions.find((session) => {
      const normalizedDay = normalizeDayName(session.day);
      const normalizedCurrentDay = normalizeDayName(currentDay);
      return normalizedDay === normalizedCurrentDay;
    });

    const selectedProgram = todayProgram ?? program.sessions[0];

    if (selectedProgram) {
      // Collecter tous les exercices incomplets dans l'ordre
      for (const bloc of selectedProgram.blocs) {
        for (const exercise of bloc.exercises) {
          const completedSets = todayStats.get(exercise.exerciseName) || [];

          if (!isExerciseCompleted(exercise, completedSets)) {
            const completedExerciseNames = Array.from(todayStats.keys()).filter((exerciseName) => {
              const exerciseInProgram = selectedProgram.blocs
                .flatMap(b => b.exercises)
                .find((ex) => ex.exerciseName === exerciseName);
              return exerciseInProgram && isExerciseCompleted(exerciseInProgram, todayStats.get(exerciseName) || []);
            });

            const remainingInBloc = bloc.exercises
              .filter((ex) => !isExerciseCompleted(ex, todayStats.get(ex.exerciseName) || []))
              .map((ex) => ex.exerciseName);

            const allTimeSets = history.filter((set) => set.exerciseName === exercise.exerciseName);
            const allTimeBest = allTimeSets.reduce<any>((best, set) => {
              if (!best) return set;
              const bestScore = best.estimated1RM || best.weight * best.reps;
              const setScore = set.estimated1RM || set.weight * set.reps;
              return setScore > bestScore ? set : best;
            }, null);

            const suggestedCharge = allTimeBest ? parseFloat(allTimeBest.estimated1RM ?? allTimeBest.weight) : 0;

            // Filtrer les séries d'échauffement pour le compteur
            const workingSets = completedSets.filter(set => !isWarmupSet(set, allTimeBest));

            suggestions.push({
              nextExercise: exercise.exerciseName,
              programName: program.title,
              blocName: bloc.name,
              completedSeries: workingSets.length, // Utilise workingSets au lieu de completedSets
              totalSeries: exercise.sets,
              suggestedReps: parseInt(exercise.reps),
              suggestedCharge,
              exerciseDetails: exercise,
              completedExercises: completedExerciseNames,
              remainingExercises: remainingInBloc,
              isCompletingCurrentExercise: completedSets.length > 0,
            });
          }
        }
      }

      // Si aucune suggestion n'a été trouvée, tous les exercices sont terminés
      if (suggestions.length === 0) {
        const allCompletedExercises = Array.from(todayStats.keys());
        suggestions.push({
          nextExercise: null,
          programName: program.title,
          blocName: null,
          completedSeries: 0,
          totalSeries: 0,
          suggestedReps: null,
          suggestedCharge: null,
          exerciseDetails: null,
          completedExercises: allCompletedExercises,
          remainingExercises: [],
          isCompletingCurrentExercise: false,
        });
      }

      // Retourner les suggestions du premier programme trouvé
      return suggestions;
    }
  }

  // Aucun programme trouvé pour aujourd'hui
  return [{
    nextExercise: null,
    programName: null,
    blocName: null,
    completedSeries: 0,
    totalSeries: 0,
    suggestedReps: null,
    suggestedCharge: null,
    exerciseDetails: null,
    completedExercises: [],
    remainingExercises: [],
    isCompletingCurrentExercise: false,
  }];
}
