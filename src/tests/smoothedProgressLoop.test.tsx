import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useRef, act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useSmoothedProgress } from '../hooks/useSmoothedProgress';

// Minimal controllable requestAnimationFrame so the loop can be stepped by hand
function installRafHarness() {
  let nextId = 1;
  // Share the real clock's origin: the hook seeds its first delta from performance.now()
  let now = performance.now();
  const queued = new Map<number, FrameRequestCallback>();

  window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    const id = nextId++;
    queued.set(id, cb);
    return id;
  }) as typeof window.requestAnimationFrame;

  window.cancelAnimationFrame = ((id: number) => {
    queued.delete(id);
  }) as typeof window.cancelAnimationFrame;

  return {
    get pending() {
      return queued.size;
    },
    /** Runs every callback queued at the time of the call, advancing the clock by 16ms. */
    step() {
      now += 16;
      const batch = [...queued.entries()];
      queued.clear();
      batch.forEach(([, cb]) => cb(now));
      return batch.length;
    },
  };
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useSmoothedProgress render loop', () => {
  let container: HTMLDivElement;
  let root: Root;
  let raf: ReturnType<typeof installRafHarness>;
  const ticks: number[] = [];

  const Probe = () => {
    const targetRef = useRef<number>(1);
    useSmoothedProgress(targetRef, (rendered) => ticks.push(rendered));
    return null;
  };

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    ticks.length = 0;
    raf = installRafHarness();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it('keeps exactly one frame in flight across a hide/show cycle', () => {
    setHidden(false);
    act(() => root.render(<Probe />));

    expect(raf.pending).toBe(1);

    // Hiding stops the loop entirely
    act(() => setHidden(true));
    expect(raf.pending).toBe(0);

    // Showing restarts it — and must not leave a second loop running
    act(() => setHidden(false));
    expect(raf.pending).toBe(1);

    act(() => {
      expect(raf.step()).toBe(1);
    });
    expect(raf.pending).toBe(1);
  });

  it('does not start a second loop when mounted while the page is hidden', () => {
    setHidden(true);
    act(() => root.render(<Probe />));

    // Nothing may be queued while hidden, otherwise that stale frame fires on unhide
    // alongside the one the visibility handler schedules.
    expect(raf.pending).toBe(0);

    act(() => setHidden(false));
    expect(raf.pending).toBe(1);

    act(() => {
      raf.step();
    });
    expect(raf.pending).toBe(1);
    expect(ticks).toHaveLength(1);
  });

  it('advances rendered progress toward the target on each frame', () => {
    setHidden(false);
    act(() => root.render(<Probe />));

    act(() => {
      raf.step();
      raf.step();
      raf.step();
    });

    expect(ticks).toHaveLength(3);
    expect(ticks[0]).toBeGreaterThan(0);
    expect(ticks[2]).toBeGreaterThan(ticks[0]);
    expect(ticks[2]).toBeLessThanOrEqual(1);
  });

  it('stops the loop on unmount', () => {
    setHidden(false);
    act(() => root.render(<Probe />));
    expect(raf.pending).toBe(1);

    act(() => root.render(<></>));
    expect(raf.pending).toBe(0);
  });
});
