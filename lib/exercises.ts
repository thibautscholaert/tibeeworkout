export const EXERCISES = [
  // Chest
  "Bench Press",
  "Incline Bench Press",
  "Decline Bench Press",
  "Dumbbell Press",
  "Dumbbell Fly",
  "Cable Fly",
  "Push-ups",
  // Back
  "Deadlift",
  "Barbell Row",
  "Pull-ups",
  "Lat Pulldown",
  "Seated Cable Row",
  "T-Bar Row",
  "Face Pull",
  // Shoulders
  "Overhead Press",
  "Lateral Raise",
  "Front Raise",
  "Rear Delt Fly",
  "Arnold Press",
  // Legs
  "Squat",
  "Front Squat",
  "Leg Press",
  "Romanian Deadlift",
  "Leg Curl",
  "Leg Extension",
  "Calf Raise",
  "Lunges",
  // Arms
  "Barbell Curl",
  "Dumbbell Curl",
  "Hammer Curl",
  "Tricep Pushdown",
  "Skull Crusher",
  "Tricep Dip",
] as const

export type ExerciseName = (typeof EXERCISES)[number]
