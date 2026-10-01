/**
 * Short chime for the kitchen display, synthesized with WebAudio (no asset to ship).
 * Browsers only allow audio after a user gesture, so the kitchen screen has a sound
 * toggle: enabling it counts as that gesture.
 */
let ctx: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  return ctx;
};

/** Call from a click handler to unlock audio. */
export const unlockAudio = async (): Promise<boolean> => {
  const c = getContext();
  if (!c) return false;
  if (c.state === 'suspended') await c.resume();
  return c.state === 'running';
};

/** Two-tone "new order" chime. */
export const playChime = (): void => {
  const c = getContext();
  if (!c || c.state !== 'running') return;
  const now = c.currentTime;
  [880, 1174.66].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + i * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.3, now + i * 0.18 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.28);
    osc.connect(gain).connect(c.destination);
    osc.start(now + i * 0.18);
    osc.stop(now + i * 0.18 + 0.3);
  });
};
