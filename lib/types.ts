import type { WorkoutEquipment, WorkoutVariant } from './schemas';

export interface WorkoutSet {
  id: string;
  exerciseName: string;
  variant: WorkoutVariant;
  equipment: WorkoutEquipment;
  weight: number;
  reps: number;
  timestamp: Date;
  sourceTimestamp?: string;
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
  variant: WorkoutVariant;
  equipment?: WorkoutEquipment;
  sets: number;
  reps: string;
  charge?: string;
  recovery?: string;
  notes?: string;
}

export interface ExerciseNote {
  id: string;
  exerciseName: string;
  note: string;
  timestamp: Date;
}

export interface TutorialVideo {
  id: string;
  exerciseName: string;
  youtubeId: string;
  label: string;
  timestamp: Date;
}

export interface Profile {
  name: string;
  dob: string;
  weight: number;
  size: string;
}
