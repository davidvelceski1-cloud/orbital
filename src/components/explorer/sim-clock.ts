/**
 * Mutable simulation clock read by the render loop every frame.
 * React state (useExplorer.time) is synced from it a few times per second for the UI,
 * so the 3D scene animates without re-rendering React 60 times a second.
 */
export const simClock = {
  /** Simulated time, epoch ms */
  t: Date.now(),
};

export function setSimTime(t: number) {
  simClock.t = t;
}
