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
  dueAt: number;
  notifiedAt: number | null;
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
  const maxRestSeconds = restSecondsRange[1];
  const alert: RestAlertState = {
    id: `${exerciseName}-${now}`,
    exerciseName,
    restSecondsRange,
    startedAt: now,
    startElapsed,
    targetElapsed: startElapsed + maxRestSeconds * 1000,
    dueAt: now + maxRestSeconds * 1000,
    notifiedAt: null,
  };

  localStorage.setItem(REST_ALERT_KEY, JSON.stringify(alert));
  return alert;
}

export function readRestAlert(): RestAlertState | null {
  const savedAlert = localStorage.getItem(REST_ALERT_KEY);
  if (!savedAlert) return null;

  try {
    const parsed = JSON.parse(savedAlert) as RestAlertState;
    if (parsed.targetElapsed === undefined) {
      const maxRestSeconds = parsed.restSecondsRange[1];
      return {
        ...parsed,
        startElapsed: parsed.startElapsed ?? 0,
        targetElapsed: (parsed.startElapsed ?? 0) + maxRestSeconds * 1000,
      };
    }
    return parsed;
  } catch (error) {
    console.error("Erreur lors du chargement de l'alerte de repos:", error);
    return null;
  }
}

export function markRestAlertNotified(alert: RestAlertState, now = Date.now()) {
  localStorage.setItem(REST_ALERT_KEY, JSON.stringify({ ...alert, notifiedAt: now }));
}
