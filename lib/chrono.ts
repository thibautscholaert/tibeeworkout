export const CHRONO_STATE_KEY = 'chronoState';
export const REST_ALERT_KEY = 'restAlert';
export const CHRONO_STATE_EVENT = 'chronoStateChange';

export interface ChronoState {
  time: number;
  isRunning: boolean;
  startTime: number | null;
  initialStartTime: number | null;
}

export interface RestAlertState {
  id: string;
  exerciseName: string;
  restSecondsRange: [number, number];
  startedAt: number;
  startElapsed: number;
  targetElapsed: number;
  targetElapsedRange: [number, number];
  dueAt: number;
  notifiedAt: number | null;
  notifiedAtRange: [number | null, number | null];
}

function dispatchChronoStateChange(state: ChronoState) {
  window.dispatchEvent(new CustomEvent(CHRONO_STATE_EVENT, { detail: state }));
}

export function readChronoState(): ChronoState | null {
  const savedState = localStorage.getItem(CHRONO_STATE_KEY);
  if (!savedState) return null;

  try {
    return JSON.parse(savedState) as ChronoState;
  } catch (error) {
    console.error("Erreur lors du chargement de l'état du chrono:", error);
    return null;
  }
}

export function writeChronoState(state: ChronoState, options: { emitEvent?: boolean } = {}) {
  localStorage.setItem(CHRONO_STATE_KEY, JSON.stringify(state));
  if (options.emitEvent ?? true) {
    dispatchChronoStateChange(state);
  }
}

export function startChronoIfNeeded(now = Date.now()): ChronoState {
  const currentState = readChronoState();
  if (currentState?.isRunning && currentState.initialStartTime) return currentState;

  const elapsed = getChronoElapsed(currentState, now);
  const state: ChronoState = {
    time: elapsed,
    isRunning: true,
    startTime: now,
    initialStartTime: now - elapsed,
  };

  writeChronoState(state);
  return state;
}

export function getChronoElapsed(state: ChronoState | null, now = Date.now()): number {
  if (!state) return 0;
  if (state.isRunning && state.initialStartTime) return Math.max(0, now - state.initialStartTime);
  return state.time || 0;
}

export function createRestAlert(exerciseName: string, restSecondsRange: [number, number], startElapsed: number, now = Date.now()): RestAlertState {
  const minRestSeconds = restSecondsRange[0];
  const maxRestSeconds = restSecondsRange[1];
  const alert: RestAlertState = {
    id: `${exerciseName}-${now}`,
    exerciseName,
    restSecondsRange,
    startedAt: now,
    startElapsed,
    targetElapsed: startElapsed + maxRestSeconds * 1000,
    targetElapsedRange: [startElapsed + minRestSeconds * 1000, startElapsed + maxRestSeconds * 1000],
    dueAt: now + maxRestSeconds * 1000,
    notifiedAt: null,
    notifiedAtRange: [null, null],
  };

  localStorage.setItem(REST_ALERT_KEY, JSON.stringify(alert));
  return alert;
}

export function readRestAlert(): RestAlertState | null {
  const savedAlert = localStorage.getItem(REST_ALERT_KEY);
  if (!savedAlert) return null;

  try {
    const parsed = JSON.parse(savedAlert) as RestAlertState;
    const startElapsed = parsed.startElapsed ?? 0;
    const [minRestSeconds, maxRestSeconds] = parsed.restSecondsRange;
    const targetElapsed = parsed.targetElapsed ?? startElapsed + maxRestSeconds * 1000;

    return {
      ...parsed,
      startElapsed,
      targetElapsed,
      targetElapsedRange: parsed.targetElapsedRange ?? [startElapsed + minRestSeconds * 1000, targetElapsed],
      notifiedAtRange: parsed.notifiedAtRange ?? [parsed.notifiedAt, parsed.notifiedAt],
    };
  } catch (error) {
    console.error("Erreur lors du chargement de l'alerte de repos:", error);
    return null;
  }
}

export function markRestAlertNotified(alert: RestAlertState, index: 0 | 1, now = Date.now()): RestAlertState {
  const notifiedAtRange: [number | null, number | null] = [...alert.notifiedAtRange];
  notifiedAtRange[index] = now;

  const updatedAlert: RestAlertState = {
    ...alert,
    notifiedAt: notifiedAtRange.every(Boolean) ? now : null,
    notifiedAtRange,
  };

  localStorage.setItem(REST_ALERT_KEY, JSON.stringify(updatedAlert));
  return updatedAlert;
}
