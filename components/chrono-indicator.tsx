'use client';

import { CHRONO_STATE_EVENT, readChronoState, type ChronoState } from '@/lib/chrono';
import { cn } from '@/lib/utils';
import { Timer } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function ChronoIndicator() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [initialStartTime, setInitialStartTime] = useState<number | null>(null);

  // Charger l'état depuis localStorage
  useEffect(() => {
    const applyState = (parsed: ChronoState | null) => {
      if (!parsed) return;

      if (parsed.isRunning && parsed.initialStartTime) {
        const elapsed = Date.now() - parsed.initialStartTime;
        setTime(elapsed);
        setIsRunning(true);
        setStartTime(parsed.startTime);
        setInitialStartTime(parsed.initialStartTime);
      } else {
        setTime(parsed.time || 0);
        setIsRunning(false);
        setStartTime(null);
        setInitialStartTime(parsed.initialStartTime);
      }
    };

    const loadState = () => applyState(readChronoState());

    loadState();

    // Écouter les changements dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chronoState') {
        loadState();
      }
    };
    const handleChronoStateChange = (event: Event) => {
      applyState((event as CustomEvent<ChronoState>).detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CHRONO_STATE_EVENT, handleChronoStateChange);

    // Mettre à jour le temps si le chrono est en cours
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && initialStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - initialStartTime;
        setTime(elapsed);
      }, 100);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CHRONO_STATE_EVENT, handleChronoStateChange);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime, initialStartTime]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Ne rien afficher si le chrono est à 0 et pas en cours
  if (time === 0 && !isRunning) {
    return null;
  }

  return (
    <Link href="/chrono">
      <div
        className={cn(
          'flex items-center gap-4 px-3 py-1.5 rounded-full transition-all duration-200',
          'bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30',
          isRunning && 'animate-pulse'
        )}
      >
        <Timer className={cn('h-5 w-5', isRunning ? 'text-primary' : 'text-muted-foreground')} />
        <span className={cn('text-2xl font-mono font-medium', isRunning ? 'text-primary' : 'text-muted-foreground')}>{formatTime(time)}</span>
        {isRunning && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
      </div>
    </Link>
  );
}
