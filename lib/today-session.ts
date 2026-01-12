import { WorkoutSet } from "./types"

// Fonction pour obtenir les séries d'aujourd'hui
export function getTodaySession(history: WorkoutSet[]): WorkoutSet[] {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    return history
        .filter(set => {
            const setDate = new Date(set.timestamp)
            return setDate >= todayStart && setDate < todayEnd
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Trier par ordre chronologique
}

// Fonction pour grouper les séries par exercice avec comptage
export function groupTodaySessionByExercise(todaySession: WorkoutSet[]): {
    exerciseName: string
    sets: WorkoutSet[]
    totalSets: number
}[] {
    const exerciseGroups = new Map<string, WorkoutSet[]>()

    todaySession.forEach(set => {
        if (!exerciseGroups.has(set.exerciseName)) {
            exerciseGroups.set(set.exerciseName, [])
        }
        exerciseGroups.get(set.exerciseName)!.push(set)
    })

    return Array.from(exerciseGroups.entries()).map(([exerciseName, sets]) => ({
        exerciseName,
        sets,
        totalSets: sets.length
    }))
}