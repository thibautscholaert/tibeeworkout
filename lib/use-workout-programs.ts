import { getPrograms } from '@/app/actions';
import { Program } from '@/lib/types';
import { useEffect, useState } from 'react';

export function useWorkoutPrograms() {
  const [workoutPrograms, setWorkoutPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const result = await getPrograms();
      if (result.success) {
        setWorkoutPrograms(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch programs');
      }
    } catch (err) {
      setError('Failed to fetch programs');
      console.error('Error fetching programs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return {
    workoutPrograms,
    isLoading,
    error,
    fetchPrograms,
  };
}
