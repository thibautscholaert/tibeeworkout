export interface Exercise {
  name: string
  tags: string[]
  favorite: boolean
  isPowerlifting: boolean
  bodyweight: boolean
}

export const EXERCISES: Exercise[] = [
  // Legs
  { name: "Deadlift", tags: ["Back", "Legs"], favorite: true, isPowerlifting: true, bodyweight: false },
  { name: "Squat", tags: ["Legs"], favorite: true, isPowerlifting: true, bodyweight: false },
  { name: "Pistol squat", tags: ["Legs"], favorite: false, isPowerlifting: false, bodyweight: true },
  // Pulling
  { name: "Pull up", tags: ["Back"], favorite: true, isPowerlifting: false, bodyweight: true },
  { name: "Muscle up", tags: ["Back", "Arms"], favorite: true, isPowerlifting: false, bodyweight: true },
  { name: "Chin up", tags: ["Back", "Arms"], favorite: false, isPowerlifting: false, bodyweight: true },
  { name: "Hammer pull up", tags: ["Back", "Arms"], favorite: false, isPowerlifting: false, bodyweight: true },
  { name: "Body rows", tags: ["Back"], favorite: false, isPowerlifting: false, bodyweight: true },
  { name: "Ring rows", tags: ["Back"], favorite: true, isPowerlifting: false, bodyweight: true },
  { name: "Horizontal row", tags: ["Back"], favorite: false, isPowerlifting: false, bodyweight: true },
  { name: "Toes to bar", tags: ["Core", "Back"], favorite: false, isPowerlifting: false, bodyweight: true },
  { name: "Dead hang hold", tags: ["Back", "Grip"], favorite: true, isPowerlifting: false, bodyweight: true },
  { name: "Active hang hold", tags: ["Back", "Grip"], favorite: false, isPowerlifting: false, bodyweight: true },
  // Pushing
  { name: "Dips", tags: ["Arms", "Chest"], favorite: false, isPowerlifting: false, bodyweight: true },
  { name: "Bar dips", tags: ["Arms", "Chest"], favorite: false, isPowerlifting: false, bodyweight: true },
  { name: "Ring dips", tags: ["Arms", "Chest"], favorite: true, isPowerlifting: false, bodyweight: true },
  { name: "L-sit hold", tags: ["Core", "Arms"], favorite: false, isPowerlifting: false, bodyweight: true },
  { name: "Pseudo planche push up", tags: ["Chest", "Arms"], favorite: false, isPowerlifting: false, bodyweight: true },
  { name: "Handstand kicks", tags: ["Shoulders", "Core"], favorite: true, isPowerlifting: false, bodyweight: true },
]

export type ExerciseName = Exercise["name"]
