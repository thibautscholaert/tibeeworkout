'use client';

import { CHRONO_STATE_EVENT, ChronoState, clearChronoState, getChronoElapsed, readChronoState, writeChronoState } from '@/lib/chrono';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';
import React, { useEffect, useState } from 'react';

function formatChronoTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function ChronoIndicator() {
  const [chronoState, setChronoState] = useState<ChronoState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Synchro avec l'état stocké dans la lib
  useEffect(() => {
    const syncState = () => {
      const current = readChronoState();
      setChronoState(current);
      if (current) {
        setElapsedSeconds(Math.floor(getChronoElapsed(current) / 1000));
      } else {
        setElapsedSeconds(0);
      }
    };

    syncState();

    const handleStateChange = (e: CustomEvent<ChronoState>) => {
      const newState = e.detail;
      setChronoState(newState);
      if (newState) {
        setElapsedSeconds(Math.floor(getChronoElapsed(newState) / 1000));
      } else {
        setElapsedSeconds(0);
      }
    };

    window.addEventListener(CHRONO_STATE_EVENT as any, handleStateChange);
    return () => {
      window.removeEventListener(CHRONO_STATE_EVENT as any, handleStateChange);
    };
  }, []);

  // Tick du chrono
  useEffect(() => {
    if (!chronoState?.isRunning) return;

    const interval = setInterval(() => {
      const elapsedMs = getChronoElapsed(chronoState);
      setElapsedSeconds(Math.floor(elapsedMs / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [chronoState]);

  // Actions
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();

    if (!chronoState || !chronoState.isRunning) {
      // Démarrage ou Reprise
      const currentElapsed = getChronoElapsed(chronoState, now);
      const newState: ChronoState = {
        time: currentElapsed,
        isRunning: true,
        startTime: now,
        initialStartTime: now - currentElapsed,
      };
      writeChronoState(newState);
    } else {
      // Pause
      const currentElapsed = getChronoElapsed(chronoState, now);
      const newState: ChronoState = {
        time: currentElapsed,
        isRunning: false,
        startTime: null,
        initialStartTime: null,
      };
      writeChronoState(newState);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearChronoState();
    writeChronoState(
      {
        time: 0,
        isRunning: false,
        startTime: null,
        initialStartTime: null,
      },
      { emitEvent: true }
    );
  };

  const isRunning = chronoState?.isRunning ?? false;
  const hasStarted = elapsedSeconds > 0 || isRunning;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 px-4 py-2 shadow-md backdrop-blur-md">
      {/* Icône du chrono */}
      <Timer className={`h-7 w-7 text-green-600 ${isRunning ? 'animate-pulse' : ''}`} />

      {/* Affichage du temps agrandi */}
      <span className="font-mono text-3xl font-semibold tabular-nums text-foreground min-w-[60px] text-center tracking-wide">
        {formatChronoTime(elapsedSeconds)}
      </span>

      {/* Zone de boutons d'action */}
      <div className="flex items-center gap-1 pl-1 border-l border-primary/20">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="p-1 rounded-lg text-white transition-colors focus:outline-none w-8"
          title={isRunning ? 'Mettre en pause' : 'Démarrer le chrono'}
          aria-label={isRunning ? 'Mettre en pause' : 'Démarrer le chrono'}
        >
          {isRunning ? (
            <Pause className="h-6 w-6 text-amber-600 fill-amber-600" />
          ) : (
            <Play className="h-6 w-6 text-green-600 fill-green-600 ml-0.5" />
          )}
        </button>

        {/* Reset */}
        {/* {hasStarted && ( */}
        <button
          type="button"
          onClick={handleReset}
          className={`p-1.5 rounded-lg ${hasStarted ? 'text-white' : 'text-muted'} transition-colors focus:outline-none`}
          title="Réinitialiser le chrono"
          aria-label="Réinitialiser le chrono"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        {/* )} */}
      </div>
    </div>
  );
}
