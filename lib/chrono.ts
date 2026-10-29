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

export const MAX_CHRONO_DURATION_MS = 2 * 60 * 60 * 1000; // 2 heures en ms (7 200 000 ms)

export function clearChronoState() {
  localStorage.removeItem(CHRONO_STATE_KEY);
  localStorage.removeItem(REST_ALERT_KEY);
}

export function readChronoState(now = Date.now()): ChronoState | null {
  const savedState = localStorage.getItem(CHRONO_STATE_KEY);
  if (!savedState) return null;

  try {
    const state = JSON.parse(savedState) as ChronoState;

    // Calcul du temps écoulé réel
    const elapsed = getChronoElapsed(state, now);

    // Si la durée dépasse 2 heures, on réinitialise complètement
    if (elapsed > MAX_CHRONO_DURATION_MS) {
      clearChronoState();
      dispatchChronoStateChange({
        time: 0,
        isRunning: false,
        startTime: null,
        initialStartTime: null,
      });
      return null;
    }

    return state;
  } catch (error) {
    console.error("Erreur lors du chargement de l'état du chrono:", error);
    clearChronoState();
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

export function readRestAlert(now = Date.now()): RestAlertState | null {
  const savedAlert = localStorage.getItem(REST_ALERT_KEY);
  if (!savedAlert) return null;

  try {
    const parsed = JSON.parse(savedAlert) as RestAlertState;

    // Si le temps écoulé depuis le début de la séance dépasse 2h
    // ou si l'alerte est dépassée depuis plus de 2h
    const timeSinceAlert = now - parsed.startedAt;
    if (timeSinceAlert > MAX_CHRONO_DURATION_MS) {
      localStorage.removeItem(REST_ALERT_KEY);
      return null;
    }

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
    localStorage.removeItem(REST_ALERT_KEY);
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

export const MAX_CHRONO_DURATION_SECONDS = 7200; // 2 heures

export function shouldResetChrono(elapsedSeconds: number): boolean {
  return elapsedSeconds > MAX_CHRONO_DURATION_SECONDS;
}
