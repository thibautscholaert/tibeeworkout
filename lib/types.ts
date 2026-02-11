export interface WorkoutSet {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  timestamp: Date;
  estimated1RM?: number;
}

export interface WorkoutSession {
  date: string;
  sets: WorkoutSet[];
}

export interface ExerciseHistory {
  exerciseName: string;
  sessions: {
    date: string;
    sets: WorkoutSet[];
  }[];
}

export interface Program {
  id: string;
  title: string;
  sessions: ProgramSession[];
}

export interface ProgramSession {
  session: string;
  day: string;
  blocs: ProgramBloc[];
}

export interface ProgramBloc {
  name: string;
  exercises: ProgramExercise[];
}

export interface ProgramExercise {
  exerciseName: string;
  sets: number;
  reps: string;
  charge?: string;
  recovery?: string;
  notes?: string;
}
