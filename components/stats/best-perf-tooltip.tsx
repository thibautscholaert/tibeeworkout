'use client';

import type { Exercise } from '@/lib/exercises';
import { formatWeight } from '@/lib/utils';
import { motion } from 'motion/react';

type BestPerfTooltipProps = {
  active?: boolean;
  payload?: { payload: { reps: number; weight: number; oneRM: number } }[];
  label?: string;
  exerciseData?: Exercise;
  selectedExercise: string;
};

export function BestPerfTooltip({ active, payload, label, exerciseData, selectedExercise }: BestPerfTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        className="rounded-lg border bg-background p-3 shadow-md"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <p className="text-sm font-medium mb-2">{label}</p>
        <motion.div className="space-y-1">
          {exerciseData?.bodyweight ? (
            <>
              <p className="text-sm">
                <span className="text-muted-foreground">Reps:</span> {data.reps} @{data.weight}kg
              </p>
              <p className="text-sm font-medium">
                <span className="text-muted-foreground">1RM:</span> {data.oneRM}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm">
                <span className="text-muted-foreground">Set:</span> {data.reps} reps × {formatWeight(data.weight, selectedExercise)}
              </p>
              <p className="text-sm font-medium">
                <span className="text-muted-foreground">1RM Estimé:</span> {formatWeight(data.oneRM, selectedExercise)}
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    );
  }
  return null;
}
