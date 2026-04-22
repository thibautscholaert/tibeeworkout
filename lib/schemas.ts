import { z } from 'zod';

export const setFormSchema = z.object({
  exerciseName: z.string().min(1, 'Select an exercise'),
  weight: z.number().min(0, 'Weight must be positive').max(2000, 'Weight too high'),
  reps: z.number().int().min(1, 'At least 1 rep').max(100, 'Reps too high'),
});

export const noteFormSchema = z.object({
  note: z.string().min(1, 'Note cannot be empty').max(1000, 'Note too long'),
});

export type SetFormData = z.infer<typeof setFormSchema>;
export type NoteFormData = z.infer<typeof noteFormSchema>;
