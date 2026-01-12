import { Program, ProgramExercise, WorkoutSet } from "./types"

// Fonction pour obtenir le jour de la semaine en français
function getCurrentDayInFrench(): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const today = new Date()
    return days[today.getDay()]
}

// Fonction pour normaliser les noms de jours
function normalizeDayName(day: string): string {
    const dayMap: { [key: string]: string } = {
        'lundi': 'Lundi',
        'mardi': 'Mardi',
        'mercredi': 'Mercredi',
        'jeudi': 'Jeudi',
        'vendredi': 'Vendredi',
        'samedi': 'Samedi',
        'dimanche': 'Dimanche',
        'monday': 'Lundi',
        'tuesday': 'Mardi',
        'wednesday': 'Mercredi',
        'thursday': 'Jeudi',
        'friday': 'Vendredi',
        'saturday': 'Samedi',
        'sunday': 'Dimanche'
    }

    return dayMap[day.toLowerCase()] || day
}

// Fonction pour obtenir les séries réalisées aujourd'hui par exercice
function getTodayExerciseStats(history: WorkoutSet[]): Map<string, WorkoutSet[]> {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const exerciseStats = new Map<string, WorkoutSet[]>()

    history
        .filter(set => {
            const setDate = new Date(set.timestamp)
            return setDate >= todayStart
        })
        .forEach(set => {
            if (!exerciseStats.has(set.exerciseName)) {
                exerciseStats.set(set.exerciseName, [])
            }
            exerciseStats.get(set.exerciseName)!.push(set)
        })

    return exerciseStats
}

// Fonction pour vérifier si un exercice est complété
function isExerciseCompleted(exercise: ProgramExercise, completedSets: WorkoutSet[]): boolean {
    return completedSets.length >= exercise.sets
}

// Fonction principale pour obtenir les suggestions
export function getWorkoutSuggestions(
    programs: Program[],
    history: WorkoutSet[]
): {
    nextExercise: string | null
    programName: string | null
    blocName: string | null
    completedSeries: number
    totalSeries: number
    suggestedReps: string | null
    exerciseDetails: ProgramExercise | null
    completedExercises: string[]
    remainingExercises: string[]
    isCompletingCurrentExercise: boolean
} {
    const currentDay = getCurrentDayInFrench()
    const todayStats = getTodayExerciseStats(history)

    // Trouver le programme du jour actuel
    for (const program of programs) {
        const todayProgram = program.days.find(day =>
            normalizeDayName(day.day) === currentDay
        )

        if (todayProgram) {
            // Parcourir les blocs dans l'ordre
            for (const bloc of todayProgram.blocs) {
                // Trouver le premier exercice non complété dans ce bloc
                for (const exercise of bloc.exercises) {
                    const completedSets = todayStats.get(exercise.exerciseName) || []

                    if (!isExerciseCompleted(exercise, completedSets)) {
                        const completedExerciseNames = Array.from(todayStats.keys())
                            .filter(exerciseName => {
                                const exerciseInProgram = bloc.exercises.find(ex => ex.exerciseName === exerciseName)
                                return exerciseInProgram && isExerciseCompleted(exerciseInProgram, todayStats.get(exerciseName) || [])
                            })

                        const remainingInBloc = bloc.exercises
                            .filter(ex => !isExerciseCompleted(ex, todayStats.get(ex.exerciseName) || []))
                            .map(ex => ex.exerciseName)

                        return {
                            nextExercise: exercise.exerciseName,
                            programName: program.title,
                            blocName: bloc.name,
                            completedSeries: completedSets.length,
                            totalSeries: exercise.sets,
                            suggestedReps: exercise.reps,
                            exerciseDetails: exercise,
                            completedExercises: completedExerciseNames,
                            remainingExercises: remainingInBloc,
                            isCompletingCurrentExercise: completedSets.length > 0
                        }
                    }
                }
            }

            // Si tous les exercices du jour sont terminés
            const allCompletedExercises = Array.from(todayStats.keys())
            return {
                nextExercise: null,
                programName: program.title,
                blocName: null,
                completedSeries: 0,
                totalSeries: 0,
                suggestedReps: null,
                exerciseDetails: null,
                completedExercises: allCompletedExercises,
                remainingExercises: [],
                isCompletingCurrentExercise: false
            }
        }
    }

    // Aucun programme trouvé pour aujourd'hui
    return {
        nextExercise: null,
        programName: null,
        blocName: null,
        completedSeries: 0,
        totalSeries: 0,
        suggestedReps: null,
        exerciseDetails: null,
        completedExercises: [],
        remainingExercises: [],
        isCompletingCurrentExercise: false
    }
}