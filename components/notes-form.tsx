'use client';

import { saveNote } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { NoteFormData } from '@/lib/schemas';
import { noteFormSchema } from '@/lib/schemas';
import { ExerciseNote } from '@/lib/types';
import { useWorkout } from '@/lib/workout-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, NotebookIcon, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function NotesForm({ selectedExercise, note }: { selectedExercise: string; note?: ExerciseNote }) {
  const { fetchNotes } = useWorkout();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      note: '',
    },
  });

  useEffect(() => {
    reset({
      note: note?.note || '',
    });
  }, [note, reset]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const onSubmit = useCallback(async (data: NoteFormData) => {
    setIsSubmitting(true);
    try {
      const result = await saveNote({
        ...data,
        exerciseName: selectedExercise,
        timestamp: new Date(),
      });

      if (result.success) {
        toast.success('Note saved successfully!');
        handleReset();
        fetchNotes(true); // Force refresh to bypass cache
      } else {
        toast.error(result.error || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedExercise, handleReset, fetchNotes]);



  return (
    <Card className="border-border/50">
      <CardContent className="p-2">
        <div className="flex items-center gap-2 mb-4">
          <NotebookIcon className="h-5 w-5 text-primary" />
          <Label htmlFor="note" className="text-base font-semibold">{selectedExercise}</Label>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Note Input */}
          <div className="space-y-2">
            <textarea
              id="note"
              {...register('note')}
              rows={4}
              placeholder="Enter your exercise notes here..."
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[100px]"
              disabled={isSubmitting}
            />
            {errors.note && <p className="text-sm text-destructive">{errors.note.message}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'Saving...' : 'Save Note'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          </div>
        </form>


      </CardContent>
    </Card>
  );
}
