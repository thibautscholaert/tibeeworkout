import { z } from 'zod';

export const WORKOUT_VARIANTS = ['default', 'slow', 'explosive', 'tempo'] as const;
export type WorkoutVariant = (typeof WORKOUT_VARIANTS)[number];

export const setFormSchema = z.object({
  exerciseName: z.string().min(1, 'Select an exercise'),
  variant: z.enum(WORKOUT_VARIANTS, {
    required_error: 'Select a variant',
    invalid_type_error: 'Select a variant',
  }),
  weight: z.number().min(0, 'Weight must be positive').max(2000, 'Weight too high'),
  reps: z.number().int().min(1, 'At least 1 rep').max(100, 'Reps too high'),
});

export const noteFormSchema = z.object({
  note: z.string().min(1, 'Note cannot be empty').max(1000, 'Note too long'),
});

export type SetFormData = z.infer<typeof setFormSchema>;
export type NoteFormData = z.infer<typeof noteFormSchema>;
